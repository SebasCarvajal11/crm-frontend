import { CheckCircle2, Circle, Play, Sparkles, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CimaTourDefinition } from '../model/types'

type OnboardingChecklistCardProps = {
  missions: CimaTourDefinition[]
  fullTour?: CimaTourDefinition | null
  isMissionCompleted: (missionId: string) => boolean
  onStartMission: (mission: CimaTourDefinition) => void
}

export function OnboardingChecklistCard({
  missions,
  fullTour,
  isMissionCompleted,
  onStartMission,
}: OnboardingChecklistCardProps) {
  const total = missions.length
  const completedCount = missions.filter((m) => isMissionCompleted(m.id)).length
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const allDone = percentage === 100

  return (
    <section
      aria-label="Checklist de Activación y Misiones"
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm"
    >
      {/* Encabezado con métrica de progreso */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
              Misiones de Activación y Adopción
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {completedCount} de {total} misiones completadas
            </p>
          </div>
        </div>
        <Badge
          variant={allDone ? 'default' : 'secondary'}
          className={`text-[10px] font-semibold py-0.5 px-2 ${
            allDone ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
          }`}
        >
          {percentage}%
        </Badge>
      </div>

      {/* Barra de progreso visual acelerada por GPU */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/80">
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: `${percentage}%` }}
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
        />
      </div>

      {/* Lista de micro-misiones guiadas */}
      <div className="mt-3.5 space-y-2">
        {missions.map((mission, idx) => {
          const completed = isMissionCompleted(mission.id)

          return (
            <div
              key={mission.id}
              className={`flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition-colors ${
                completed
                  ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/15'
                  : 'border-border/60 bg-background/50 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {completed ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {mission.title}
                    </span>
                    {mission.badgeLabel && (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-sm bg-muted text-muted-foreground">
                        {mission.badgeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {mission.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 mt-1">
                    <span>{mission.steps.length} pasos</span>
                    <span>•</span>
                    <span>~{mission.estimatedMinutes ?? 1} min</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant={completed ? 'outline' : 'default'}
                onClick={() => onStartMission(mission)}
                className="shrink-0 h-7 text-[11px] gap-1 px-2.5 font-medium cursor-pointer"
              >
                <Play className="size-3 fill-current" />
                {completed ? 'Repetir' : `Paso ${idx + 1}`}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Opción de recorrido integral completo */}
      {fullTour && (
        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-border/50 text-[11px]">
          <span className="text-muted-foreground">¿Prefieres ver todo junto?</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onStartMission(fullTour)}
            className="h-6 text-[11px] gap-1 px-2 text-primary hover:text-primary/90 cursor-pointer"
          >
            <Layers className="size-3" />
            Recorrido Integral
          </Button>
        </div>
      )}
    </section>
  )
}
