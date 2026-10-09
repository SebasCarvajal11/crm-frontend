import { describe, it, expect } from 'vitest'
import {
  getActiveTourForContext,
  getMissionsForContext,
  searchMissions,
  getQuestionsForContext,
  searchQuestions,
  getOnboardingChecklistForRole,
  ALL_TOURS,
  ALL_QUESTIONS,
} from './index'
import { collabClientApprovalsMission } from './collab.tour'

describe('Tour Registry Facade', () => {
  it('conservar IDs únicos y destinos autorizados en toda la ayuda', () => {
    expect(new Set(ALL_TOURS.map((tour) => tour.id)).size).toBe(ALL_TOURS.length)
    expect(new Set(ALL_QUESTIONS.map((question) => question.id)).size).toBe(ALL_QUESTIONS.length)
    for (const tour of ALL_TOURS) {
      expect(tour.steps.length).toBeGreaterThan(0)
      for (const step of tour.steps) {
        expect(step.element).not.toBe('')
        for (const role of step.requiredRole ?? []) expect(tour.roles).toContain(role)
        if (step.switchMarketingTab) expect(step.navigateTab ?? tour.tab).toBe('marketing')
        if (step.scope || step.switchWorkspaceTab) expect(step.navigateTab ?? tour.tab).toBe('collab')
      }
    }
    for (const question of ALL_QUESTIONS) {
      expect(Boolean(question.targetElement) !== Boolean(question.tourId)).toBe(true)
      if (question.tourId) {
        const tour = ALL_TOURS.find((item) => item.id === question.tourId)
        expect(tour).toBeDefined()
        for (const role of question.roles) expect(tour?.roles).toContain(role)
      }
    }
  })

  it('normalizar acentos y respetar el contexto kanban/workspace en búsquedas', () => {
    const ctx = { activeTab: 'collab', role: 'client' } as const
    expect(searchQuestions('tamaño', ctx)).toEqual(searchQuestions('tamano', ctx))
    expect(getQuestionsForContext(ctx).some((question) => question.scope === 'workspace')).toBe(false)
    expect(getQuestionsForContext({ ...ctx, projectId: 'project' }).some((question) => question.scope === 'kanban')).toBe(false)
    expect(searchMissions('ANALITICA', { activeTab: 'overview', role: 'admin' }).length).toBeGreaterThan(0)
  })
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

  it('declarar el contexto de navegación entre kanban y workspace', () => {
    const tour = getActiveTourForContext({
      activeTab: 'collab',
      role: 'admin',
    })
    expect(tour?.id).toBe('tour-collab-kanban')
    const cardStep = tour?.steps.find((s) => s.element === '[data-tour="collab-card-first"]')
    expect(cardStep?.scope).toBe('kanban')
    expect(tour?.steps.find((step) => step.element === '[data-tour="workspace-project-header"]')?.scope).toBe('workspace')

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
    expect(tour?.steps.length).toBe(10)
    const elements = tour!.steps.map((s) => s.element)
    expect(elements).toContain('[data-tour="marketing-header"]')
    expect(elements).toContain('[data-tour="marketing-tabs"]')
    expect(elements).toContain('[data-tour="marketing-clients-plans-grid"]')
    expect(elements).toContain('[data-tour="marketing-clients-sync-btn"]')
    expect(elements).toContain('[data-tour="marketing-new-campaign-btn"]')
    expect(elements).toContain('[data-tour="marketing-campaigns-filters"]')
    expect(elements).toContain('[data-tour="marketing-new-proposal-btn"]')
    expect(elements).toContain('[data-tour="marketing-new-workflow-btn"]')
    expect(elements).toContain('[data-tour="marketing-tab-segments"]')
    expect(elements).toContain('[data-tour="marketing-tab-interactions"]')

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

  it('retorna las 5 micro-misiones modulares para colaboracion incluyendo cliente', () => {
    const missions = getMissionsForContext({ activeTab: 'collab', role: 'admin' })
    expect(missions).toHaveLength(5)
    const missionIds = missions.map((m) => m.id)
    expect(missionIds).toContain('mission-collab-kanban')
    expect(missionIds).toContain('mission-collab-tasks')
    expect(missionIds).toContain('mission-collab-docs')
    expect(missionIds).toContain('mission-collab-changes')
    expect(missionIds).toContain('mission-collab-client-approvals')
    expect(collabClientApprovalsMission.roles).toContain('client')
  })

  it('proporciona un checklist de onboarding estructurado por rol (Opción B)', () => {
    const clientChecklist = getOnboardingChecklistForRole('client')
    expect(clientChecklist).toHaveLength(3)
    expect(clientChecklist.map((m) => m.id)).toEqual([
      'mission-collab-kanban',
      'mission-collab-client-approvals',
      'tour-account',
    ])

    const workerChecklist = getOnboardingChecklistForRole('worker')
    expect(workerChecklist).toHaveLength(3)
    expect(workerChecklist.map((m) => m.id)).toEqual([
      'mission-collab-tasks',
      'mission-collab-docs',
      'tour-account',
    ])

    const adminChecklist = getOnboardingChecklistForRole('admin')
    expect(adminChecklist).toHaveLength(4)
    expect(adminChecklist.map((m) => m.id)).toEqual([
      'mission-collab-kanban',
      'tour-admin',
      'tour-marketing',
      'tour-analytics',
    ])
  })

  it('soporta busqueda multitoken tolerante al orden de palabras en misiones y preguntas', () => {
    const ctx = { activeTab: 'collab', role: 'admin' } as const
    // Búsqueda con palabras fuera de orden ("kanban exploracion" debe hallar "Exploración del Tablero Kanban")
    const missionMatches = searchMissions('kanban exploracion', ctx)
    expect(missionMatches.length).toBeGreaterThan(0)
    expect(missionMatches.some((m) => m.id === 'mission-collab-kanban')).toBe(true)

    // Búsqueda de preguntas multitoken fuera de orden
    const questionMatches = searchQuestions('crear proyecto nuevo', ctx)
    expect(questionMatches.length).toBeGreaterThan(0)
    expect(questionMatches.some((q) => q.id === 'collab-q3')).toBe(true)
  })

  it('permite buscar micro-misiones por termino clave', () => {
    const matches = searchMissions('tareas', { activeTab: 'collab', role: 'admin' })
    expect(matches.length).toBeGreaterThan(0)
    expect(matches.some((m) => m.id === 'mission-collab-tasks')).toBe(true)
  })
})
