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

  it('el tour unificado de kanban incluye la transicion openProject hacia workspace', () => {
    const tour = getActiveTourForContext({
      activeTab: 'collab',
      role: 'admin',
    })
    expect(tour?.id).toBe('tour-collab-kanban')
    const cardStep = tour?.steps.find((s) => s.element === '[data-tour="collab-card-first"]')
    expect(cardStep?.onNextAction).toBe('openProject')

    const elements = tour!.steps.map((s) => s.element)
    expect(elements).toContain('[data-tour="collab-columns-container"]')
    expect(elements).toContain('[data-tour="workspace-project-header"]')
    expect(elements).toContain('[data-tour="workspace-tab-board"]')
  })

  it('searchQuestions en modo all retorna preguntas globales y de otras secciones', () => {
    const sectionQuestions = searchQuestions('', { activeTab: 'overview', role: 'admin' }, 'section')
    const allQuestions = searchQuestions('', { activeTab: 'overview', role: 'admin' }, 'all')

    expect(allQuestions.length).toBeGreaterThan(sectionQuestions.length)
    expect(allQuestions.some((q) => q.tab === 'collab')).toBe(true)
  })

  it('retorna el tour completo de administracion para admin con 17 pasos y cero emojis', () => {
    const tour = getActiveTourForContext({ activeTab: 'admin', role: 'admin' })
    expect(tour?.id).toBe('tour-admin')
    expect(tour?.steps.length).toBe(17)

    const elements = tour!.steps.map((s) => s.element)
    expect(elements).toContain('[data-tour="admin-header"]')
    expect(elements).toContain('[data-tour="admin-kpis"]')
    expect(elements).toContain('[data-tour="admin-storage-overview"]')
    expect(elements).toContain('[data-tour="admin-storage-server-disk"]')
    expect(elements).toContain('[data-tour="admin-file-summary"]')
    expect(elements).toContain('[data-tour="admin-file-search"]')
    expect(elements).toContain('[data-tour="admin-file-client-tree"]')
    expect(elements).toContain('[data-tour="admin-file-project-header"]')
    expect(elements).toContain('[data-tour="admin-file-folder-tabs"]')
    expect(elements).toContain('[data-tour="admin-file-table"]')
    expect(elements).toContain('[data-tour="admin-user-toolbar"]')
    expect(elements).toContain('[data-tour="admin-user-table"]')
    expect(elements).toContain('[data-tour="admin-user-actions"]')
    expect(elements).toContain('[data-tour="admin-invites-section"]')
    expect(elements).toContain('[data-tour="admin-invite-client"]')
    expect(elements).toContain('[data-tour="admin-invite-worker"]')
    expect(elements).toContain('[data-tour="admin-invite-admin"]')

    const emojiRegex = /\p{Extended_Pictographic}/u
    for (const step of tour!.steps) {
      expect(emojiRegex.test(step.title)).toBe(false)
      expect(emojiRegex.test(step.description)).toBe(false)
      if (step.actionHint) {
        expect(emojiRegex.test(step.actionHint)).toBe(false)
      }
    }
  })

  it('no expone el tour de administracion a clientes ni trabajadores', () => {
    const clientTour = getActiveTourForContext({ activeTab: 'admin', role: 'client' })
    expect(clientTour).toBeNull()

    const workerTour = getActiveTourForContext({ activeTab: 'admin', role: 'worker' })
    expect(workerTour).toBeNull()
  })

  it('retorna preguntas de administracion para admin con cero emojis', () => {
    const adminQs = getQuestionsForContext({ activeTab: 'admin', role: 'admin' })
    expect(adminQs.length).toBeGreaterThanOrEqual(14)
    expect(adminQs.some((q) => q.id === 'adm-q1')).toBe(true)
    expect(adminQs.some((q) => q.id === 'adm-q11')).toBe(true)

    const emojiRegex = /\p{Extended_Pictographic}/u
    for (const q of adminQs) {
      expect(emojiRegex.test(q.question)).toBe(false)
      expect(emojiRegex.test(q.answer)).toBe(false)
    }
  })

  it('retorna el tour de marketing para admin y worker con selectores verificados y 0 emojis', () => {
    const tour = getActiveTourForContext({ activeTab: 'marketing', role: 'admin' })
    expect(tour?.id).toBe('tour-marketing')
    expect(tour?.steps.length).toBe(8)
    const elements = tour!.steps.map((s) => s.element)
    expect(elements).toContain('[data-tour="marketing-header"]')
    expect(elements).toContain('[data-tour="marketing-tabs"]')
    expect(elements).toContain('[data-tour="marketing-clients-plans-grid"]')
    expect(elements).toContain('[data-tour="marketing-clients-sync-btn"]')
    expect(elements).toContain('[data-tour="marketing-new-campaign-btn"]')
    expect(elements).toContain('[data-tour="marketing-campaigns-filters"]')
    expect(elements).toContain('[data-tour="marketing-new-proposal-btn"]')
    expect(elements).toContain('[data-tour="marketing-new-workflow-btn"]')

    const emojiRegex = /\p{Extended_Pictographic}/u
    for (const step of tour!.steps) {
      expect(emojiRegex.test(step.title)).toBe(false)
      expect(emojiRegex.test(step.description)).toBe(false)
      if (step.actionHint) expect(emojiRegex.test(step.actionHint)).toBe(false)
    }

    const clientTour = getActiveTourForContext({ activeTab: 'marketing', role: 'client' })
    expect(clientTour).toBeNull()
  })

  it('retorna el tour de analítica para admin y worker con selectores verificados y 0 emojis', () => {
    const tour = getActiveTourForContext({ activeTab: 'analytics', role: 'admin' })
    expect(tour?.id).toBe('tour-analytics')
    expect(tour?.steps.length).toBe(6)
    const elements = tour!.steps.map((s) => s.element)
    expect(elements).toContain('[data-tour="analytics-header"]')
    expect(elements).toContain('[data-tour="analytics-refresh-btn"]')
    expect(elements).toContain('[data-tour="analytics-charts"]')
    expect(elements).toContain('[data-tour="analytics-kpis"]')
    expect(elements).toContain('[data-tour="analytics-campaign-chart"]')
    expect(elements).toContain('[data-tour="analytics-inventory-alerts"]')

    const emojiRegex = /\p{Extended_Pictographic}/u
    for (const step of tour!.steps) {
      expect(emojiRegex.test(step.title)).toBe(false)
      expect(emojiRegex.test(step.description)).toBe(false)
      if (step.actionHint) expect(emojiRegex.test(step.actionHint)).toBe(false)
    }

    const clientTour = getActiveTourForContext({ activeTab: 'analytics', role: 'client' })
    expect(clientTour).toBeNull()
  })

  it('retorna el tour de cuenta para todos los roles con selectores verificados y 0 emojis', () => {
    const roles: ('admin' | 'worker' | 'client')[] = ['admin', 'worker', 'client']
    const emojiRegex = /\p{Extended_Pictographic}/u
    for (const role of roles) {
      const tour = getActiveTourForContext({ activeTab: 'account', role })
      expect(tour?.id).toBe('tour-account')
      expect(tour?.steps.length).toBe(8)
      const elements = tour!.steps.map((s) => s.element)
      expect(elements).toContain('[data-tour="account-header"]')
      expect(elements).toContain('[data-tour="account-hero"]')
      expect(elements).toContain('[data-tour="account-avatar-btn"]')
      expect(elements).toContain('[data-tour="account-profile-details"]')
      expect(elements).toContain('[data-tour="account-sessions"]')
      expect(elements).toContain('[data-tour="account-sessions-revoke-btn"]')
      expect(elements).toContain('[data-tour="account-security"]')
      expect(elements).toContain('[data-tour="account-password-form"]')

      for (const step of tour!.steps) {
        expect(emojiRegex.test(step.title)).toBe(false)
        expect(emojiRegex.test(step.description)).toBe(false)
        if (step.actionHint) expect(emojiRegex.test(step.actionHint)).toBe(false)
      }
    }
  })

  it('retorna el tour de notificaciones para todos los roles con selectores verificados', () => {
    const roles: ('admin' | 'worker' | 'client')[] = ['admin', 'worker', 'client']
    for (const role of roles) {
      const tour = getActiveTourForContext({ activeTab: 'notifications', role })
      expect(tour?.id).toBe('tour-notifications')
      const elements = tour!.steps.map((s) => s.element)
      expect(elements).toContain('[data-tour="notifications-header"]')
      expect(elements).toContain('[data-tour="notifications-refresh-btn"]')
      expect(elements).toContain('[data-tour="notifications-list"]')
    }
  })
})
