import { AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminBlockedTaskItem } from '../model/overview.types'

type Props = {
  tasks: AdminBlockedTaskItem[]
  isLoading: boolean
  onOpenProject?: (projectId: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function OverviewAdminBlockedTasksSection({
  tasks,
  isLoading,
  onOpenProject,
}: Props) {
  return (
    <Card className="shadow-sm border border-destructive/30 bg-destructive/[0.02]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <CardTitle className="text-base font-bold text-foreground">
              Tareas bloqueadas (Cuellos de botella)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Tareas detenidas en columna de bloqueo en cualquier proyecto activo.
          </CardDescription>
        </div>
        {tasks.length > 0 && (
          <Badge variant="destructive" className="text-xs font-semibold">
            {tasks.length} {tasks.length === 1 ? 'bloqueada' : 'bloqueadas'}
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/[0.03] py-8 text-center">
            <CheckCircle className="size-8 text-emerald-500/80 mb-2" />
            <p className="text-sm font-medium text-foreground">Flujo despejado</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No hay tareas bloqueadas en ningún proyecto.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto scroll-smooth scrollbar-thin pr-1">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className={[
                  'flex flex-col justify-between gap-3 rounded-lg border border-destructive/25',
                  'bg-card/80 p-3.5 interactive-card hover:border-destructive/45 hover:bg-muted/40',
                  'sm:flex-row sm:items-center',
                ].join(' ')}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary">{task.projectName}</span>
                    <Badge variant="destructive" className="text-[10px] font-semibold">
                      Bloqueada
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold tracking-tight text-foreground line-clamp-1">
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      Registrada: {formatDate(task.createdAt)}
                    </span>
                    {task.deadline && (
                      <span className="inline-flex items-center gap-1 font-medium text-destructive">
                        Fecha límite: {formatDate(task.deadline)}
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
                    className="shrink-0 gap-1 text-xs border-destructive/40 hover:bg-destructive/10"
                  >
                    <span>Desatascar</span>
                    <ExternalLink className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
