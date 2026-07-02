import { describe, expect, it } from 'vitest'
import { clamp, computeRemaining, formatTime } from '../lib/time'

describe('time utilities', () => {
  it('按绝对结束时间计算剩余毫秒数', () => {
    expect(computeRemaining(10_000, 2_500)).toBe(7_500)
  })

  it('结束后剩余时间不会成为负数', () => {
    expect(computeRemaining(1_000, 2_000)).toBe(0)
  })

  it('显示时间采用向上取整，避免提前显示 00:00', () => {
    expect(formatTime(60_001)).toBe('01:01')
    expect(formatTime(60_000)).toBe('01:00')
    expect(formatTime(999)).toBe('00:01')
  })

  it('限制数值上下界', () => {
    expect(clamp(10, 15, 50)).toBe(15)
    expect(clamp(55, 15, 50)).toBe(50)
    expect(clamp(30, 15, 50)).toBe(30)
  })
})
