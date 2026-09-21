import { AlertOctagon, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectTask } from '@/features/collab/model'

type Props = {
  task: ProjectTask
  canUnblock: boolean
  isUnblocking: boolean
  onOpenUnblock: () => void
}

export function TaskBlockerBanner({ task, canUnblock, isUnblocking, onOpenUnblock }: Props) {
  if (!task.blockType && !task.blockReason) return null

  const isClientTimeout = task.blockType === 'client_timeout'
  const blockedDate = task.blockedAt
    ? new Date(task.blockedAt).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/30 p-3.5 space-y-2.5 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold text-xs">
          <AlertOctagon className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {isClientTimeout
              ? 'Bloqueo Automático: SLA de Aprobación Excedido (48h)'
              : 'Bloqueo por Impedimento Interno del Equipo'}
          </span>
        </div>

        {canUnblock && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isUnblocking}
            onClick={onOpenUnblock}
            className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/50 shrink-0 gap-1"
          >
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Desbloquear
          </Button>
        )}
      </div>

      {task.blockReason && (
        <div className="text-xs text-rose-900 dark:text-rose-100 bg-white/70 dark:bg-black/20 rounded p-2 border border-rose-100 dark:border-rose-900/30">
          <span className="font-semibold text-rose-800 dark:text-rose-300">Motivo: </span>
          <span className="italic">{task.blockReason}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-y-1 text-[11px] text-rose-600 dark:text-rose-400">
        {blockedDate && (
          <span className="flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            Bloqueado el: {blockedDate}
          </span>
        )}
        <span className="flex items-center gap-1">
          <ShieldAlert className="size-3" aria-hidden="true" />
          {isClientTimeout
            ? 'Desbloqueo exclusivo: Administrador o Cliente'
            : 'Desbloqueo exclusivo: Administrador o Trabajador responsable'}
        </span>
      </div>
    </div>
  )
}
