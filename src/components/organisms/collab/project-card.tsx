import { memo } from 'react'
import { User } from 'lucide-react'
import { ProjectTypeBadge } from '@/components/molecules/project-type-badge'
import type { ProjectListItem } from '@/features/collab/model'

type Props = {
  project: ProjectListItem
  onClick: () => void
}

/** Organismo: tarjeta kanban de un proyecto en el tablero padre. */
export const ProjectCard = memo(function ProjectCard({ project, onClick }: Props) {
  const pct = project.progressPercent

  const progressColor =
    pct === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
    pct >= 70   ? 'bg-gradient-to-r from-blue-500 to-indigo-500'   :
    pct >= 35   ? 'bg-gradient-to-r from-amber-500 to-orange-500'  : 'bg-muted-foreground/30'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Abrir proyecto ${project.name}, cliente ${project.clientName}, ${pct}% completado`}
      className="group w-full text-left rounded-2xl border border-border/80 bg-card p-4 shadow-2xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.985] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-bold text-sm tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {project.name}
        </span>
      </div>

      <div
        className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium"
        aria-label={`Cliente: ${project.clientName}`}
      >
        <User className="size-3.5 shrink-0 text-primary/70" aria-hidden="true" />
        <span className="truncate">{project.clientName}</span>
      </div>

      <div className="mb-3.5">
        <ProjectTypeBadge type={project.type} />
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso: ${pct}%`}
        className="space-y-1.5"
      >
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span className="font-medium">Progreso</span>
          <span className="font-bold tabular-nums text-foreground">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${progressColor}`}
            style={{ width: `${Math.max(pct > 0 ? 6 : 0, pct)}%` }}
          />
        </div>
      </div>
    </button>
  )
})

