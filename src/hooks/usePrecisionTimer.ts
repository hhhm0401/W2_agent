import { useCallback, useEffect, useRef, useState } from 'react'
import { computeRemaining } from '../lib/time'
import { storage } from '../services/storage'
import type { TimerMode, TimerSnapshot } from '../types'

interface UsePrecisionTimerOptions {
  focusMinutes: number
  breakMinutes: number
  onComplete: (snapshot: TimerSnapshot) => void
}

const durationFor = (mode: TimerMode, focusMinutes: number, breakMinutes: number) =>
  (mode === 'focus' ? focusMinutes : breakMinutes) * 60_000

export function usePrecisionTimer({
  focusMinutes,
  breakMinutes,
  onComplete,
}: UsePrecisionTimerOptions) {
  const initial = useRef<TimerSnapshot | null>(null)
  if (initial.current === null) {
    const saved = storage.loadTimer()
    const fallbackDuration = durationFor('focus', focusMinutes, breakMinutes)
    if (saved?.phase === 'running' && saved.endAt) {
      const remaining = computeRemaining(saved.endAt)
      initial.current = {
        ...saved,
        remainingMs: remaining,
        phase: remaining > 0 ? 'running' : 'completed',
      }
    } else {
      initial.current =
        saved ?? {
          mode: 'focus',
          phase: 'idle',
          durationMs: fallbackDuration,
          remainingMs: fallbackDuration,
          endAt: null,
          startedAt: null,
          pauseCount: 0,
        }
    }
  }

  const [timer, setTimer] = useState<TimerSnapshot>(initial.current)
  const onCompleteRef = useRef(onComplete)
  const handledEndAtRef = useRef<number | null>(
    timer.phase === 'completed' ? timer.endAt : null,
  )

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    storage.saveTimer(timer)
    document.title = `${Math.ceil(timer.remainingMs / 60_000)}m · ${timer.mode === 'focus' ? '专注' : '休息'} — Pomodoro Timer`
  }, [timer])

  const reconcile = useCallback(() => {
    setTimer((current) => {
      if (current.phase !== 'running' || !current.endAt) return current
      const remainingMs = computeRemaining(current.endAt)
      if (remainingMs > 0) return { ...current, remainingMs }

      const completed = { ...current, remainingMs: 0, phase: 'completed' as const }
      if (handledEndAtRef.current !== current.endAt) {
        handledEndAtRef.current = current.endAt
        queueMicrotask(() => onCompleteRef.current(completed))
      }
      return completed
    })
  }, [])

  useEffect(() => {
    if (timer.phase !== 'running') return
    reconcile()
    const interval = window.setInterval(reconcile, 250)
    const onVisible = () => document.visibilityState === 'visible' && reconcile()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', reconcile)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', reconcile)
    }
  }, [reconcile, timer.phase])

  const start = () => {
    setTimer((current) => {
      if (current.phase === 'running' || current.phase === 'completed') return current
      const now = Date.now()
      const endAt = now + current.remainingMs
      handledEndAtRef.current = null
      return {
        ...current,
        phase: 'running',
        endAt,
        startedAt: current.startedAt ?? now,
      }
    })
  }

  const pause = () => {
    setTimer((current) => {
      if (current.phase !== 'running' || !current.endAt) return current
      return {
        ...current,
        phase: 'paused',
        remainingMs: computeRemaining(current.endAt),
        endAt: null,
        pauseCount: current.pauseCount + 1,
      }
    })
  }

  const reset = () => {
    setTimer((current) => {
      const durationMs = durationFor(current.mode, focusMinutes, breakMinutes)
      return {
        ...current,
        phase: 'idle',
        durationMs,
        remainingMs: durationMs,
        endAt: null,
        startedAt: null,
        pauseCount: 0,
      }
    })
  }

  const advance = () => {
    setTimer((current) => {
      const mode: TimerMode = current.mode === 'focus' ? 'break' : 'focus'
      const durationMs = durationFor(mode, focusMinutes, breakMinutes)
      handledEndAtRef.current = null
      return {
        mode,
        phase: 'idle',
        durationMs,
        remainingMs: durationMs,
        endAt: null,
        startedAt: null,
        pauseCount: 0,
      }
    })
  }

  const updateDuration = (mode: TimerMode, minutes: number) => {
    setTimer((current) => {
      if (current.mode !== mode || current.phase !== 'idle') return current
      const durationMs = minutes * 60_000
      return { ...current, durationMs, remainingMs: durationMs }
    })
  }

  return { timer, start, pause, reset, advance, updateDuration }
}
