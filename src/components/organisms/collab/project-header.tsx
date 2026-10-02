import { User } from 'lucide-react'
import { ProjectTypeBadge } from '@/components/molecules/project-type-badge'
import { PARENT_COLUMNS, STATUS_DOT } from './collab.config'
import type { Project, ProjectListItem } from '@/features/collab/model'

type Props = {
  project: Project | ProjectListItem | null
}

/**
 * Componente hoja: header del workspace de un proyecto.
 * Muestra nombre, tipo, estado, cliente y barra de progreso.
 */
export function ProjectHeader({ project }: Props) {
  const status = project?.status ? PARENT_COLUMNS.find((c) => c.key === project.status) : null
  const pct = project?.progressPercent ?? 0

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:px-5 sm:py-4 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 line-clamp-2 text-base sm:text-lg font-bold tracking-tight text-foreground leading-tight sm:truncate" title={project?.name ?? undefined}>
              {project?.name ?? '…'}
            </h1>
            {project?.type && (
              <ProjectTypeBadge type={project.type} className="hidden sm:inline-flex" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
            {status && project && (
              <span className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${STATUS_DOT[project.status]} shadow-2xs`} aria-hidden="true" />
                {status.label}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-primary/70" aria-hidden="true" />
              <span className="truncate max-w-[160px]">{project?.clientName ?? '…'}</span>
            </span>
          </div>
        </div>
        {project && (
          <div className="flex items-center gap-3 shrink-0" role="progressbar"
            aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: ${pct}%`}>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-sm font-bold tabular-nums leading-none text-foreground">{pct}%</span>
              <div className="w-24 sm:w-32 h-2 bg-muted/80 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-primary to-[#bd2f35] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pct > 0 ? 4 : 0, pct)}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
