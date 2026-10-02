import { memo } from 'react'
import { AlertOctagon, Calendar, Clock, GripVertical, User, CheckSquare } from 'lucide-react'
import { PriorityBadge } from '@/components/molecules/priority-badge'
import type { ProjectTask } from '@/features/collab/model'

type Props = {
  task: ProjectTask
  isSelected: boolean
  canDrag: boolean
  onClick: () => void
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: '2-digit' })

const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' })

function TaskCardBadges({ task }: { task: ProjectTask }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      <PriorityBadge priority={task.priority} />
      {task.blockType && (
        <span
          className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-semibold gap-0.5"
          title={task.blockReason ? `Bloqueada: ${task.blockReason}` : 'Tarea Bloqueada'}
        >
          <AlertOctagon className="size-2.5" aria-hidden="true" />
          {task.blockType === 'client_timeout' ? 'Timeout 48h' : 'Bloqueada'}
        </span>
      )}
      {task.isClientVisible && (
        <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 gap-0.5">
          <User className="size-2.5" aria-hidden="true" />
          Cliente
        </span>
      )}
      {task.deadline && (
        <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground gap-0.5">
          <Calendar className="size-2.5" aria-hidden="true" />
          {fmtShort(task.deadline)}
        </span>
      )}
    </div>
  )
}

function TaskCardProgress({
  subtasks,
  progress,
}: {
  subtasks: ProjectTask['subtasks']
  progress: number
}) {
  if (!subtasks || subtasks.length === 0) return null

  const completedCount = subtasks.filter((s) => s.isCompleted).length
  return (
    <div
      className="mt-2.5"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1 font-medium">
        <span className="flex items-center gap-1">
          <CheckSquare className="size-3 text-emerald-600 dark:text-emerald-400" />
          {completedCount}/{subtasks.length}
        </span>
        <span className="font-bold tabular-nums text-foreground">{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function TaskCardFooter({
  createdAt,
  updatedAt,
}: {
  createdAt: string
  updatedAt: string
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
      <span className="flex items-center gap-0.5">
        <Clock className="size-2.5" aria-hidden="true" />
        Creada: {fmt(createdAt)}
      </span>
      <span>Actualizada: {fmt(updatedAt)}</span>
    </div>
  )
}

/** Organismo: tarjeta arrastrable de tarea en el tablero hijo. */
export const TaskCard = memo(function TaskCard({
  task,
  isSelected,
  canDrag,
  onClick,
}: Props) {
  const isBlocked = Boolean(task.blockType)
  const cardBorderClass = isBlocked
    ? 'border-rose-500/50 bg-rose-500/[0.03] shadow-rose-500/5'
    : 'border-border/80 bg-card hover:border-primary/40'

  return (
    <button
      type="button"
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return
        e.dataTransfer.setData('text/task-id', task.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Tarea: ${task.title}. Prioridad: ${task.priority}.`}
      className={`group w-full text-left rounded-xl border ${cardBorderClass} p-3.5 shadow-2xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 cursor-pointer ${
        isSelected ? 'ring-2 ring-primary ring-offset-1 shadow-md border-primary/60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-sm font-semibold tracking-tight leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {task.title}
        </span>
        {canDrag && (
          <GripVertical
            className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-0.5 cursor-grab transition-colors"
            aria-hidden="true"
          />
        )}
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{task.description}</p>
      )}

      <TaskCardBadges task={task} />
      <TaskCardProgress subtasks={task.subtasks} progress={task.checklistProgress} />
      <TaskCardFooter createdAt={task.createdAt} updatedAt={task.updatedAt} />
    </button>
  )
})

