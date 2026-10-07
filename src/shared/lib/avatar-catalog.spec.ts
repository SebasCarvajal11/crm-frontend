import { describe, expect, it } from 'vitest'
import {
  AVATARS_CATALOG,
  AVATAR_CATEGORY_TABS,
  CIMA_CORPORATE_COLORS,
  extractAvatarIdFromSrc,
  getAvatarImageUrl,
  getAvatarSrcSet,
  getRandomAvatarSelection,
  resolveAvatarSrcSet,
  resolveDeterministicAvatar,
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

  it('generates correct avatar image webp url with optional resolutions and boundary safety', () => {
    expect(getAvatarImageUrl(0)).toBe('/avatars/avatar-0.webp')
    expect(getAvatarImageUrl(42)).toBe('/avatars/avatar-42.webp')
    expect(getAvatarImageUrl(5, 64)).toBe('/avatars/avatar-5-64.webp')
    expect(getAvatarImageUrl(5, 256)).toBe('/avatars/avatar-5-256.webp')
    expect(getAvatarImageUrl(5, 512)).toBe('/avatars/avatar-5-512.webp')
    expect(getAvatarImageUrl(5, 1024)).toBe('/avatars/avatar-5-1024.webp')
    // Saneamiento de límites fuera de rango
    expect(getAvatarImageUrl(-5)).toBe('/avatars/avatar-5.webp')
    expect(getAvatarImageUrl(84)).toBe('/avatars/avatar-0.webp')
  })

  it('generates correct avatar srcset with 4 tiered resolutions and boundary safety', () => {
    const srcset = getAvatarSrcSet(5)
    expect(srcset).toContain('/avatars/avatar-5-64.webp 64w')
    expect(srcset).toContain('/avatars/avatar-5-256.webp 256w')
    expect(srcset).toContain('/avatars/avatar-5-512.webp 512w')
    expect(srcset).toContain('/avatars/avatar-5-1024.webp 1024w')

    const outOfBoundsSrcset = getAvatarSrcSet(-1)
    expect(outOfBoundsSrcset).toContain('/avatars/avatar-1-1024.webp 1024w')
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

  it('resolves deterministic avatar predictably without nulls', () => {
    const userA = resolveDeterministicAvatar('user-abc-123')
    const userA2 = resolveDeterministicAvatar('user-abc-123')
    expect(userA).toEqual(userA2)
    expect(userA.avatarId).toBeGreaterThanOrEqual(0)
    expect(userA.avatarId).toBeLessThan(84)
    expect(userA.url).toBe(`/avatars/avatar-${userA.avatarId}.webp`)
    const allowedHexes = CIMA_CORPORATE_COLORS.map((c) => c.hex)
    expect(allowedHexes).toContain(userA.color)

    const fallback = resolveDeterministicAvatar(null)
    expect(fallback.avatarId).toBeGreaterThanOrEqual(0)
    expect(fallback.avatarId).toBeLessThan(84)
    expect(allowedHexes).toContain(fallback.color)
  })

  it('extracts avatar id from src correctly', () => {
    expect(extractAvatarIdFromSrc('/avatars/avatar-31.webp')).toBe(31)
    expect(extractAvatarIdFromSrc('/avatars/avatar-0-64.webp?c=86070c')).toBe(0)
    expect(extractAvatarIdFromSrc('/avatars/avatar-83.png')).toBe(83)
    expect(extractAvatarIdFromSrc('/avatars/avatar-999.webp')).toBeNull()
    expect(extractAvatarIdFromSrc('https://example.com/photo.png')).toBeNull()
    expect(extractAvatarIdFromSrc('')).toBeNull()
    expect(extractAvatarIdFromSrc(null)).toBeNull()
  })

  it('prioritizes avatar id from src in resolveAvatarSrcSet', () => {
    const srcset = resolveAvatarSrcSet('/avatars/avatar-42.webp', 5)
    expect(srcset).toContain('/avatars/avatar-42-64.webp 64w')
    expect(srcset).not.toContain('/avatars/avatar-5-64.webp')

    const fallbackSrcset = resolveAvatarSrcSet(null, 7)
    expect(fallbackSrcset).toContain('/avatars/avatar-7-64.webp 64w')

    const customSrcset = resolveAvatarSrcSet('https://example.com/photo.png', 7)
    expect(customSrcset).toBeUndefined()
  })
})
