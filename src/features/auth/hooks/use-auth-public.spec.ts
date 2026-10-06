import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRandomAvatarSelection, CIMA_CORPORATE_COLORS } from '@/shared/lib/avatar-catalog'

describe('use-auth-public avatar fallback logic', () => {
  let mockSessionStorage: Record<string, string> = {}

  beforeEach(() => {
    mockSessionStorage = {}
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => mockSessionStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockSessionStorage[key] = val
      },
      removeItem: (key: string) => {
        delete mockSessionStorage[key]
      },
      clear: () => {
        mockSessionStorage = {}
      },
    })
  })

  it('selects valid random avatar and corporate color on fallback', () => {
    const fallback = getRandomAvatarSelection()
    expect(fallback.avatarId).toBeGreaterThanOrEqual(0)
    expect(fallback.avatarId).toBeLessThanOrEqual(83)
    const validColors = CIMA_CORPORATE_COLORS.map((c) => c.hex.toLowerCase())
    expect(validColors).toContain(fallback.color.toLowerCase())
  })

  it('stores warning notice in sessionStorage when avatar selection fails', () => {
    const warningMessage =
      'Hubo un inconveniente al guardar tu avatar seleccionado. Se asignó uno provisional que puedes cambiar en cualquier momento desde tu perfil.'
    sessionStorage.setItem('cima_avatar_warning', warningMessage)

    expect(sessionStorage.getItem('cima_avatar_warning')).toBe(warningMessage)
  })
})
