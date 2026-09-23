import { useRouterState } from '@tanstack/react-router'
import { useSessionStore } from '@/app/session/session-store'
import { getAccessTokenRole } from '@/shared/lib/access-token-role'
import type { TourContextState, TourUserRole } from '../model/types'
import type { DashboardTab } from '@/routes/-dashboard.search'

const VALID_TABS: DashboardTab[] = [
  'overview',
  'collab',
  'marketing',
  'analytics',
  'admin',
  'account',
  'notifications',
]

const VALID_WS_TABS = [
  'board',
  'chat',
  'brief',
  'contract',
  'change-requests',
  'members',
] as const

export function useTourContext(): TourContextState {
  const token = useSessionStore((s) => s.token)
  const role: TourUserRole = getAccessTokenRole(token) ?? 'worker'

  const search = useRouterState({
    select: (s) => (s.location.search as Record<string, unknown>) ?? {},
  })

  const rawTab = search.tab as DashboardTab | undefined
  const tab: DashboardTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : 'overview'
  const projectId = typeof search.project_id === 'string' ? search.project_id : undefined
  const rawWsTab = search.workspace_tab as (typeof VALID_WS_TABS)[number] | undefined
  const workspaceTab = rawWsTab && VALID_WS_TABS.includes(rawWsTab) ? rawWsTab : undefined

  return {
    activeTab: role === 'client' && tab === 'overview' ? 'collab' : tab,
    role,
    projectId,
    workspaceTab,
  }
}
