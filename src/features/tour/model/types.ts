import type { DashboardTab } from '@/routes/-dashboard.search'

export type TourUserRole = 'admin' | 'worker' | 'client'

export type TourPlacement = 'top' | 'right' | 'bottom' | 'left'
export type TourAlignment = 'start' | 'center' | 'end'

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
  align?: TourAlignment
  showPointer?: boolean
  requiredRole?: TourUserRole[]
  navigateTab?: DashboardTab
  switchWorkspaceTab?: WorkspaceSubTab
  switchMarketingTab?: string
  onNextAction?: 'openProject' | 'closeProject'
}

export type CimaTourDefinition = {
  id: string
  tab: DashboardTab
  workspaceTab?: WorkspaceSubTab
  title: string
  description: string
  roles: TourUserRole[]
  steps: CimaTourStep[]
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
