import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hasApplicationDialog, visibleElement, waitForTarget } from './tour-target'

function element(visible = true, excluded = false) {
  return {
    isConnected: true,
    getBoundingClientRect: () => ({ width: visible ? 100 : 0, height: visible ? 40 : 0 }),
    getClientRects: () => visible ? [{}] : [],
    closest: () => excluded ? {} : null,
    getAttribute: () => null,
  } as unknown as HTMLElement
}

describe('Resolver objetivos y cancelar preparación', () => {
  let elements: HTMLElement[]
  let notify: () => void
  const disconnect = vi.fn()
  const observe = vi.fn()
  beforeEach(() => {
    vi.useFakeTimers()
    elements = []
    disconnect.mockClear()
    observe.mockClear()
    vi.stubGlobal('document', { body: {}, querySelectorAll: () => elements })
    vi.stubGlobal('getComputedStyle', () => ({ visibility: 'visible', display: 'block' }))
    vi.stubGlobal('MutationObserver', class {
      constructor(callback: () => void) { notify = callback }
      observe = observe
      disconnect = disconnect
    })
  })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  it('preferir el objetivo visible entre copias retenidas y excluir ancestros ocultos', () => {
    const target = element()
    elements = [element(false), element(true, true), target]
    expect(visibleElement('#target')).toBe(target)
    expect(visibleElement('')).toBeNull()
  })
  it('no crear observadores para una solicitud ya cancelada o un objetivo presente', async () => {
    const controller = new AbortController()
    controller.abort()
    expect(await waitForTarget('#target', controller.signal)).toBeNull()
    const target = element()
    elements = [target]
    expect(await waitForTarget('#target', new AbortController().signal)).toBe(target)
    expect(observe).not.toHaveBeenCalled()
  })
  it('resolver al aparecer el objetivo y eliminar observador y timeout', async () => {
    const pending = waitForTarget('#target', new AbortController().signal)
    const target = element()
    elements = [target]
    notify()
    expect(await pending).toBe(target)
    expect(disconnect).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('cancelar una navegación pendiente sin retener timers ni observadores', async () => {
    const controller = new AbortController()
    const pending = waitForTarget('#target', controller.signal)
    controller.abort()
    expect(await pending).toBeNull()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('terminar con estado recuperable al agotarse el tiempo de espera', async () => {
    const pending = waitForTarget('#target', new AbortController().signal, 2500)
    await vi.advanceTimersByTimeAsync(2500)
    expect(await pending).toBeNull()
    expect(disconnect).toHaveBeenCalledOnce()
  })
  it('detectar un diálogo abierto e ignorar uno en animación de cierre', () => {
    elements = [element(false)]
    expect(hasApplicationDialog()).toBe(false)
    elements = [element()]
    expect(hasApplicationDialog()).toBe(true)
    elements[0].getAttribute = () => 'closed'
    expect(hasApplicationDialog()).toBe(false)
  })
})
