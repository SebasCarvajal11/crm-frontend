import { describe, expect, it } from 'vitest'
import {
  getAvatarSpriteCoordinates,
  getAvatarSpriteStyle,
  isCatalogAvatarSrc,
  SPRITESHEET_COLUMNS,
  SPRITESHEET_ROWS,
  DEFAULT_SPRITESHEET_URL,
} from './avatar-spritesheet'

describe('avatar-spritesheet', () => {
  describe('constantes de grilla', () => {
    it('define exactamente 12 columnas y 7 filas para los 84 avatares', () => {
      expect(SPRITESHEET_COLUMNS).toBe(12)
      expect(SPRITESHEET_ROWS).toBe(7)
      expect(SPRITESHEET_COLUMNS * SPRITESHEET_ROWS).toBe(84)
      expect(DEFAULT_SPRITESHEET_URL).toBe('/avatars/avatars-spritesheet-64.webp')
    })
  })

  describe('getAvatarSpriteCoordinates', () => {
    it('calcula coordenadas exactas para la primera celda (id=0)', () => {
      const coords = getAvatarSpriteCoordinates(0)
      expect(coords.col).toBe(0)
      expect(coords.row).toBe(0)
      expect(coords.percentX).toBe(0)
      expect(coords.percentY).toBe(0)
    })

    it('calcula coordenadas para el fin de la primera fila (id=11)', () => {
      const coords = getAvatarSpriteCoordinates(11)
      expect(coords.col).toBe(11)
      expect(coords.row).toBe(0)
      expect(coords.percentX).toBe(100)
      expect(coords.percentY).toBe(0)
    })

    it('calcula coordenadas para el inicio de la segunda fila (id=12)', () => {
      const coords = getAvatarSpriteCoordinates(12)
      expect(coords.col).toBe(0)
      expect(coords.row).toBe(1)
      expect(coords.percentX).toBe(0)
      expect(coords.percentY).toBeCloseTo(16.666667, 4)
    })

    it('calcula coordenadas para la última celda del catálogo (id=83)', () => {
      const coords = getAvatarSpriteCoordinates(83)
      expect(coords.col).toBe(11)
      expect(coords.row).toBe(6)
      expect(coords.percentX).toBe(100)
      expect(coords.percentY).toBe(100)
    })

    it('aplica normalización segura para IDs fuera de rango o negativos', () => {
      const negCoords = getAvatarSpriteCoordinates(-1)
      expect(negCoords.col).toBe(1)
      expect(negCoords.row).toBe(0)

      const overflowCoords = getAvatarSpriteCoordinates(84)
      expect(overflowCoords.col).toBe(0)
      expect(overflowCoords.row).toBe(0)
    })
  })

  describe('getAvatarSpriteStyle', () => {
    it('genera estilo CSS completo para uso como background en contenedor', () => {
      const style = getAvatarSpriteStyle(0)
      expect(style.backgroundImage).toBe("url('/avatars/avatars-spritesheet-64.webp')")
      expect(style.backgroundPosition).toBe('0.000% 0.000%')
      expect(style.backgroundSize).toBe('1200% 700%')
      expect(style.backgroundRepeat).toBe('no-repeat')
    })

    it('soporta variante de alta resolución thumb', () => {
      const style = getAvatarSpriteStyle(83, { variant: 'thumb' })
      expect(style.backgroundImage).toBe("url('/avatars/avatars-spritesheet-thumb.webp')")
      expect(style.backgroundPosition).toBe('100.000% 100.000%')
    })
  })

  describe('isCatalogAvatarSrc', () => {
    it('retorna true para rutas del catálogo estático', () => {
      expect(isCatalogAvatarSrc('/avatars/avatar-5.webp')).toBe(true)
      expect(isCatalogAvatarSrc('/avatars/avatar-12-64.webp')).toBe(true)
      expect(isCatalogAvatarSrc('/avatars/avatar-83.png')).toBe(true)
    })

    it('retorna false para URLs externas o personalizadas', () => {
      expect(isCatalogAvatarSrc('https://cdn.example.com/photo.jpg')).toBe(false)
      expect(isCatalogAvatarSrc('/uploads/avatars/user-123.png')).toBe(false)
      expect(isCatalogAvatarSrc('')).toBe(false)
      expect(isCatalogAvatarSrc(null)).toBe(false)
      expect(isCatalogAvatarSrc(undefined)).toBe(false)
    })
  })
})
