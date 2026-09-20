import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { DashboardTab } from '@/routes/-dashboard.search'

export type MentionPayload = {
  projectId: string
  channel: 'internal' | 'external' | 'system'
  messageId?: string | null
  resourceType?: string
  resourceId?: string | null
}

import type { WorkspaceTab } from '@/components/organisms/collab/project-workspace.types'
export type { WorkspaceTab }

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
                task_id: undefined,
              }),
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const openNotificationTarget = useCallback(
    (payload: MentionPayload) => {
      const isChat = payload.resourceType === 'chat_message' || Boolean(payload.messageId)
      const isTask = payload.resourceType === 'project_task'
      const isChangeRequest = payload.resourceType === 'project_change_request'
      const channel = payload.channel === 'internal' ? 'internal' : 'external'
      const messageId = payload.messageId ?? (isChat ? payload.resourceId ?? undefined : undefined)

      let workspaceTab: WorkspaceTab = 'board'
      if (isChat) workspaceTab = 'chat'
      else if (isChangeRequest) workspaceTab = 'change-requests'

      navigate({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: 'collab',
          project_id: payload.projectId,
          workspace_tab: workspaceTab,
          chat_channel: isChat ? channel : undefined,
          chat_message_id: isChat ? messageId : undefined,
          task_id: isTask ? payload.resourceId ?? undefined : undefined,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const goToMention = useCallback(
    (payload: MentionPayload) => {
      openNotificationTarget(payload)
    },
    [openNotificationTarget],
  )

  const openProject = useCallback(
    (projectId: string, workspaceTab: WorkspaceTab = 'board', taskId?: string) => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: 'collab',
          project_id: projectId,
          workspace_tab: workspaceTab,
          task_id: taskId,
        }),
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
        task_id: undefined,
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
    openNotificationTarget,
    openProject,
    closeProject,
    changeWorkspaceTab,
  }
}
