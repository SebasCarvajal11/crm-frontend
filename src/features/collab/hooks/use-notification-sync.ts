import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listUnreadNotificationsRequest,
  markNotificationSeenRequest,
} from '@/features/collab/api'
import { collabKeys, type ProjectNotification } from '@/features/collab/model'
import { calculateNotificationDeltas } from '../utils/notification-delta'

const SYNC_INTERVAL_MS = 12_000
const MAX_CONCURRENT_TOASTS = 3

type SyncOptions = {
  accessToken: string | null
  onOpenTarget?: (item: ProjectNotification) => void
}

export function useNotificationSync({ accessToken, onOpenTarget }: SyncOptions) {
  const queryClient = useQueryClient()
  const knownIdsRef = useRef<Set<string> | null>(null)
  const [activeToasts, setActiveToasts] = useState<ProjectNotification[]>([])

  const query = useQuery({
    queryKey: collabKeys.notifications(),
    queryFn: () => listUnreadNotificationsRequest(accessToken!),
    enabled: Boolean(accessToken?.trim()),
    refetchInterval: SYNC_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 6_000,
    select: (res) => res.data,
  })

  const markSeenMutation = useMutation({
    mutationFn: (id: string) => markNotificationSeenRequest(accessToken!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.notifications() })
      void queryClient.invalidateQueries({ queryKey: collabKeys.notificationsCount() })
    },
  })

  useEffect(() => {
    const items = query.data ?? []
    if (!query.isSuccess) return

    const { updatedKnownIds, newlyArrived, isInitialMount } = calculateNotificationDeltas(
      items,
      knownIdsRef.current,
      MAX_CONCURRENT_TOASTS
    )
    knownIdsRef.current = updatedKnownIds

    if (!isInitialMount && newlyArrived.length > 0) {
      setActiveToasts((current) => {
        const combined = [...newlyArrived, ...current]
        return combined.slice(0, MAX_CONCURRENT_TOASTS)
      })
    }
  }, [query.data, query.isSuccess])

  const dismissToast = useCallback((id: string) => {
    setActiveToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const handleOpenNotification = useCallback(
    async (item: ProjectNotification) => {
      dismissToast(item.id)
      try {
        await markSeenMutation.mutateAsync(item.id)
      } finally {
        onOpenTarget?.(item)
      }
    },
    [dismissToast, markSeenMutation, onOpenTarget]
  )

  return {
    notifications: query.data ?? [],
    unreadCount: query.data?.length ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
    activeToasts,
    dismissToast,
    handleOpenNotification,
  }
}
