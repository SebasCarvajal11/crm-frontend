import { ArrowRight, FolderGit2, Layers } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ParentProjectStatus, ProjectListItem } from '@/features/collab/model'

type Props = {
  projects: ProjectListItem[]
  isLoading: boolean
  onOpenProject?: (projectId: string) => void
}

function ProjectStatusBadge({ status }: { status: ParentProjectStatus }) {
  const map: Record<ParentProjectStatus, { label: string; className: string }> = {
    todo: {
      label: 'Por iniciar',
      className: 'bg-muted text-muted-foreground border-border',
    },
    in_progress: {
      label: 'En progreso',
      className: 'bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400',
    },
    in_review: {
      label: 'En revisión',
      className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400',
    },
    completed: {
      label: 'Completado',
      className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
    },
  }
  const item = map[status] ?? map.in_progress
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold ${item.className}`}>
      {item.label}
    </Badge>
  )
}

export function OverviewAdminRecentProjectsSection({
  projects,
  isLoading,
  onOpenProject,
}: Props) {
  return (
    <Card className="shadow-sm border border-border/80 min-w-0 w-full max-w-full overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3 min-w-0 w-full">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <FolderGit2 className="size-4 text-primary shrink-0" />
            <CardTitle className="text-base font-bold truncate">Últimos proyectos</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Los 3 proyectos creados más recientemente y su estado de avance.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 w-full max-w-full overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 min-w-0 w-full">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center min-w-0 w-full">
            <Layers className="size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">Sin proyectos creados</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No se han registrado proyectos en la plataforma.
            </p>
          </div>
        ) : (
          <div className="space-y-3 min-w-0 w-full max-w-full overflow-hidden">
            {projects.map((project) => {
              const progress = Math.min(100, Math.max(0, project.progressPercent ?? 0))
              return (
                <div
                  key={project.id}
                  className="group rounded-lg border bg-card/60 p-3.5 interactive-card hover:bg-muted/40 min-w-0 w-full max-w-full overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0 w-full">
                    <div className="min-w-0 flex-1 space-y-0.5 overflow-hidden">
                      <p className="text-xs font-bold text-foreground truncate block min-w-0 w-full" title={project.name}>
                        {project.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate block min-w-0 w-full" title={project.clientName}>
                        Cliente: <span className="text-foreground/80">{project.clientName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ProjectStatusBadge status={project.status} />
                      {onOpenProject && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenProject(project.id)}
                          className="size-7 cursor-pointer"
                          aria-label={`Abrir proyecto ${project.name}`}
                        >
                          <ArrowRight className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 min-w-0 w-full">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full max-w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
