export type TimerMode = 'focus' | 'break'
export type TimerPhase = 'idle' | 'running' | 'paused' | 'completed'

export interface TimerSnapshot {
  mode: TimerMode
  phase: TimerPhase
  durationMs: number
  remainingMs: number
  endAt: number | null
  startedAt: number | null
  pauseCount: number
}

export interface FocusSession {
  id: string
  task: string
  plannedMinutes: number
  actualMinutes: number
  pauseCount: number
  completed: boolean
  completedAt: string
}

export interface FocusRecommendation {
  suggestedMinutes: number
  currentMinutes: number
  completionRate: number
  averagePauses: number
  reason: string
  direction: 'increase' | 'decrease' | 'keep'
}
