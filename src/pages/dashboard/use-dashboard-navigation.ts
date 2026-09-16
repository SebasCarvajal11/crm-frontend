import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { DashboardTab } from '@/routes/-dashboard.search'

export type MentionPayload = {
  projectId: string
  channel: 'internal' | 'external' | 'system'
  messageId?: string | null
}

export type WorkspaceTab = 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'

export function useDashboardNavigation() {
  const navigate = useNavigate({ from: '/dashboard' })

  const goTo = useCallback(
    (next: DashboardTab) => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: next,
          ...(next === 'collab'
            ? {}
            : {
                project_id: undefined,
                workspace_tab: undefined,
                chat_channel: undefined,
                chat_message_id: undefined,
              }),
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const goToMention = useCallback(
    (payload: MentionPayload) => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: 'collab',
          project_id: payload.projectId,
          workspace_tab: payload.messageId ? 'chat' : 'board',
          chat_channel: payload.messageId ? (payload.channel === 'internal' ? 'internal' : 'external') : undefined,
          chat_message_id: payload.messageId ?? undefined,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const openProject = useCallback(
    (projectId: string, workspaceTab: WorkspaceTab = 'board') => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({ ...prev, tab: 'collab', project_id: projectId, workspace_tab: workspaceTab }),
        replace: true,
      })
    },
    [navigate],
  )

  const closeProject = useCallback(() => {
    navigate({
      to: '/dashboard',
      search: (prev) => ({
        ...prev,
        project_id: undefined,
        workspace_tab: undefined,
        chat_channel: undefined,
        chat_message_id: undefined,
      }),
      replace: true,
    })
  }, [navigate])

  const changeWorkspaceTab = useCallback(
    (workspaceTab: WorkspaceTab) => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({ ...prev, workspace_tab: workspaceTab }),
        replace: true,
      })
    },
    [navigate],
  )

  return {
    navigate,
    goTo,
    goToMention,
    openProject,
    closeProject,
    changeWorkspaceTab,
  }
}
