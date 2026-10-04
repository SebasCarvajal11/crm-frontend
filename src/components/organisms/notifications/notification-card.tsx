import { Check, MessageSquare } from 'lucide-react'
import type { ProjectNotification } from '@/features/collab/model'
import { Badge } from '@/components/ui/badge'

type NotificationCardProps = {
  notification: ProjectNotification
  isDismissing: boolean
  onOpen: (notification: ProjectNotification) => void
  onDismiss: (id: string) => void
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })
}

function getBadgeLabel(n: ProjectNotification): string {
  if (n.source === 'mention') return 'Mención en chat'
  if (n.channel === 'internal') return 'Actividad interna'
  return 'Actividad del proyecto'
}

export function NotificationCard({
  notification,
  isDismissing,
  onOpen,
  onDismiss,
}: NotificationCardProps) {
  return (
    <div
      data-testid="notification-card"
      className={[
        'group relative flex items-start justify-between gap-3 w-full rounded-2xl',
        'border border-border/80 bg-card p-4.5 text-left shadow-2xs',
        'transition-all duration-150 hover:border-primary/35 hover:shadow-xs',
        isDismissing ? 'pointer-events-none opacity-60' : '',
      ].join(' ')}
    >
      <button
        type="button"
        disabled={isDismissing}
        onClick={() => onOpen(notification)}
        data-testid="notification-open-btn"
        className={[
          'min-w-0 flex-1 text-left cursor-pointer rounded-xl',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          'disabled:pointer-events-none',
        ].join(' ')}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pr-2">
          <span className="text-xs font-bold text-primary tracking-tight">
            {notification.project_name}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {formatWhen(notification.created_at)}
          </span>
        </div>

        <h5 className="mt-1 text-sm font-bold text-foreground leading-snug">
          {notification.title}
        </h5>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.body}
        </p>

        <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-2.5">
          <Badge
            variant="secondary"
            className="gap-1 text-[10px] font-semibold border border-border/50"
          >
            <MessageSquare className="size-3 text-muted-foreground" />
            {getBadgeLabel(notification)}
          </Badge>
        </div>
      </button>

      <button
        type="button"
        disabled={isDismissing}
        aria-label="Marcar como leída"
        title="Marcar como leída"
        data-testid="notification-dismiss-btn"
        onClick={() => onDismiss(notification.id)}
        className={[
          'inline-flex items-center justify-center size-8 rounded-xl',
          'border border-border/60 bg-muted/40 text-muted-foreground',
          'transition-colors duration-150 shrink-0',
          'hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400',
          'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          'cursor-pointer disabled:pointer-events-none disabled:opacity-40',
        ].join(' ')}
      >
        <Check className="size-4" />
      </button>
    </div>
  )
}
