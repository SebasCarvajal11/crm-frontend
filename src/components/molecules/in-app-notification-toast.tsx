import { useEffect, useRef, useState } from 'react'
import { Bell, CheckSquare, FileText, GitPullRequest, MessageSquare, X } from 'lucide-react'
import type { ProjectNotification } from '@/features/collab/model'
import { cn } from '@/shared/lib/utils'

const TOAST_DURATION_MS = 6_000

type ToastItemProps = {
  notification: ProjectNotification
  onOpen: (item: ProjectNotification) => void
  onDismiss: (id: string) => void
}

function resolveNotificationIcon(type: string, source: string) {
  if (source === 'mention' || type === 'chat_message') return MessageSquare
  if (type === 'project_task') return CheckSquare
  if (type === 'project_change_request') return GitPullRequest
  if (type === 'project_file') return FileText
  return Bell
}

export function InAppNotificationToastItem({ notification, onOpen, onDismiss }: ToastItemProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [remainingMs, setRemainingMs] = useState(TOAST_DURATION_MS)
  const lastTickRef = useRef<number>(Date.now())
  const Icon = resolveNotificationIcon(notification.resource_type, notification.source)

  useEffect(() => {
    if (isPaused) return
    lastTickRef.current = Date.now()

    const interval = window.setInterval(() => {
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now
      setRemainingMs((prev) => {
        const next = prev - delta
        if (next <= 0) {
          clearInterval(interval)
          onDismiss(notification.id)
          return 0
        }
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPaused, notification.id, onDismiss])

  const progressPercent = Math.max(0, Math.min(100, (remainingMs / TOAST_DURATION_MS) * 100))

  return (
    <aside
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-xl border border-border/90',
        'bg-card/95 text-card-foreground shadow-xl backdrop-blur-md',
        'transition-all duration-200 animate-in fade-in-0 slide-in-from-top-3 active:scale-[0.99]'
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <button
          type="button"
          onClick={() => onOpen(notification)}
          className="min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="truncate text-[11px] font-bold tracking-tight text-primary">
              {notification.project_name}
            </span>
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
              Ahora
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {notification.body}
          </p>
          <p className="mt-1.5 text-[10px] font-medium text-primary hover:underline">
            Ver detalle →
          </p>
        </button>
        <button
          type="button"
          onClick={() => onDismiss(notification.id)}
          aria-label="Cerrar notificación"
          className="shrink-0 rounded-md p-1 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="h-0.5 w-full bg-muted/60">
        <div
          className="h-full bg-primary/80 transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </aside>
  )
}

export function InAppNotificationToastContainer({
  toasts,
  onOpen,
  onDismiss,
}: {
  toasts: ProjectNotification[]
  onOpen: (item: ProjectNotification) => void
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notificaciones en vivo"
      className={cn(
        'pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2.5',
        'w-[calc(100vw-2rem)] max-w-sm sm:w-96'
      )}
    >
      {toasts.map((item) => (
        <InAppNotificationToastItem
          key={item.id}
          notification={item}
          onOpen={onOpen}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
