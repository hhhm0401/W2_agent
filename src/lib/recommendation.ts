import type { FocusRecommendation, FocusSession } from '../types'
import { clamp } from './time'

const MIN_SESSIONS = 3
const MAX_SAMPLE = 8
const COOLDOWN_SESSIONS = 2

export function createRecommendation(
  sessions: FocusSession[],
  currentMinutes: number,
  lastRecommendationAtCount = 0,
): FocusRecommendation | null {
  const completedFocusSessions = sessions.slice(0, MAX_SAMPLE)

  if (completedFocusSessions.length < MIN_SESSIONS) return null
  if (sessions.length - lastRecommendationAtCount < COOLDOWN_SESSIONS) return null

  const completionRate =
    completedFocusSessions.filter((session) => session.completed).length /
    completedFocusSessions.length
  const averagePauses =
    completedFocusSessions.reduce((sum, session) => sum + session.pauseCount, 0) /
    completedFocusSessions.length

  let direction: FocusRecommendation['direction'] = 'keep'
  let suggestedMinutes = currentMinutes

  if (completionRate >= 0.8 && averagePauses <= 0.5) {
    direction = 'increase'
    suggestedMinutes = clamp(currentMinutes + 5, 15, 50)
  } else if (completionRate < 0.6 || averagePauses >= 2) {
    direction = 'decrease'
    suggestedMinutes = clamp(currentMinutes - 5, 15, 50)
  }

  const rateLabel = `${Math.round(completionRate * 100)}%`
  const pausesLabel = averagePauses.toFixed(1)
  const action =
    direction === 'increase'
      ? `状态稳定，建议增加到 ${suggestedMinutes} 分钟`
      : direction === 'decrease'
        ? `中断偏多，建议缩短到 ${suggestedMinutes} 分钟`
        : `节奏合适，建议维持 ${suggestedMinutes} 分钟`

  return {
    suggestedMinutes,
    currentMinutes,
    completionRate,
    averagePauses,
    reason: `近 ${completedFocusSessions.length} 轮完成率 ${rateLabel}，平均暂停 ${pausesLabel} 次；${action}。`,
    direction,
  }
}
