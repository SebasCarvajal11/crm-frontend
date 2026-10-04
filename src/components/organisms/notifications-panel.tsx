import { useQuery } from '@tanstack/react-query'
import { Bell, RefreshCw } from 'lucide-react'
import { listUnreadNotificationsRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/molecules/page-header'
import { NotificationCollapseRow } from './notifications/notification-collapse-row'
import { NotificationCard } from './notifications/notification-card'
import { useNotificationDismiss } from './notifications/use-notification-dismiss'

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

function NotificationsSkeletonList() {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando notificaciones">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/80 bg-card p-4.5 space-y-2.5 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <Skeleton className="h-4.5 w-56 rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

function NotificationsEmptyState() {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-2xl border border-dashed',
        'border-border/80 bg-card/40 py-16 px-4 text-center',
      ].join(' ')}
    >
      <div
        className={[
          'flex size-12 items-center justify-center rounded-2xl bg-muted/80',
          'text-muted-foreground shadow-2xs mb-3',
        ].join(' ')}
      >
        <Bell className="size-6 text-muted-foreground/70" />
      </div>
      <h4 className="text-sm font-bold text-foreground">Bandeja al día</h4>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
        No tienes notificaciones ni menciones sin leer en tus proyectos asignados.
      </p>
    </div>
  )
}

export function NotificationsPanel({ accessToken, onOpenNotification }: Props) {
  const notificationsQ = useQuery({
    queryKey: collabKeys.notifications(),
    queryFn: () => listUnreadNotificationsRequest(accessToken),
    enabled: Boolean(accessToken?.trim()),
    select: (d) => d.data,
  })

  const { dismissingIds, hiddenIds, handleDismiss, handleOpen } =
    useNotificationDismiss({ accessToken, onOpenNotification })

  const rawRows = notificationsQ.data ?? []
  const visibleRows = rawRows.filter((n) => !hiddenIds.has(n.id))

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
        {notificationsQ.isLoading && <NotificationsSkeletonList />}

        {!notificationsQ.isLoading && visibleRows.length === 0 && (
          <NotificationsEmptyState />
        )}

        {visibleRows.map((n) => (
          <NotificationCollapseRow
            key={n.id}
            id={n.id}
            isDismissing={dismissingIds.has(n.id)}
          >
            <NotificationCard
              notification={n}
              isDismissing={dismissingIds.has(n.id)}
              onOpen={handleOpen}
              onDismiss={handleDismiss}
            />
          </NotificationCollapseRow>
        ))}
      </div>
    </section>
  )
}
