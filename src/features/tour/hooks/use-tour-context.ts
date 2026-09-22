import { useEffect, useState } from 'react'
import { useSessionStore } from '@/app/session/session-store'
import { getAccessTokenRole } from '@/shared/lib/access-token-role'
import type { TourContextState, TourUserRole } from '../model/types'
import type { DashboardTab } from '@/routes/-dashboard.search'

function parseCurrentParams(): {
  tab: DashboardTab
  projectId?: string
  workspaceTab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
} {
  if (typeof window === 'undefined') {
    return { tab: 'overview' }
  }
  const params = new URLSearchParams(window.location.search)
  const rawTab = params.get('tab') as DashboardTab | null
  const validTabs: DashboardTab[] = [
    'overview',
    'collab',
    'marketing',
    'analytics',
    'admin',
    'account',
    'notifications',
  ]
  const tab: DashboardTab = rawTab && validTabs.includes(rawTab) ? rawTab : 'overview'
  const projectId = params.get('project_id') || undefined
  const rawWsTab = params.get('workspace_tab')
  const validWsTabs = ['board', 'chat', 'brief', 'contract', 'change-requests', 'members'] as const
  const workspaceTab = validWsTabs.includes(rawWsTab as (typeof validWsTabs)[number])
    ? (rawWsTab as (typeof validWsTabs)[number])
    : undefined

  return { tab, projectId, workspaceTab }
}

export function useTourContext(): TourContextState {
  const token = useSessionStore((s) => s.token)
  const role: TourUserRole = getAccessTokenRole(token) ?? 'worker'
  const [params, setParams] = useState(parseCurrentParams)

  useEffect(() => {
    const handleUrlChange = () => setParams(parseCurrentParams())
    window.addEventListener('popstate', handleUrlChange)
    const interval = setInterval(handleUrlChange, 400)
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      clearInterval(interval)
    }
  }, [])

  return {
    activeTab: role === 'client' && params.tab === 'overview' ? 'collab' : params.tab,
    role,
    projectId: params.projectId,
    workspaceTab: params.workspaceTab,
  }
}
