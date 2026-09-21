import { describe, it, expect } from 'vitest'
import { BRAND_TEXTURES } from './brand-textures'

describe('brand-textures', () => {
  it('defines valid canonical webp paths for app and sidebar textures', () => {
    expect(BRAND_TEXTURES.app).toBe('/backgrounds/app-texture.webp')
    expect(BRAND_TEXTURES.sidebar).toBe('/backgrounds/sidebar-texture.webp')
  })
})
