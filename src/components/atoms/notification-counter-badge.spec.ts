import { describe, expect, it } from 'vitest'

function formatBadgeLabel(count: number, maxCount = 99): string | null {
  if (count <= 0) return null
  return count > maxCount ? `${maxCount}+` : String(count)
}

describe('NotificationCounterBadge label formatting', () => {
  it('returns null when count is 0 or negative', () => {
    expect(formatBadgeLabel(0)).toBeNull()
    expect(formatBadgeLabel(-5)).toBeNull()
  })

  it('formats counts up to 9 correctly', () => {
    expect(formatBadgeLabel(1, 9)).toBe('1')
    expect(formatBadgeLabel(9, 9)).toBe('9')
  })

  it('caps counts above maxCount with a plus suffix', () => {
    expect(formatBadgeLabel(10, 9)).toBe('9+')
    expect(formatBadgeLabel(99, 9)).toBe('9+')
    expect(formatBadgeLabel(100, 99)).toBe('99+')
    expect(formatBadgeLabel(250, 99)).toBe('99+')
  })
})
