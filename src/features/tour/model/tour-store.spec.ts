import { describe, it, expect, beforeEach } from 'vitest'
import { useTourStore, parseCompleted } from './tour-store'
import { createTourSession, moveSession, visitSession, canCompleteSession } from './tour-session'
import type { CimaTourDefinition } from './types'

const tour: CimaTourDefinition = {
  id: 'test-tour', tab: 'collab', title: 'Prueba', description: '', roles: ['admin', 'worker'],
  steps: [
    { element: '#first', title: 'Primero', description: '' },
    { element: '#admin', title: 'Administración', description: '', requiredRole: ['admin'] },
    { element: '#last', title: 'Último', description: '' },
  ],
}

describe('Sesión de tutorial', () => {
  it('filtrar roles sin conceder acceso a guías incompatibles', () => {
    expect(createTourSession(tour, 'client', 1)).toBeNull()
    expect(createTourSession(tour, 'worker', 1)?.steps).toHaveLength(2)
    expect(createTourSession(tour, 'admin', 1)?.steps).toHaveLength(3)
  })
  it('rechazar índices fuera del recorrido y conservar la sesión inmutable', () => {
    const session = createTourSession(tour, 'worker', 1)!
    for (const index of [-1, 2, NaN, 0.5]) expect(moveSession(session, index)).toBe(session)
    expect(moveSession(session, 1).revision).toBe(2)
    expect(session.index).toBe(0)
  })
  it('ignorar resolución tardía de un paso anterior', () => {
    const session = moveSession(createTourSession(tour, 'worker', 1)!, 1)
    expect(visitSession(session, 1)).toBe(session)
    expect(visitSession(session, 2).visited).toEqual([1])
  })
  it('completar solamente después de visitar todos los pasos y finalizar el último', () => {
    let session = createTourSession(tour, 'worker', 1)!
    session = moveSession(session, 1)
    session = visitSession(session, 2)
    expect(canCompleteSession(session)).toBe(false)
    session = moveSession(session, 0)
    session = visitSession(session, 3)
    expect(canCompleteSession(session)).toBe(false)
    session = moveSession(session, 1)
    expect(canCompleteSession(session)).toBe(true)
    expect(visitSession(session, 4)).toBe(session)
  })
})

describe('Estado único del tutorial', () => {
  beforeEach(() => {
    useTourStore.getState().resetAllTours()
    useTourStore.getState().closeHelpCenter()
  })
  it('abrir y cerrar ayuda, limpiar la búsqueda al volver a abrir', () => {
    const store = useTourStore.getState()
    store.focusHelpCenterWithQuery('tareas')
    expect(useTourStore.getState().initialSearchQuery).toBe('tareas')
    store.closeHelpCenter()
    store.toggleHelpCenter()
    expect(useTourStore.getState().isHelpCenterOpen).toBe(true)
    expect(useTourStore.getState().initialSearchQuery).toBeUndefined()
  })
  it('cerrar o reemplazar una guía sin completarla y rechazar trabajo antiguo', () => {
    const store = useTourStore.getState()
    store.start(tour, 'worker')
    const old = useTourStore.getState().session!.revision
    store.stop()
    store.start(tour, 'admin')
    store.visit(old)
    expect(useTourStore.getState().session?.visited).toEqual([])
    expect(useTourStore.getState().completedTourIds).toEqual([])
  })
  it('conservar el paso al minimizar y consultar ayuda', () => {
    const store = useTourStore.getState()
    store.start(tour, 'worker')
    store.move(1)
    store.minimize(true)
    store.openHelpCenter()
    expect(useTourStore.getState().session?.index).toBe(1)
    expect(useTourStore.getState().session?.minimized).toBe(true)
  })
  it('no marcar una guía con pasos omitidos como completada', () => {
    const store = useTourStore.getState()
    store.start(tour, 'worker')
    store.move(1)
    store.visit(useTourStore.getState().session!.revision)
    store.finish()
    expect(useTourStore.getState().completedTourIds).toEqual([])
  })
  it('persistir una sola finalización y restablecer el historial', () => {
    const store = useTourStore.getState()
    for (let repeat = 0; repeat < 2; repeat++) {
      store.start(tour, 'worker')
      store.visit(useTourStore.getState().session!.revision)
      store.move(1)
      store.visit(useTourStore.getState().session!.revision)
      store.finish()
    }
    expect(useTourStore.getState().completedTourIds).toEqual(['test-tour'])
    store.resetAllTours()
    expect(useTourStore.getState().completedTourIds).toEqual([])
  })
  it('validar almacenamiento corrupto o con tipos incorrectos', () => {
    for (const value of ['null', '{}', '123', '{bad', null]) expect(parseCompleted(value)).toEqual([])
    expect(parseCompleted('["tour",false,{},null,"tour",""]')).toEqual(['tour'])
  })
  it('aislar el historial y cancelar la guía al cambiar de cuenta', () => {
    const store = useTourStore.getState()
    store.setHistoryOwner('primera@example.com')
    store.start(tour, 'worker')
    store.setHistoryOwner('segunda@example.com')
    expect(useTourStore.getState().session).toBeNull()
    expect(useTourStore.getState().completedTourIds).toEqual([])
    store.setHistoryOwner(null)
  })
})
