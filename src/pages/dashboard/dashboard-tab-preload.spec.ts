import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  canPrefetch,
  preloadCollab,
  preloadMarketing,
  preloadAnalytics,
  preloadAdmin,
  preloadAccount,
  warmDashboardChunks,
} from './dashboard-tab-preload'

describe('dashboard-tab-preload', () => {
  const originalNavigator = globalThis.navigator

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    })
  })

  it('permite pre-descarga si no hay restricciones de red', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    })
    expect(canPrefetch()).toBe(true)
  })

  it('bloquea pre-descarga si saveData esta activo', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { connection: { saveData: true } },
      configurable: true,
      writable: true,
    })
    expect(canPrefetch()).toBe(false)
  })

  it('bloquea pre-descarga en conexiones 2g o slow-2g', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { connection: { saveData: false, effectiveType: '2g' } },
      configurable: true,
      writable: true,
    })
    expect(canPrefetch()).toBe(false)

    Object.defineProperty(globalThis, 'navigator', {
      value: { connection: { saveData: false, effectiveType: 'slow-2g' } },
      configurable: true,
      writable: true,
    })
    expect(canPrefetch()).toBe(false)
  })

  it('warmDashboardChunks es una funcion segura no-op', () => {
    expect(() => warmDashboardChunks('admin')).not.toThrow()
  })

  it('preload functions resuelven promesas sin lanzar errores cuando saveData esta activo', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { connection: { saveData: true } },
      configurable: true,
      writable: true,
    })
    await expect(preloadCollab()).resolves.toBeUndefined()
    await expect(preloadMarketing()).resolves.toBeUndefined()
    await expect(preloadAnalytics()).resolves.toBeUndefined()
    await expect(preloadAdmin()).resolves.toBeUndefined()
    await expect(preloadAccount()).resolves.toBeUndefined()
  })
})
