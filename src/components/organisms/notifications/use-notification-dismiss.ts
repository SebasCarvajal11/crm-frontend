import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markNotificationSeenRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { ProjectNotification } from '@/features/collab/model'
import { notifyTransientNotice } from '@/shared/lib/transient-notice'

const COLLAPSE_DURATION_MS = 220

function getAnimationDuration(): number {
  if (typeof window === 'undefined') return COLLAPSE_DURATION_MS
  const prefersReduced = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  )?.matches
  return prefersReduced ? 0 : COLLAPSE_DURATION_MS
}

type Options = {
  accessToken: string
  onOpenNotification: (payload: {
    projectId: string
    channel: 'internal' | 'external' | 'system'
    messageId?: string | null
    resourceType?: string
    resourceId?: string | null
  }) => void
}

export function useNotificationDismiss({
  accessToken,
  onOpenNotification,
}: Options) {
  const queryClient = useQueryClient()
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(() => new Set())
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
    }
  }, [])

  const markSeen = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationSeenRequest(accessToken, notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.notifications() })
      void queryClient.invalidateQueries({ queryKey: collabKeys.notificationsCount() })
    },
  })

  const handleDismiss = useCallback(
    (id: string) => {
      setDismissingIds((prev) => new Set(prev).add(id))
      markSeen.mutate(id)

      const duration = getAnimationDuration()
      const timer = setTimeout(() => {
        setHiddenIds((prev) => new Set(prev).add(id))
        setDismissingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        timersRef.current.delete(id)
      }, duration)

      timersRef.current.set(id, timer)
    },
    [markSeen]
  )

  const handleOpen = useCallback(
    async (item: ProjectNotification) => {
      try {
        setDismissingIds((prev) => new Set(prev).add(item.id))
        await markSeen.mutateAsync(item.id)
        onOpenNotification({
          projectId: item.project_id,
          channel: item.channel,
          messageId: item.message_id,
          resourceType: item.resource_type,
          resourceId: item.resource_id,
        })
      } catch {
        setDismissingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.id)
          return next
        })
        notifyTransientNotice('No se pudo abrir la notificación. Intenta de nuevo.')
      }
    },
    [markSeen, onOpenNotification]
  )

  return {
    dismissingIds,
    hiddenIds,
    handleDismiss,
    handleOpen,
  }
}
