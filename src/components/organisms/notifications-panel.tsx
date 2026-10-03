import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, MessageSquare, RefreshCw } from 'lucide-react'
import {
  listUnreadNotificationsRequest,
  markNotificationSeenRequest,
} from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { notifyTransientNotice } from '@/shared/lib/transient-notice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/molecules/page-header'

type Props = {
  accessToken: string
  onOpenNotification: (payload: {
    projectId: string
    channel: 'internal' | 'external' | 'system'
    messageId?: string | null
    resourceType?: string
    resourceId?: string | null
  }) => void
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
      onOpenNotification({
        projectId: item.project_id,
        channel: item.channel,
        messageId: item.message_id,
        resourceType: item.resource_type,
        resourceId: item.resource_id,
      })
    } catch {
      notifyTransientNotice('No se pudo abrir la notificación. Intenta de nuevo.')
    }
  }

  return (
    <section className="space-y-6">
      <div data-tour="notifications-header">
        <PageHeader
          eyebrow={
            <>
              Centro de <span className="font-black text-primary">Novedades</span>
            </>
          }
          title={
            <>
              Bandeja de{' '}
              <span className="font-black tracking-tight text-foreground">
                Notificaciones
              </span>
            </>
          }
          description="Actividad, menciones y actualizaciones pendientes de tus proyectos."
          icon={Bell}
          actions={(
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-tour="notifications-refresh-btn"
              onClick={() => notificationsQ.refetch()}
            >
              <RefreshCw className="mr-2 size-4" />
              Actualizar
            </Button>
          )}
        />
      </div>

      <div data-tour="notifications-list" className="space-y-2 animate-fade-up">
        {notificationsQ.isLoading && (
          <div className="space-y-3" role="status" aria-label="Cargando notificaciones">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border/80 bg-card p-4.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-4.5 w-56 rounded-md" />
                <Skeleton className="h-3.5 w-full rounded-md" />
              </div>
            ))}
          </div>
        )}

        {!notificationsQ.isLoading && rows.length === 0 && (
          <div
            className={
              'flex flex-col items-center justify-center rounded-2xl border border-dashed ' +
              'border-border/80 bg-card/40 py-16 px-4 text-center'
            }
          >
            <div
              className={
                'flex size-12 items-center justify-center rounded-2xl bg-muted/80 ' +
                'text-muted-foreground shadow-2xs mb-3'
              }
            >
              <Bell className="size-6 text-muted-foreground/70" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Bandeja al día</h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              No tienes notificaciones ni menciones sin leer en tus proyectos asignados.
            </p>
          </div>
        )}

        {rows.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => void handleOpen(n)}
            className={[
              'w-full rounded-2xl border border-border/80 bg-card p-4.5 text-left shadow-2xs',
              'interactive-card cursor-pointer active:scale-[0.985] focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-primary/60',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-primary tracking-tight">{n.project_name}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{formatWhen(n.created_at)}</span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-foreground leading-snug">{n.title}</p>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.body}</p>
            <div
              className={
                'mt-3 flex items-center gap-2 border-t border-border/60 pt-2.5 text-[11px] ' +
                'text-muted-foreground'
              }
            >
              <Badge variant="secondary" className="gap-1 text-[10px] font-semibold border border-border/50">
                <MessageSquare className="size-3 text-muted-foreground" />
                {n.source === 'mention'
                  ? 'Mención en chat'
                  : n.channel === 'internal'
                    ? 'Actividad interna'
                    : 'Actividad del proyecto'}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
