import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderMinimapHtml, bindMinimapClicks } from './minimap-helper'

describe('minimap-helper', () => {
  let originalDocument: unknown

  beforeEach(() => {
    originalDocument = (globalThis as unknown as { document?: unknown }).document
  })

  afterEach(() => {
    ;(globalThis as unknown as { document: unknown }).document = originalDocument
  })

  it('no genera minimap si hay 1 o menos pasos', () => {
    expect(renderMinimapHtml(0, 1)).toBe('')
    expect(renderMinimapHtml(0, 0)).toBe('')
  })

  it('genera la cantidad correcta de píldoras con estados activo y completado', () => {
    const html = renderMinimapHtml(1, 4)
    expect(html).toContain('class="cima-tour-minimap"')
    expect(html).toContain('data-tour-jump="0"')
    expect(html).toContain('data-tour-jump="1"')
    expect(html).toContain('data-tour-jump="2"')
    expect(html).toContain('data-tour-jump="3"')

    // Paso 0 completado, Paso 1 activo
    expect(html).toContain('class="cima-tour-minimap-dot completed" data-tour-jump="0"')
    expect(html).toContain('class="cima-tour-minimap-dot active" data-tour-jump="1"')
    expect(html).toContain('class="cima-tour-minimap-dot " data-tour-jump="2"')
  })

  it('enlaza clics a botones con data-tour-jump', () => {
    let clickHandler: ((e: unknown) => void) | null = null
    const fakeWrapper = {
      addEventListener: (_ev: string, fn: (e: unknown) => void) => {
        clickHandler = fn
      },
      removeEventListener: () => {
        clickHandler = null
      },
    } as unknown as HTMLElement

    const onJump = vi.fn()
    const cleanup = bindMinimapClicks(fakeWrapper, onJump)

    const fakeEvent = {
      target: {
        closest: (sel: string) =>
          sel === '[data-tour-jump]' ? { getAttribute: () => '2' } : null,
      },
      stopPropagation: vi.fn(),
    }

    const triggerClick = clickHandler as unknown as ((e: unknown) => void) | undefined
    triggerClick?.(fakeEvent)
    expect(onJump).toHaveBeenCalledWith(2)
    cleanup()
  })
})
