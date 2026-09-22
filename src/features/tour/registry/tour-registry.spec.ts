import { describe, it, expect } from 'vitest'
import {
  getActiveTourForContext,
  getQuestionsForContext,
  searchQuestions,
} from './index'

describe('Tour Registry Facade', () => {
  it('retorna el tour general de kanban cuando no hay projectId abierto en collab', () => {
    const tour = getActiveTourForContext({
      activeTab: 'collab',
      role: 'admin',
    })
    expect(tour?.id).toBe('tour-collab-kanban')
  })

  it('retorna el tour de workspace cuando hay un projectId abierto en collab', () => {
    const tour = getActiveTourForContext({
      activeTab: 'collab',
      role: 'admin',
      projectId: 'proj-123-uuid',
    })
    expect(tour?.id).toBe('tour-collab-workspace')
  })

  it('retorna el tour de overview para admin y colaborador', () => {
    const adminTour = getActiveTourForContext({
      activeTab: 'overview',
      role: 'admin',
    })
    expect(adminTour?.id).toBe('tour-overview')

    const workerTour = getActiveTourForContext({
      activeTab: 'overview',
      role: 'worker',
    })
    expect(workerTour?.id).toBe('tour-overview')
  })

  it('filtra preguntas estrictamente por rol para clientes', () => {
    const clientQuestions = getQuestionsForContext({
      activeTab: 'collab',
      role: 'client',
    })

    // El cliente nunca debe ver la pregunta de crear nuevo proyecto
    const hasCreateProject = clientQuestions.some((q) => q.id === 'collab-q3')
    expect(hasCreateProject).toBe(false)

    // El cliente sí debe tener acceso a cómo buscar o cómo revisar contratos
    const hasSearch = clientQuestions.some((q) => q.id === 'collab-q1')
    expect(hasSearch).toBe(true)
  })

  it('permite buscar preguntas por texto respetando los roles', () => {
    const results = searchQuestions('contrato', {
      activeTab: 'collab',
      role: 'client',
    })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((q) => q.roles.includes('client'))).toBe(true)
  })

  it('el tour de workspace incluye todas las subpestañas y acciones clave', () => {
    const tour = getActiveTourForContext({
      activeTab: 'collab',
      role: 'admin',
      projectId: 'proj-123-uuid',
    })
    expect(tour).not.toBeNull()
    const elements = tour!.steps.map((s) => s.element)
    expect(elements).toContain('[data-tour="workspace-tab-board"]')
    expect(elements).toContain('[data-tour="workspace-tab-chat"]')
    expect(elements).toContain('[data-tour="workspace-files-panel"]')
    expect(elements).toContain('[data-tour="workspace-tab-brief"]')
    expect(elements).toContain('[data-tour="workspace-tab-contract"]')
    expect(elements).toContain('[data-tour="workspace-tab-change-requests"]')
    expect(elements).toContain('[data-tour="workspace-tab-members"]')
  })

  it('no contiene emojis en ningun paso ni pregunta guiada', () => {
    const tour = getActiveTourForContext({
      activeTab: 'collab',
      role: 'admin',
      projectId: 'proj-123-uuid',
    })
    const emojiRegex = /\p{Extended_Pictographic}/u
    for (const step of tour!.steps) {
      expect(emojiRegex.test(step.title)).toBe(false)
      expect(emojiRegex.test(step.description)).toBe(false)
      if (step.actionHint) {
        expect(emojiRegex.test(step.actionHint)).toBe(false)
      }
    }
  })
})
