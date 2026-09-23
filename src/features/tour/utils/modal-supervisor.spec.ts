import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startModalSupervisor, stopModalSupervisor } from './modal-supervisor'

describe('modal-supervisor', () => {
  let originalDocument: unknown
  let originalWindow: unknown
  let originalMutationObserver: unknown
  let observerCallback: ((mutations: { addedNodes: unknown[]; removedNodes: unknown[] }[]) => void) | null = null

  beforeEach(() => {
    stopModalSupervisor()
    originalDocument = (globalThis as unknown as { document?: unknown }).document
    originalWindow = (globalThis as unknown as { window?: unknown }).window
    originalMutationObserver = (globalThis as unknown as { MutationObserver?: unknown }).MutationObserver

    class MockMutationObserver {
      constructor(callback: (mutations: { addedNodes: unknown[]; removedNodes: unknown[] }[]) => void) {
        observerCallback = callback
      }
      observe() {}
      disconnect() {
        observerCallback = null
      }
    }

    ;(globalThis as unknown as { MutationObserver: unknown }).MutationObserver = MockMutationObserver
    ;(globalThis as unknown as { window: unknown }).window = {}
    ;(globalThis as unknown as { document: unknown }).document = {
      body: {},
      querySelectorAll: () => [],
    }
  })

  afterEach(() => {
    stopModalSupervisor()
    ;(globalThis as unknown as { document: unknown }).document = originalDocument
    ;(globalThis as unknown as { window: unknown }).window = originalWindow
    ;(globalThis as unknown as { MutationObserver: unknown }).MutationObserver = originalMutationObserver
  })

  it('ignora el modal de centro de ayuda y no lo cuenta como modal de aplicación', () => {
    const onModalOpen = vi.fn()
    const onModalClose = vi.fn()

    startModalSupervisor({ onModalOpen, onModalClose })

    const fakeHelpModal = {
      getAttribute: (attr: string) => (attr === 'role' ? 'dialog' : attr === 'aria-labelledby' ? 'cima-help-title' : null),
      classList: { contains: () => false },
      querySelector: () => null,
    }

    // Simulamos mutación de nodo añadido
    observerCallback?.([{ addedNodes: [fakeHelpModal], removedNodes: [] }])
    expect(onModalOpen).not.toHaveBeenCalled()
  })

  it('ignora el popover de Driver.js y no lo cuenta como modal de aplicación', () => {
    const onModalOpen = vi.fn()
    const onModalClose = vi.fn()

    startModalSupervisor({ onModalOpen, onModalClose })

    const fakeDriverPopover = {
      id: 'driver-popover-content',
      getAttribute: (attr: string) => (attr === 'role' ? 'dialog' : null),
      classList: { contains: (cls: string) => cls === 'driver-popover' },
      closest: () => null,
      querySelector: () => null,
    }

    observerCallback?.([{ addedNodes: [fakeDriverPopover], removedNodes: [] }])
    expect(onModalOpen).not.toHaveBeenCalled()
  })

  it('detecta apertura y cierre de modal de aplicación', () => {
    const onModalOpen = vi.fn()
    const onModalClose = vi.fn()

    startModalSupervisor({ onModalOpen, onModalClose })

    const fakeAppModal = {
      getAttribute: (attr: string) => (attr === 'role' ? 'dialog' : null),
      classList: { contains: (cls: string) => cls === 'dialog-content' },
      querySelector: () => null,
    }

    ;(globalThis as unknown as { document: { querySelectorAll: (sel: string) => unknown[] } }).document.querySelectorAll = () => [fakeAppModal]

    observerCallback?.([{ addedNodes: [fakeAppModal], removedNodes: [] }])
    expect(onModalOpen).toHaveBeenCalledTimes(1)

    ;(globalThis as unknown as { document: { querySelectorAll: (sel: string) => unknown[] } }).document.querySelectorAll = () => []
    observerCallback?.([{ addedNodes: [], removedNodes: [fakeAppModal] }])
    expect(onModalClose).toHaveBeenCalledTimes(1)
  })
})
