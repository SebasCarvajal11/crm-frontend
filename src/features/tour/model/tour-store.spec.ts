import { describe, it, expect, beforeEach } from 'vitest'
import { useTourStore } from './tour-store'

describe('useTourStore', () => {
  beforeEach(() => {
    useTourStore.getState().resetAllTours()
  })

  it('inicia con el centro de ayuda cerrado y sin tour activo', () => {
    const state = useTourStore.getState()
    expect(state.isHelpCenterOpen).toBe(false)
    expect(state.activeTourId).toBeNull()
  })

  it('permite abrir, cerrar y alternar el centro de ayuda', () => {
    const { openHelpCenter, closeHelpCenter, toggleHelpCenter } = useTourStore.getState()

    openHelpCenter()
    expect(useTourStore.getState().isHelpCenterOpen).toBe(true)

    closeHelpCenter()
    expect(useTourStore.getState().isHelpCenterOpen).toBe(false)

    toggleHelpCenter()
    expect(useTourStore.getState().isHelpCenterOpen).toBe(true)

    toggleHelpCenter()
    expect(useTourStore.getState().isHelpCenterOpen).toBe(false)
  })

  it('marca tours como completados y evita duplicados', () => {
    const { markTourCompleted, isTourCompleted } = useTourStore.getState()

    expect(isTourCompleted('tour-overview')).toBe(false)

    markTourCompleted('tour-overview')
    expect(isTourCompleted('tour-overview')).toBe(true)
    expect(useTourStore.getState().completedTourIds).toEqual(['tour-overview'])

    // No debe duplicar el id
    markTourCompleted('tour-overview')
    expect(useTourStore.getState().completedTourIds).toHaveLength(1)
  })

  it('restablece todos los tours completados', () => {
    const { markTourCompleted, resetAllTours, isTourCompleted } = useTourStore.getState()

    markTourCompleted('tour-overview')
    markTourCompleted('tour-collab-kanban')
    expect(useTourStore.getState().completedTourIds).toHaveLength(2)

    resetAllTours()
    expect(useTourStore.getState().completedTourIds).toHaveLength(0)
    expect(isTourCompleted('tour-overview')).toBe(false)
  })

  it('soporta pausar y reanudar el tour durante interacción con modales', () => {
    const { pauseTour, resumeTour } = useTourStore.getState()
    expect(useTourStore.getState().isTourPaused).toBe(false)

    pauseTour('modal')
    expect(useTourStore.getState().isTourPaused).toBe(true)
    expect(useTourStore.getState().pauseReason).toBe('modal')

    resumeTour()
    expect(useTourStore.getState().isTourPaused).toBe(false)
    expect(useTourStore.getState().pauseReason).toBeUndefined()
  })

  it('permite abrir el centro de ayuda con un query preestablecido', () => {
    const { focusHelpCenterWithQuery, closeHelpCenter } = useTourStore.getState()
    expect(useTourStore.getState().isHelpCenterOpen).toBe(false)
    expect(useTourStore.getState().initialSearchQuery).toBeUndefined()

    focusHelpCenterWithQuery('tareas')
    expect(useTourStore.getState().isHelpCenterOpen).toBe(true)
    expect(useTourStore.getState().initialSearchQuery).toBe('tareas')

    closeHelpCenter()
    expect(useTourStore.getState().isHelpCenterOpen).toBe(false)
    expect(useTourStore.getState().initialSearchQuery).toBeUndefined()
  })
})
