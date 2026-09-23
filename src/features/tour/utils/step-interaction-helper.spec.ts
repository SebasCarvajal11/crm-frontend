import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  autoFocusTargetInput,
  triggerLiveReaction,
  attachInteractiveStep,
} from './step-interaction-helper'

describe('step-interaction-helper', () => {
  let originalDocument: unknown

  beforeEach(() => {
    vi.useFakeTimers()
    originalDocument = (globalThis as unknown as { document?: unknown }).document
  })

  afterEach(() => {
    vi.useRealTimers()
    ;(globalThis as unknown as { document: unknown }).document = originalDocument
  })

  it('enfoca automáticamente el elemento input o textarea', () => {
    ;(globalThis as unknown as { document: unknown }).document = {}
    const focusSpy = vi.fn()
    const fakeInput = { focus: focusSpy }
    const fakeWrapper = {
      querySelector: (sel: string) => (sel === 'input, textarea' ? fakeInput : null),
    } as unknown as Element

    autoFocusTargetInput(fakeWrapper)
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('activa micro-reacción visual en el badge del popover', () => {
    const classList = new Set<string>()
    let innerHTML = ''
    const fakeBadge = {
      classList: {
        add: (cls: string) => classList.add(cls),
      },
      set innerHTML(val: string) {
        innerHTML = val
      },
      get innerHTML() {
        return innerHTML
      },
    }
    const fakePopover = {
      querySelector: (sel: string) =>
        sel === '.cima-tour-interactive-badge' ? fakeBadge : null,
    } as unknown as HTMLElement

    triggerLiveReaction(fakePopover)

    expect(classList.has('cima-tour-badge-success')).toBe(true)
    expect(innerHTML).toContain('¡Acción detectada!')
  })

  it('detecta escritura en inputs y dispara avance tras feedback', () => {
    let inputListener: (() => void) | null = null
    const fakeInput = {
      value: 'cima',
      addEventListener: (_ev: string, fn: () => void) => {
        inputListener = fn
      },
      removeEventListener: () => {
        inputListener = null
      },
    }
    const fakeWrapper = {
      querySelector: (sel: string) => (sel === 'input, textarea' ? fakeInput : null),
    } as unknown as Element

    const onAdvance = vi.fn()
    const cleanup = attachInteractiveStep({
      element: fakeWrapper,
      step: {
        element: 'input',
        title: 'Buscar',
        description: 'Escribe algo',
        interactiveAction: 'input',
      },
      stepIdx: 0,
      getActiveIndex: () => 0,
      isTourActive: () => true,
      onAdvance,
    })

    // Disparar input event listener
    const triggerInput = inputListener as unknown as (() => void) | undefined
    triggerInput?.()

    // Antes del timeout de feedback
    expect(onAdvance).not.toHaveBeenCalled()

    vi.advanceTimersByTime(400)
    expect(onAdvance).toHaveBeenCalled()

    cleanup()
  })
})
