import { memo } from 'react'
import { User } from 'lucide-react'
import { ProjectTypeBadge } from '@/components/molecules/project-type-badge'
import type { ProjectListItem } from '@/features/collab/model'

type Props = {
  project: ProjectListItem
  onClick: () => void
}

function getProgressGradient(pct: number): string {
  if (pct === 100) return 'bg-gradient-to-r from-emerald-500 to-teal-500'
  if (pct >= 70) return 'bg-gradient-to-r from-blue-500 to-indigo-500'
  if (pct >= 35) return 'bg-gradient-to-r from-amber-500 to-orange-500'
  return 'bg-muted-foreground/30'
}

function ProjectCardProgressBar({ pct }: { pct: number }) {
  const progressColor = getProgressGradient(pct)
  const barWidth = Math.max(pct > 0 ? 6 : 0, pct)

  return (
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
      <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden p-0.5 relative">
        <div
          className={[
            'h-full rounded-full transition-[width] duration-500 ease-out',
            'relative overflow-hidden',
            progressColor,
          ].join(' ')}
          style={{ width: `${barWidth}%` }}
        >
          {pct > 0 && (
            <div
              aria-hidden="true"
              className={[
                'absolute inset-0 bg-gradient-to-r from-transparent via-white/25',
                'to-transparent animate-progress-shimmer pointer-events-none',
              ].join(' ')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectCardHeader({
  name,
  clientName,
  type,
}: {
  name: string
  clientName: string
  type: ProjectListItem['type']
}) {
  const titleClass = [
    'font-bold text-sm tracking-tight leading-snug line-clamp-2',
    'group-hover:text-primary transition-colors',
  ].join(' ')

  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={titleClass}>{name}</span>
      </div>
      <div
        className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium"
        aria-label={`Cliente: ${clientName}`}
      >
        <User className="size-3.5 shrink-0 text-primary/70" aria-hidden="true" />
        <span className="truncate">{clientName}</span>
      </div>
      <div className="mb-3.5">
        <ProjectTypeBadge type={type} />
      </div>
    </>
  )
}

/** Organismo: tarjeta kanban de un proyecto en el tablero padre. */
export const ProjectCard = memo(function ProjectCard({ project, onClick }: Props) {
  const pct = project.progressPercent
  const label = `Abrir proyecto ${project.name}, cliente ${project.clientName}, ${pct}% completado`
  const cardClass = [
    'group w-full text-left rounded-2xl border border-border/80 bg-card p-4',
    'shadow-2xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5',
    'active:scale-[0.985] transition-all duration-200 focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'cursor-pointer',
  ].join(' ')

  return (
    <button type="button" onClick={onClick} aria-label={label} className={cardClass}>
      <ProjectCardHeader
        name={project.name}
        clientName={project.clientName}
        type={project.type}
      />
      <ProjectCardProgressBar pct={pct} />
    </button>
  )
})
