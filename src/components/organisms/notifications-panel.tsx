import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, RefreshCw } from 'lucide-react'
import {
  listUnreadNotificationsRequest,
  markNotificationSeenRequest,
} from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { notifyTransientNotice } from '@/shared/lib/transient-notice'
import { Button } from '@/components/ui/button'

type Props = {
  accessToken: string
  onOpenNotification: (payload: { projectId: string; channel: 'internal' | 'external' | 'system'; messageId?: string | null }) => void
}

const formatWhen = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })
}

export function NotificationsPanel({ accessToken, onOpenNotification }: Props) {
  const queryClient = useQueryClient()

  const notificationsQ = useQuery({
    queryKey: collabKeys.notifications(),
    queryFn: () => listUnreadNotificationsRequest(accessToken),
    enabled: Boolean(accessToken?.trim()),
    refetchInterval: 20_000,
    select: (d) => d.data,
  })

  const markSeen = useMutation({
    mutationFn: (notificationId: string) => markNotificationSeenRequest(accessToken, notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.notifications() })
      void queryClient.invalidateQueries({ queryKey: collabKeys.notificationsCount() })
    },
  })

  const rows = notificationsQ.data ?? []

  const handleOpen = async (item: (typeof rows)[number]) => {
    try {
      await markSeen.mutateAsync(item.id)
      onOpenNotification({ projectId: item.project_id, channel: item.channel, messageId: item.message_id })
    } catch {
      notifyTransientNotice('No se pudo abrir la notificación. Intenta de nuevo.')
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          <p className="text-sm text-muted-foreground">Actividad y menciones sin leer de tus proyectos.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => notificationsQ.refetch()}>
          <RefreshCw className="mr-2 size-4" />
          Actualizar
        </Button>
      </div>

      {notificationsQ.isLoading && <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>}
      {!notificationsQ.isLoading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No tienes notificaciones sin leer.</p>
      )}

      <div className="space-y-2">
        {rows.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => void handleOpen(n)}
            className="w-full rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-muted"
          >
            <p className="text-xs font-semibold text-primary">{n.project_name}</p>
            <p className="text-xs text-muted-foreground">{formatWhen(n.created_at)}</p>
            <p className="mt-1 text-sm font-medium">{n.title}</p>
            <p className="mt-1 text-sm line-clamp-2">{n.body}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquare className="size-3" />
              {n.source === 'mention' ? 'Mención en chat' : n.channel === 'internal' ? 'Actividad interna' : 'Actividad del proyecto'}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
