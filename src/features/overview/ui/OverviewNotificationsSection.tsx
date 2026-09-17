import { Bell, CheckCheck, Clock, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProjectNotification } from '@/features/collab/model'

type Props = {
  notifications: ProjectNotification[]
  isLoading: boolean
  onOpen: (item: ProjectNotification) => void
}

const formatNotificationDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })
}

function EmptyNotifications() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center">
      <CheckCheck className="size-8 text-emerald-500/80 mb-2" />
      <p className="text-sm font-medium text-foreground">Sin notificaciones</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Estás al día. No tienes avisos ni menciones pendientes por leer.
      </p>
    </div>
  )
}

function NotificationItem({
  item,
  onOpen,
}: {
  item: ProjectNotification
  onOpen: (item: ProjectNotification) => void
}) {
  const channelLabel =
    item.source === 'mention'
      ? 'Mención directa'
      : item.channel === 'internal'
        ? 'Canal interno'
        : 'Canal de proyecto'

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group relative flex w-full flex-col items-start rounded-lg border bg-card/60 p-3 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] hover:border-primary/40 hover:bg-muted/60 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <div className="flex w-full items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-primary truncate max-w-[200px]">
          {item.project_name}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
          <Clock className="size-3" />
          {formatNotificationDate(item.created_at)}
        </span>
      </div>
      <p className="mt-1 text-xs font-bold text-foreground line-clamp-1">{item.title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.body}</p>
      <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        <MessageSquare className="size-3" />
        <span>{channelLabel}</span>
      </div>
    </button>
  )
}

function NotificationsFooter({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
      <span>Haz clic en un aviso para ir al proyecto</span>
      <span className="font-medium text-foreground/80">
        {count} {count === 1 ? 'pendiente' : 'pendientes'}
      </span>
    </div>
  )
}

export function OverviewNotificationsSection({ notifications, isLoading, onOpen }: Props) {
  return (
    <Card className="shadow-sm border border-border/80 h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Últimas notificaciones</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Novedades y menciones no leídas, ordenadas de más antigua a más reciente.
          </CardDescription>
        </div>
        {notifications.length > 0 && (
          <Badge variant="destructive" className="text-xs font-semibold">
            {notifications.length} {notifications.length === 1 ? 'pendiente' : 'pendientes'}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between gap-3 pt-1">
        {isLoading ? (
          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <>
            <div className="space-y-2.5 max-h-[225px] overflow-y-auto scroll-smooth scrollbar-thin pr-1">
              {notifications.map((item) => (
                <NotificationItem key={item.id} item={item} onOpen={onOpen} />
              ))}
            </div>
            <NotificationsFooter count={notifications.length} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
