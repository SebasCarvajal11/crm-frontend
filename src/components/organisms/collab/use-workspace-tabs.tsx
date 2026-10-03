import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileSignature,
  FileText,
  GitPullRequest,
  KanbanSquare,
  MessageSquare,
  Users,
} from 'lucide-react'
import { type SectionTabItem } from '@/components/molecules/section-tabs'
import { NotificationCounterBadge } from '@/components/atoms/notification-counter-badge'
import { listUnreadNotificationsRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { WorkspaceTab } from './project-workspace.types'

type UseWorkspaceTabsProps = {
  accessToken: string
  projectId: string
}

export function useWorkspaceTabs({ accessToken, projectId }: UseWorkspaceTabsProps) {
  const notificationsQ = useQuery({
    queryKey: collabKeys.notifications(),
    queryFn: () => listUnreadNotificationsRequest(accessToken),
    staleTime: 12_000,
  })

  const { unreadChatCount, hasUnreadMention } = useMemo(() => {
    const list = notificationsQ.data?.data ?? []
    const chat = list.filter(
      (n) =>
        n.project_id === projectId &&
        (n.resource_type === 'chat_message' || n.source === 'mention'),
    )
    return {
      unreadChatCount: chat.length,
      hasUnreadMention: chat.some((n) => n.source === 'mention'),
    }
  }, [notificationsQ.data, projectId])

  const tabs = useMemo<SectionTabItem<WorkspaceTab>[]>(
    () => [
      { value: 'board', label: 'Tablero', icon: <KanbanSquare className="size-4" /> },
      {
        value: 'chat',
        label: 'Conversación',
        icon: <MessageSquare className="size-4" />,
        badge:
          unreadChatCount > 0 ? (
            <NotificationCounterBadge
              count={unreadChatCount}
              maxCount={9}
              size="sm"
              hasMention={hasUnreadMention}
            />
          ) : undefined,
      },
      { value: 'brief', label: 'Brief', icon: <FileText className="size-4" /> },
      { value: 'contract', label: 'Contrato', icon: <FileSignature className="size-4" /> },
      {
        value: 'change-requests',
        label: 'Solicitud de cambios',
        icon: <GitPullRequest className="size-4" />,
      },
      { value: 'members', label: 'Integrantes', icon: <Users className="size-4" /> },
    ],
    [unreadChatCount, hasUnreadMention],
  )

  return { tabs, unreadChatCount }
}
