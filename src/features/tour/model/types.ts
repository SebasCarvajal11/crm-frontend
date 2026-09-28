import type { DashboardTab } from '@/routes/-dashboard.search'

export type TourUserRole = 'admin' | 'worker' | 'client'

export type TourPlacement = 'top' | 'right' | 'bottom' | 'left'

export type WorkspaceSubTab =
  | 'board'
  | 'chat'
  | 'brief'
  | 'contract'
  | 'change-requests'
  | 'members'

export type CimaTourStep = {
  element: string
  fallbackElement?: string
  title: string
  description: string
  actionHint?: string
  side?: TourPlacement
  requiredRole?: TourUserRole[]
  navigateTab?: DashboardTab
  scope?: 'kanban' | 'workspace'
  sidebar?: boolean
  switchWorkspaceTab?: WorkspaceSubTab
  switchMarketingTab?: string
  emptyStateDescription?: string
}

export type CimaTourDefinition = {
  id: string
  tab: DashboardTab
  workspaceTab?: WorkspaceSubTab
  title: string
  description: string
  roles: TourUserRole[]
  steps: CimaTourStep[]
  category?: 'onboarding' | 'advanced' | 'feature'
  badgeLabel?: string
  estimatedMinutes?: number
}

export type GuidedQuestionCategory =
  | 'flujo'
  | 'gestion'
  | 'comunicacion'
  | 'configuracion'

export type GuidedQuestion = {
  id: string
  question: string
  answer: string
  tab: DashboardTab
  workspaceTab?: WorkspaceSubTab
  marketingTab?: string
  scope?: 'kanban' | 'workspace' | 'all'
  roles: TourUserRole[]
  category: GuidedQuestionCategory
  targetElement?: string
  fallbackTargetElement?: string
  tourId?: string
}

export type TourContextState = {
  activeTab: DashboardTab
  role: TourUserRole
  projectId?: string
  workspaceTab?: WorkspaceSubTab
}
