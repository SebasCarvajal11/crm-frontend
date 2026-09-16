import { AlertCircle, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ProjectChangeRequest } from '@/features/collab/model'
import { formatBogotaDate } from '@/features/collab/utils/collab-date'

export function StatusBadge({ status }: { status: string }) {
  if (status === 'open') {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-200 bg-amber-50 text-[10px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
      >
        <Clock className="size-2.5" /> Pendiente
      </Badge>
    )
  }
  if (status === 'accepted' || status === 'approved') {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        <CheckCircle2 className="size-2.5" /> Aprobado
      </Badge>
    )
  }
  if (status === 'rejected') {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-rose-200 bg-rose-50 text-[10px] text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
      >
        <XCircle className="size-2.5" /> Rechazado
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 border-purple-200 bg-purple-50 text-[10px] text-purple-800 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
    >
      <AlertTriangle className="size-2.5" /> {status}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null
  const colors: Record<string, string> = {
    urgent:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-semibold',
    high:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    medium:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    low: 'bg-muted text-muted-foreground border-border',
  }
  const labels: Record<string, string> = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  }
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[priority] ?? colors.low}`}>
      {labels[priority] ?? priority}
    </Badge>
  )
}

export function ChangeRequestItemCard({ item }: { item: ProjectChangeRequest }) {
  const isRejected = item.status === 'rejected'
  const isApproved = item.status === 'accepted' || item.status === 'approved'

  return (
    <li className="rounded-lg border bg-background p-3.5 space-y-2 transition-colors hover:bg-muted/20">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={item.status} />
          <PriorityBadge priority={item.priority} />
          <Badge variant="secondary" className="text-[10px] font-normal">
            {item.type === 'formal' ? 'Cambio formal' : 'Cambio menor'}
          </Badge>
        </div>
        <time dateTime={item.createdAt} className="text-[10px] text-muted-foreground">
          {formatBogotaDate(item.createdAt)}
        </time>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>

      {item.justification && (
        <div className="rounded bg-muted/40 p-2 text-xs text-muted-foreground">
          <span className="font-semibold text-[11px] block text-foreground mb-0.5">Justificación:</span>
          {item.justification}
        </div>
      )}

      {isRejected && item.resolutionComment && (
        <div className="flex items-start gap-1.5 rounded border border-rose-200/80 bg-rose-50/70 p-2 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[11px] block">Motivo del rechazo:</span>
            {item.resolutionComment}
          </div>
        </div>
      )}

      {isApproved && item.resolutionComment && (
        <div className="flex items-start gap-1.5 rounded border border-emerald-200/80 bg-emerald-50/70 p-2 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[11px] block">Nota de aprobación:</span>
            {item.resolutionComment}
          </div>
        </div>
      )}
    </li>
  )
}
