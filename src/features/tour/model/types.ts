import type { DashboardTab } from '@/routes/-dashboard.search'

export type TourUserRole = 'admin' | 'worker' | 'client'

export type TourPlacement = 'top' | 'right' | 'bottom' | 'left'
export type TourAlignment = 'start' | 'center' | 'end'

export type CimaTourStep = {
  element: string
  title: string
  description: string
  actionHint?: string
  side?: TourPlacement
  align?: TourAlignment
  showPointer?: boolean
  requiredRole?: TourUserRole[]
  switchWorkspaceTab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
}

export type CimaTourDefinition = {
  id: string
  tab: DashboardTab
  workspaceTab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
  title: string
  description: string
  roles: TourUserRole[]
  steps: CimaTourStep[]
}

export type GuidedQuestionCategory = 'flujo' | 'gestion' | 'comunicacion' | 'configuracion'

export type GuidedQuestion = {
  id: string
  question: string
  answer: string
  tab: DashboardTab
  workspaceTab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
  scope?: 'kanban' | 'workspace' | 'all'
  roles: TourUserRole[]
  category: GuidedQuestionCategory
  targetElement?: string
  tourId?: string
}

export type TourContextState = {
  activeTab: DashboardTab
  role: TourUserRole
  projectId?: string
  workspaceTab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
}
