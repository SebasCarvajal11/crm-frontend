import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { waitForElement, isElementVisible } from './dom-target-finder'

type MockElement = {
  id?: string
  getBoundingClientRect?: () => { width: number; height: number }
}

describe('dom-target-finder', () => {
  let mockElements: Map<string, MockElement>
  let originalDocument: unknown
  let originalWindow: unknown

  beforeEach(() => {
    mockElements = new Map()
    originalDocument = (globalThis as unknown as { document?: unknown }).document
    originalWindow = (globalThis as unknown as { window?: unknown }).window

    ;(globalThis as unknown as { document: unknown }).document = {
      querySelector: (selector: string) => mockElements.get(selector) ?? null,
    }

    ;(globalThis as unknown as { window: unknown }).window = {
      getComputedStyle: () => ({
        visibility: 'visible',
        display: 'block',
      }),
    }
  })

  afterEach(() => {
    ;(globalThis as unknown as { document: unknown }).document = originalDocument
    ;(globalThis as unknown as { window: unknown }).window = originalWindow
  })

  it('resuelve un elemento existente de inmediato', async () => {
    const fakeEl: MockElement = { id: 'target-1' }
    mockElements.set('#target-1', fakeEl)

    const found = await waitForElement('#target-1', 200)
    expect(found).toBe(fakeEl)
  })

  it('espera a que el elemento aparezca si se agrega de forma asíncrona', async () => {
    const fakeEl: MockElement = { id: 'async-target' }
    setTimeout(() => {
      mockElements.set('#async-target', fakeEl)
    }, 40)

    const found = await waitForElement('#async-target', 300)
    expect(found).toBe(fakeEl)
  })

  it('retorna null si se supera el timeout', async () => {
    const found = await waitForElement('#non-existent-target', 80)
    expect(found).toBeNull()
  })

  it('determina visibilidad de elementos según sus dimensiones', () => {
    const visibleEl = {
      getBoundingClientRect: () => ({ width: 100, height: 40 }),
    } as unknown as Element
    expect(isElementVisible(visibleEl)).toBe(true)

    const hiddenEl = {
      getBoundingClientRect: () => ({ width: 0, height: 0 }),
    } as unknown as Element
    expect(isElementVisible(hiddenEl)).toBe(false)

    expect(isElementVisible(null)).toBe(false)
  })
})
