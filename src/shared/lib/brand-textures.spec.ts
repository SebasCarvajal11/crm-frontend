import { describe, it, expect } from 'vitest'
import { BRAND_TEXTURES, preloadTexture } from './brand-textures'

describe('brand-textures', () => {
  it('defines valid canonical webp paths for app and sidebar textures', () => {
    expect(BRAND_TEXTURES.app).toBe('/backgrounds/app-texture.webp')
    expect(BRAND_TEXTURES.sidebar).toBe('/backgrounds/sidebar-texture.webp')
  })

  it('safely preloads texture without errors in browser environment', () => {
    expect(() => preloadTexture(BRAND_TEXTURES.sidebar)).not.toThrow()
  })
})
