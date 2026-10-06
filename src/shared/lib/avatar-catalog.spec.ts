import { describe, expect, it } from 'vitest'
import {
  AVATARS_CATALOG,
  AVATAR_CATEGORY_TABS,
  CIMA_CORPORATE_COLORS,
  getAvatarImageUrl,
  getRandomAvatarSelection,
} from './avatar-catalog'

describe('avatar-catalog', () => {
  it('contains exactly 84 catalog avatars', () => {
    expect(AVATARS_CATALOG).toHaveLength(84)
    const ids = AVATARS_CATALOG.map((a) => a.id)
    expect(new Set(ids).size).toBe(84)
  })

  it('contains 12 corporate colors with valid hex codes', () => {
    expect(CIMA_CORPORATE_COLORS).toHaveLength(12)
    const hexRegex = /^#[0-9a-fA-F]{6}$/
    for (const color of CIMA_CORPORATE_COLORS) {
      expect(color.hex).toMatch(hexRegex)
      expect(color.id).toBeTruthy()
      expect(color.name).toBeTruthy()
    }
  })

  it('defines 4 quick filter tabs', () => {
    expect(AVATAR_CATEGORY_TABS).toHaveLength(4)
    expect(AVATAR_CATEGORY_TABS.map((t) => t.id)).toEqual([
      'todos',
      'formal',
      'casual',
      'con-gafas',
    ])
  })

  it('generates correct avatar image webp url', () => {
    expect(getAvatarImageUrl(0)).toBe('/avatars/avatar-0.webp')
    expect(getAvatarImageUrl(42)).toBe('/avatars/avatar-42.webp')
  })

  it('generates valid random avatar selection', () => {
    for (let i = 0; i < 20; i++) {
      const selection = getRandomAvatarSelection()
      expect(selection.avatarId).toBeGreaterThanOrEqual(0)
      expect(selection.avatarId).toBeLessThan(84)
      const allowedHexes = CIMA_CORPORATE_COLORS.map((c) => c.hex)
      expect(allowedHexes).toContain(selection.color)
    }
  })
})
