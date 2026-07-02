export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export function computeRemaining(endAt: number, now = Date.now()): number {
  return Math.max(0, endAt - now)
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
