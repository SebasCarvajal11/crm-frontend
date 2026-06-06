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
    <div className="rounded-2xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <h1 className="text-base font-semibold truncate leading-tight">{project?.name ?? '…'}</h1>
            {project?.type && (
              <ProjectTypeBadge type={project.type} className="hidden sm:inline-flex" />
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {status && project && (
              <span className="flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`} aria-hidden="true" />
                {status.label}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="size-3" aria-hidden="true" />
              <span className="truncate max-w-[140px]">{project?.clientName ?? '…'}</span>
            </span>
          </div>
        </div>
        {project && (
          <div className="flex items-center gap-2 shrink-0" role="progressbar"
            aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: ${pct}%`}>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-semibold leading-none">{pct}%</span>
              <div className="w-20 sm:w-28 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pct > 0 ? 4 : 0, pct)}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
