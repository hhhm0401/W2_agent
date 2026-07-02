import { describe, expect, it } from 'vitest'
import { createRecommendation } from '../lib/recommendation'
import type { FocusSession } from '../types'

const session = (
  id: number,
  completed = true,
  pauseCount = 0,
): FocusSession => ({
  id: String(id),
  task: `任务 ${id}`,
  plannedMinutes: 25,
  actualMinutes: completed ? 25 : 8,
  pauseCount,
  completed,
  completedAt: new Date(2026, 6, id).toISOString(),
})

describe('createRecommendation', () => {
  it('少于三条记录时不生成建议', () => {
    expect(createRecommendation([session(1), session(2)], 25)).toBeNull()
  })

  it('高完成率且低暂停时增加五分钟', () => {
    const result = createRecommendation(
      [session(1), session(2), session(3), session(4)],
      25,
    )
    expect(result?.direction).toBe('increase')
    expect(result?.suggestedMinutes).toBe(30)
    expect(result?.reason).toContain('完成率 100%')
  })

  it('完成率过低时减少五分钟', () => {
    const result = createRecommendation(
      [session(1, false), session(2, false), session(3, true)],
      25,
    )
    expect(result?.direction).toBe('decrease')
    expect(result?.suggestedMinutes).toBe(20)
  })

  it('平均暂停次数过高时减少五分钟', () => {
    const result = createRecommendation(
      [session(1, true, 3), session(2, true, 2), session(3, true, 2)],
      25,
    )
    expect(result?.direction).toBe('decrease')
    expect(result?.averagePauses).toBeGreaterThanOrEqual(2)
  })

  it('建议始终限制在 15 到 50 分钟', () => {
    const low = createRecommendation(
      [session(1, false), session(2, false), session(3, false)],
      15,
    )
    const high = createRecommendation(
      [session(1), session(2), session(3)],
      50,
    )
    expect(low?.suggestedMinutes).toBe(15)
    expect(high?.suggestedMinutes).toBe(50)
  })

  it('建议后两轮内进入冷却期', () => {
    const sessions = [session(1), session(2), session(3), session(4)]
    expect(createRecommendation(sessions, 25, 3)).toBeNull()
    expect(createRecommendation(sessions, 25, 2)).not.toBeNull()
  })
})
