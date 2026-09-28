import type {
  CimaTourDefinition,
  GuidedQuestion,
  TourContextState,
} from '../model/types'
import { overviewTour, overviewQuestions } from './overview.tour'
import {
  collabKanbanTour,
  collabWorkspaceTour,
  collabKanbanMission,
  collabTasksMission,
  collabDocsMission,
  collabChangesMission,
  COLLAB_MISSIONS,
  collabQuestions,
} from './collab.tour'
import { marketingTour, marketingQuestions } from './marketing.tour'
import { adminTour, adminQuestions } from './admin.tour'
import { analyticsTour, analyticsQuestions } from './analytics.tour'
import { accountTour, accountQuestions } from './account.tour'
import { notificationsTour, notificationsQuestions } from './notifications.tour'
import { commonQuestions } from './common.questions'

export const ALL_TOURS: CimaTourDefinition[] = [
  overviewTour,
  collabKanbanTour,
  collabWorkspaceTour,
  collabKanbanMission,
  collabTasksMission,
  collabDocsMission,
  collabChangesMission,
  marketingTour,
  adminTour,
  analyticsTour,
  accountTour,
  notificationsTour,
]

export const ALL_QUESTIONS: GuidedQuestion[] = [
  ...overviewQuestions,
  ...collabQuestions,
  ...marketingQuestions,
  ...adminQuestions,
  ...analyticsQuestions,
  ...accountQuestions,
  ...notificationsQuestions,
  ...commonQuestions,
]

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es')
}

export function getActiveTourForContext(ctx: TourContextState): CimaTourDefinition | null {
  if (ctx.activeTab === 'collab') {
    return ctx.projectId ? collabWorkspaceTour : collabKanbanTour
  }
  const match = ALL_TOURS.find(
    (t) => t.tab === ctx.activeTab && t.roles.includes(ctx.role)
  )
  return match ?? null
}

export function getMissionsForContext(ctx: TourContextState): CimaTourDefinition[] {
  if (ctx.activeTab === 'collab') {
    return COLLAB_MISSIONS.filter((m) => m.roles.includes(ctx.role))
  }
  return ALL_TOURS.filter(
    (t) => t.tab === ctx.activeTab && t.roles.includes(ctx.role)
  )
}

export function searchMissions(query: string, ctx: TourContextState): CimaTourDefinition[] {
  const norm = normalizeSearch(query)
  if (!norm) return []
  return ALL_TOURS.filter(
    (t) =>
      t.roles.includes(ctx.role) &&
      (normalizeSearch(t.title).includes(norm) ||
        normalizeSearch(t.description).includes(norm) ||
        (t.badgeLabel && normalizeSearch(t.badgeLabel).includes(norm)))
  )
}

export function getQuestionsForContext(ctx: TourContextState): GuidedQuestion[] {
  return ALL_QUESTIONS.filter((q) => {
    if (!q.roles.includes(ctx.role)) return false
    if (q.id.startsWith('global-')) return true
    if (q.tab === 'collab' && q.scope && q.scope !== 'all') {
      if (q.scope !== (ctx.projectId ? 'workspace' : 'kanban')) return false
    }
    return q.tab === ctx.activeTab
  })
}

export function searchQuestions(
  query: string,
  ctx: TourContextState,
  scopeMode: 'section' | 'all' = 'section'
): GuidedQuestion[] {
  const norm = normalizeSearch(query)
  const baseList =
    scopeMode === 'all'
      ? ALL_QUESTIONS.filter((q) => q.roles.includes(ctx.role))
      : getQuestionsForContext(ctx)

  if (!norm) return baseList
  return baseList.filter(
    (q) =>
      (scopeMode === 'all' ? true : q.tab === ctx.activeTab || q.id.startsWith('global-')) &&
      q.roles.includes(ctx.role) &&
      (normalizeSearch(q.question).includes(norm) ||
        normalizeSearch(q.answer).includes(norm))
  )
}
