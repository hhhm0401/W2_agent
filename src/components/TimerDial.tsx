import type { TimerMode, TimerPhase } from '../types'
import { formatTime } from '../lib/time'

interface TimerDialProps {
  mode: TimerMode
  phase: TimerPhase
  remainingMs: number
  durationMs: number
}

const phaseLabel: Record<TimerPhase, string> = {
  idle: '准备',
  running: '进行中',
  paused: '已暂停',
  completed: '已完成',
}

export function TimerDial({ mode, phase, remainingMs, durationMs }: TimerDialProps) {
  const progress = durationMs > 0 ? 1 - remainingMs / durationMs : 0
  const rotation = Math.min(360, Math.max(0, progress * 360))

  return (
    <section className={`timer-dial timer-dial--${mode}`} aria-label="计时器">
      <div className="timer-dial__orbit" aria-hidden="true">
        <span className="timer-dial__hand" style={{ transform: `rotate(${rotation}deg)` }} />
        <span className="timer-dial__dot" style={{ transform: `rotate(${rotation}deg) translateY(-8.8rem)` }} />
      </div>
      <div className="timer-dial__content">
        <div className="timer-dial__meta">
          <span>{mode === 'focus' ? 'FOCUS / 专注' : 'BREAK / 休息'}</span>
          <span>{phaseLabel[phase]}</span>
        </div>
        <output className="timer-dial__time" aria-live="polite">
          {formatTime(remainingMs)}
        </output>
        <div className="timer-dial__progress" aria-label={`已完成 ${Math.round(progress * 100)}%`}>
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </section>
  )
}
