import { describe, expect, it } from 'vitest'
import { resolveUiProjects } from '../playwright/ui.config'

describe('resolveUiProjects', () => {
  it('resuelve únicamente desktop-1080p y mobile-chrome-android para CI estándar', () => {
    const projects = resolveUiProjects({ FULL_MATRIX: 'false' })
    const names = projects.map((p) => p.name)

    expect(names).toEqual(['desktop-1080p', 'mobile-chrome-android'])
    expect(projects).toHaveLength(2)
  })

  it('resuelve matriz completa de 7 viewports sin duplicados cuando FULL_MATRIX=true', () => {
    const projects = resolveUiProjects({ FULL_MATRIX: 'true' })
    const names = projects.map((p) => p.name)

    expect(names).toEqual([
      'desktop-4k',
      'desktop-2k',
      'desktop-1080p',
      'tablet-ipad',
      'mobile-safari-ios',
      'mobile-chrome-android',
      'desktop-ultrawide',
    ])
    expect(new Set(names).size).toBe(7)
  })
})
