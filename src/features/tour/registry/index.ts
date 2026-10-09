import type {
  CimaTourDefinition,
  GuidedQuestion,
  TourContextState,
  TourUserRole,
} from '../model/types'
import { overviewTour, overviewQuestions } from './overview.tour'
import {
  collabKanbanTour,
  collabWorkspaceTour,
  collabKanbanMission,
  collabTasksMission,
  collabDocsMission,
  collabChangesMission,
  collabClientApprovalsMission,
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
  collabClientApprovalsMission,
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

export function getOnboardingChecklistForRole(role: TourUserRole): CimaTourDefinition[] {
  if (role === 'client') {
    return [collabKanbanMission, collabClientApprovalsMission, accountTour]
  }
  if (role === 'worker') {
    return [collabTasksMission, collabDocsMission, accountTour]
  }
  return [collabKanbanMission, adminTour, marketingTour, analyticsTour]
}

export function searchMissions(query: string, ctx: TourContextState): CimaTourDefinition[] {
  const norm = normalizeSearch(query)
  if (!norm) return []
  const tokens = norm.split(/\s+/).filter(Boolean)
  const minMatches = tokens.length > 1 ? Math.ceil(tokens.length * 0.6) : 1
  return ALL_TOURS
    .map((t) => {
      if (!t.roles.includes(ctx.role)) return null
      const corpus = normalizeSearch(`${t.title} ${t.description} ${t.badgeLabel ?? ''}`)
      if (corpus.includes(norm)) return { t, score: tokens.length + 2 }
      const matched = tokens.filter((token) => corpus.includes(token)).length
      if (matched >= minMatches) return { t, score: matched }
      return null
    })
    .filter((item): item is { t: CimaTourDefinition; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.t)
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
  const tokens = norm.split(/\s+/).filter(Boolean)
  const minMatches = tokens.length > 1 ? Math.ceil(tokens.length * 0.6) : 1
  return baseList
    .map((q) => {
      const roleOk = q.roles.includes(ctx.role)
      const scopeOk = scopeMode === 'all' ? true : q.tab === ctx.activeTab || q.id.startsWith('global-')
      if (!roleOk || !scopeOk) return null
      const corpus = normalizeSearch(`${q.question} ${q.answer}`)
      if (corpus.includes(norm)) return { q, score: tokens.length + 2 }
      const matched = tokens.filter((t) => corpus.includes(t)).length
      if (matched >= minMatches) return { q, score: matched }
      return null
    })
    .filter((item): item is { q: GuidedQuestion; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.q)
}
