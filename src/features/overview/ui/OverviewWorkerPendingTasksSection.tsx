import { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, Clock, ExternalLink, ListTodo } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TaskPriority } from '@/features/collab/model'
import type { WorkerPendingTaskItem } from '../model/overview.types'

type Props = {
  tasks: WorkerPendingTaskItem[]
  isLoading: boolean
  onOpenProject?: (projectId: string) => void
}

const CURRENT_TIME_REFRESH_MS = 60_000

function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), CURRENT_TIME_REFRESH_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return currentTime
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, { label: string; className: string }> = {
    urgent: {
      label: 'Urgente',
      className: 'bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-400',
    },
    high: {
      label: 'Alta',
      className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400',
    },
    medium: {
      label: 'Media',
      className: 'bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400',
    },
    low: {
      label: 'Baja',
      className: 'bg-muted text-muted-foreground border-border',
    },
  }
  const item = map[priority] ?? map.medium
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${item.className}`}>
      {item.label}
    </Badge>
  )
}

function TaskRow({
  task,
  currentTime,
  onOpenProject,
}: {
  task: WorkerPendingTaskItem
  currentTime: number
  onOpenProject?: (projectId: string) => void
}) {
  const isOverdue = task.deadline && new Date(task.deadline).getTime() < currentTime

  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border bg-card/60 p-3.5 interactive-card hover:bg-muted/40 sm:flex-row sm:items-center">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-primary">{task.projectName}</span>
          <Badge variant="secondary" className="text-[10px] font-medium">
            {task.columnTitle}
          </Badge>
          <PriorityBadge priority={task.priority} />
        </div>
        <p className="text-sm font-semibold tracking-tight text-foreground line-clamp-1">
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            Creada: {formatDate(task.createdAt)}
          </span>
          {task.deadline && (
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                isOverdue ? 'text-destructive font-semibold' : ''
              }`}
            >
              <Calendar className="size-3" />
              {isOverdue ? 'Venció:' : 'Límite:'} {formatDate(task.deadline)}
            </span>
          )}
        </div>
      </div>
      {onOpenProject && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenProject(task.projectId)}
          className="shrink-0 gap-1 text-xs"
        >
          <span>Ir al tablero</span>
          <ExternalLink className="size-3" />
        </Button>
      )}
    </div>
  )
}

export function OverviewWorkerPendingTasksSection({
  tasks,
  isLoading,
  onOpenProject,
}: Props) {
  const currentTime = useCurrentTime()

  return (
    <Card className="shadow-sm border border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ListTodo className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Mis tareas pendientes</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Tareas asignadas ordenadas por antigüedad (más antiguas primero para priorizar desatasque).
          </CardDescription>
        </div>
        {tasks.length > 0 && (
          <Badge variant="secondary" className="text-xs font-semibold">
            {tasks.length} {tasks.length === 1 ? 'pendiente' : 'pendientes'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <CheckCircle2 className="size-8 text-emerald-500/80 mb-2" />
            <p className="text-sm font-medium text-foreground">¡Estás al día!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No tienes tareas pendientes asignadas en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <TaskRow
                key={task.taskId}
                task={task}
                currentTime={currentTime}
                onOpenProject={onOpenProject}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
