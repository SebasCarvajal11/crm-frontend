import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listUnreadNotificationsRequest,
  markNotificationSeenRequest,
} from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { ProjectNotification } from '@/features/collab/model'

type OpenNotificationPayload = {
  projectId: string
  channel: 'internal' | 'external' | 'system'
  messageId?: string | null
  resourceType?: string
  resourceId?: string | null
}

export function useOverviewNotifications(
  accessToken: string,
  onOpenNotification?: (payload: OpenNotificationPayload) => void
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: collabKeys.notifications(),
    queryFn: () => listUnreadNotificationsRequest(accessToken),
    enabled: Boolean(accessToken?.trim()),
    select: (d) => d.data,
  })

  const markSeen = useMutation({
    mutationFn: (id: string) => markNotificationSeenRequest(accessToken, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.notifications() })
      void queryClient.invalidateQueries({ queryKey: collabKeys.notificationsCount() })
    },
  })

  // Ordenadas de más antigua a más nueva según requerimiento
  const notifications = useMemo(() => {
    const raw = query.data ?? []
    return raw.slice().sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
  }, [query.data])

  const handleOpen = useCallback(
    async (item: ProjectNotification) => {
      try {
        await markSeen.mutateAsync(item.id)
      } finally {
        onOpenNotification?.({
          projectId: item.project_id,
          channel: item.channel,
          messageId: item.message_id,
          resourceType: item.resource_type,
          resourceId: item.resource_id,
        })
      }
    },
    [markSeen, onOpenNotification]
  )

  return {
    notifications,
    isLoading: query.isLoading,
    refetch: query.refetch,
    handleOpen,
  }
}
