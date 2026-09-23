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

  it('no corta al usuario mientras escribe y avanza tras pausa de inactividad', () => {
    let inputListener: (() => void) | null = null
    const fakeInput = {
      value: 'cima',
      addEventListener: (ev: string, fn: () => void) => {
        if (ev === 'input') inputListener = fn
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

    const triggerInput = inputListener as unknown as (() => void) | undefined
    triggerInput?.()

    // A los 400ms todavía NO debe haber avanzado (evita corte al usuario)
    vi.advanceTimersByTime(400)
    expect(onAdvance).not.toHaveBeenCalled()

    // Tras el debounce de inactividad (2200ms) y el retardo sensorial (350ms)
    vi.advanceTimersByTime(2300)
    expect(onAdvance).toHaveBeenCalled()

    cleanup()
  })

  it('avanza inmediatamente al pulsar la tecla Enter en el input', () => {
    let keydownListener: ((e: { key: string }) => void) | null = null
    const fakeInput = {
      value: 'retail',
      addEventListener: (ev: string, fn: (e: { key: string }) => void) => {
        if (ev === 'keydown') keydownListener = fn
      },
      removeEventListener: () => {
        keydownListener = null
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

    const triggerKeyDown = keydownListener as unknown as ((e: { key: string }) => void) | undefined
    triggerKeyDown?.({ key: 'Enter' })

    // Retardo sensorial de 350ms
    vi.advanceTimersByTime(400)
    expect(onAdvance).toHaveBeenCalled()

    cleanup()
  })
})
