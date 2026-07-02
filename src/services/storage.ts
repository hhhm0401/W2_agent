import type { FocusSession, TimerSnapshot } from '../types'

const TIMER_KEY = 'bauhaus-focus/timer/v1'
const SESSIONS_KEY = 'bauhaus-focus/sessions/v1'
const SETTINGS_KEY = 'bauhaus-focus/settings/v1'

export interface AppSettings {
  focusMinutes: number
  breakMinutes: number
  task: string
  lastRecommendationAtCount: number
}

export const defaultSettings: AppSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  task: '',
  lastRecommendationAtCount: 0,
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const storage = {
  loadTimer(): TimerSnapshot | null {
    return safeParse<TimerSnapshot | null>(localStorage.getItem(TIMER_KEY), null)
  },
  saveTimer(snapshot: TimerSnapshot) {
    localStorage.setItem(TIMER_KEY, JSON.stringify(snapshot))
  },
  loadSessions(): FocusSession[] {
    return safeParse<FocusSession[]>(localStorage.getItem(SESSIONS_KEY), [])
  },
  saveSessions(sessions: FocusSession[]) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 30)))
  },
  loadSettings(): AppSettings {
    return {
      ...defaultSettings,
      ...safeParse<Partial<AppSettings>>(localStorage.getItem(SETTINGS_KEY), {}),
    }
  },
  saveSettings(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },
}
