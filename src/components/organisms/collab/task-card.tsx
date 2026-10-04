import { memo, useState } from 'react'
import { AlertOctagon, Calendar, CheckSquare, Clock, GripVertical, User } from 'lucide-react'
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

const blockedBadgeClass = [
  'inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full',
  'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-semibold gap-0.5',
].join(' ')

const clientBadgeClass = [
  'inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full',
  'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 gap-0.5',
].join(' ')

const deadlineBadgeClass = [
  'inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full',
  'bg-muted text-muted-foreground gap-0.5',
].join(' ')

function TaskCardBadges({ task }: { task: ProjectTask }) {
  const isTimeout = task.blockType === 'client_timeout'
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      <PriorityBadge priority={task.priority} />
      {task.blockType && (
        <span
          className={blockedBadgeClass}
          title={task.blockReason ? `Bloqueada: ${task.blockReason}` : 'Tarea Bloqueada'}
        >
          <AlertOctagon className="size-2.5" aria-hidden="true" />
          {isTimeout ? 'Timeout 48h' : 'Bloqueada'}
        </span>
      )}
      {task.isClientVisible && (
        <span className={clientBadgeClass}>
          <User className="size-2.5" aria-hidden="true" />
          Cliente
        </span>
      )}
      {task.deadline && (
        <span className={deadlineBadgeClass}>
          <Calendar className="size-2.5" aria-hidden="true" />
          {fmtShort(task.deadline)}
        </span>
      )}
    </div>
  )
}

function TaskCardProgressBar({ progress }: { progress: number }) {
  const barClass = [
    'h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400',
    'transition-[width] duration-300 ease-out relative overflow-hidden',
  ].join(' ')
  const shimmerClass = [
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/30',
    'to-transparent animate-progress-shimmer pointer-events-none',
  ].join(' ')

  return (
    <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden relative">
      <div className={barClass} style={{ width: `${progress}%` }}>
        {progress > 0 && <div aria-hidden="true" className={shimmerClass} />}
      </div>
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
      <TaskCardProgressBar progress={progress} />
    </div>
  )
}

function TaskCardFooter({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
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

function TaskCardHeader({ title, canDrag }: { title: string; canDrag: boolean }) {
  const titleClass = [
    'text-sm font-semibold tracking-tight leading-snug line-clamp-2',
    'text-foreground group-hover:text-primary transition-colors',
  ].join(' ')
  const gripClass = [
    'size-4 text-muted-foreground/30 group-hover:text-muted-foreground',
    'shrink-0 mt-0.5 cursor-grab transition-colors',
  ].join(' ')

  return (
    <div className="flex items-start justify-between gap-2 mb-1.5">
      <span className={titleClass}>{title}</span>
      {canDrag && <GripVertical className={gripClass} aria-hidden="true" />}
    </div>
  )
}

function getCardBorderClass(isDragging: boolean, isSelected: boolean, isBlocked: boolean): string {
  if (isDragging) return 'border-dashed border-primary/50 opacity-50'
  if (isSelected) return 'ring-2 ring-primary ring-offset-1 shadow-md border-primary/60'
  if (isBlocked) return 'border-rose-500/50 bg-rose-500/[0.03] shadow-rose-500/5'
  return 'border-border/80 bg-card hover:border-primary/40'
}

const baseCardClass = [
  'group w-full text-left rounded-xl border p-3.5 shadow-2xs kanban-task-card',
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-primary focus-visible:ring-offset-1',
].join(' ')

/** Organismo: tarjeta arrastrable de tarea en el tablero hijo. */
export const TaskCard = memo(function TaskCard({ task, isSelected, canDrag, onClick }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const borderClass = getCardBorderClass(isDragging, isSelected, Boolean(task.blockType))

  const onDragStart = (e: React.DragEvent) => {
    if (!canDrag) return
    e.dataTransfer.setData('text/task-id', task.id)
    e.dataTransfer.effectAllowed = 'move'
    window.requestAnimationFrame(() => setIsDragging(true))
  }

  return (
    <button
      type="button"
      draggable={canDrag}
      data-dragging={isDragging}
      data-testid={`task-card-${task.id}`}
      onDragStart={onDragStart}
      onDragEnd={() => setIsDragging(false)}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Tarea: ${task.title}. Prioridad: ${task.priority}.`}
      className={`${baseCardClass} ${borderClass}`}
    >
      <TaskCardHeader title={task.title} canDrag={canDrag} />
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {task.description}
        </p>
      )}
      <TaskCardBadges task={task} />
      <TaskCardProgress subtasks={task.subtasks} progress={task.checklistProgress} />
      <TaskCardFooter createdAt={task.createdAt} updatedAt={task.updatedAt} />
    </button>
  )
})
