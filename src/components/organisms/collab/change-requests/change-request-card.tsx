import { useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProjectChangeRequest, ProjectMember, ProjectTask } from '@/features/collab/model'

type Props = {
  request: ProjectChangeRequest
  isAdmin: boolean
  members: ProjectMember[]
  tasks: ProjectTask[]
  onAccept: (request: ProjectChangeRequest) => void
  onReject: (request: ProjectChangeRequest) => void
}

const formatBogotaDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return '—'
  try {
    return new Date(ts).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false,
    })
  } catch {
    return '—'
  }
}

const priorityConfig: Record<
  string,
  { label: string; className: string }
> = {
  low: { label: 'Baja', className: 'bg-muted text-muted-foreground border-border' },
  medium: {
    label: 'Media',
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  },
  high: {
    label: 'Alta',
    className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  urgent: {
    label: 'Urgente',
    className:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-semibold',
  },
}

export function ChangeRequestCard({ request, isAdmin, members, tasks, onAccept, onReject }: Props) {
  const [expanded, setExpanded] = useState(false)

  const requesterEmail = members.find((m) => m.userSub === request.requestedBySub)?.email ?? 'Cliente'
  const resolverEmail = request.resolvedBySub
    ? (members.find((m) => m.userSub === request.resolvedBySub)?.email ?? 'Administrador')
    : null
  const linkedTask = request.taskId ? tasks.find((t) => t.id === request.taskId) : null

  const isPending = request.status === 'open'
  const isApproved = request.status === 'accepted' || request.status === 'approved'
  const isRejected = request.status === 'rejected'

  const priorityMeta = priorityConfig[request.priority ?? 'medium'] ?? priorityConfig.medium

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {isPending && (
              <Badge
  variant="outline"
  className="gap-1 border-amber-200 bg-amber-50 text-amber-800 text-[11px] font-medium dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
>
                <Clock className="size-3" />
                Pendiente de revisión
              </Badge>
            )}
            {isApproved && (
              <Badge
  variant="outline"
  className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-medium dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
>
                <CheckCircle2 className="size-3" />
                Aceptada
              </Badge>
            )}
            {isRejected && (
              <Badge
  variant="outline"
  className="gap-1 border-rose-200 bg-rose-50 text-rose-800 text-[11px] font-medium dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
>
                <XCircle className="size-3" />
                Rechazada
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] font-normal">
              {request.type === 'minor' ? 'Ajuste menor' : 'Cambio formal'}
            </Badge>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${priorityMeta.className}`}>
              {request.priority === 'urgent' && <AlertTriangle className="mr-1 size-2.5" />}
              Prioridad {priorityMeta.label}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-foreground leading-snug">{request.title}</h4>

          <p className={`text-xs text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {request.description}
          </p>

          {request.description.length > 140 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              {expanded ? 'Ver menos' : 'Ver más detalles'}
            </button>
          )}
        </div>

        {isAdmin && isPending && (
          <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onReject(request)}
              className={
  'h-8 gap-1 border-rose-200 text-xs text-rose-700 hover:bg-rose-50 hover:text-rose-800 ' +
  'dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30'
}
            >
              <XCircle className="size-3.5" />
              Rechazar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onAccept(request)}
              className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              <CheckCircle2 className="size-3.5" />
              Aceptar
            </Button>
          </div>
        )}
      </div>

      {request.justification && (
        <div className="mt-2.5 rounded-lg border bg-muted/20 p-2.5 text-xs">
          <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Justificación del cliente:</p>
          <p className="text-foreground leading-relaxed">{request.justification}</p>
        </div>
      )}

      {request.resolutionComment && (
        <div
  className={`mt-2.5 rounded-lg border p-2.5 text-xs ${
    isRejected
      ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
      : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
  }`}
>
          <p className="text-[11px] font-semibold mb-0.5">
            {isRejected ? 'Motivo del rechazo:' : 'Nota de resolución:'}
          </p>
          <p className="leading-relaxed">{request.resolutionComment}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="size-3" />
          Solicitado: {formatBogotaDate(request.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <UserRound className="size-3" />
          {requesterEmail}
        </span>
        {linkedTask && (
          <span className="inline-flex items-center gap-1">
            <FileText className="size-3" />
            Tarea: {linkedTask.title}
          </span>
        )}
        {resolverEmail && request.resolvedAt && (
          <span className="inline-flex items-center gap-1 text-foreground/80 font-medium">
            <CheckCircle2 className="size-3 text-primary" />
            {isRejected ? 'Rechazado por' : 'Aceptado por'} {resolverEmail} ({formatBogotaDate(request.resolvedAt)})
          </span>
        )}
      </div>
    </article>
  )
}
