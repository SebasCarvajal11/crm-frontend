import { ArrowRight, Filter, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { FunnelResponse, FunnelStageKey } from '../api/commercial-api'
import { FUNNEL_ORDER, FUNNEL_STAGE_HELP, formatConversion, normalizeFunnel } from './commercial.utils'

export interface FunnelViewProps {
  data?: FunnelResponse | null
  isLoading: boolean
  isError: boolean
  /** '' = histórico. */
  period: string
  periodOptions: { value: string; label: string }[]
  onPeriodChange: (period: string) => void
  onStageClick: (stage: FunnelStageKey, label: string) => void
  onRetry: () => void
}

/** Embudo comercial: seis etapas en horizontal (en pantallas pequeñas, vertical). */
export function FunnelView({
  data,
  isLoading,
  isError,
  period,
  periodOptions,
  onPeriodChange,
  onStageClick,
  onRetry,
}: FunnelViewProps) {
  const stages = normalizeFunnel(data)
  const max = Math.max(1, ...stages.map((s) => s.count))

  return (
    <section
      aria-labelledby="funnel-title"
      data-tour="marketing-home-funnel"
      className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Filter className="size-5" />
          </div>
          <div>
            <h2 id="funnel-title" className="text-base font-bold tracking-tight">
              Embudo comercial
            </h2>
            <p className="text-xs text-muted-foreground">
              Cuántos clientes hay en cada paso, del primer contacto al proyecto. Pulse una etapa para ver sus clientes.
            </p>
          </div>
        </div>
        <select
          aria-label="Período del embudo"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium sm:w-48"
        >
          {periodOptions.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[1800px]:grid-cols-6" role="status" aria-label="Cargando embudo">
          {FUNNEL_ORDER.map((k) => (
            <Skeleton key={k} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/40 py-8 text-center">
          <XCircle className="mx-auto mb-2 size-8 text-destructive" />
          <p className="text-sm font-medium">No se pudo cargar el embudo</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : (
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[1800px]:grid-cols-6">
          {stages.map((stage, i) => {
            const help = FUNNEL_STAGE_HELP[stage.key]
            const width = Math.max(8, Math.round((stage.count / max) * 100))
            const next = stages[i + 1]
            return (
              <li key={stage.key} className="flex min-w-0">
                <button
                  type="button"
                  onClick={() => onStageClick(stage.key, stage.label)}
                  data-funnel-stage={stage.key}
                  data-tour={i === 0 ? 'marketing-funnel-stage' : undefined}
                  className={cn(
                    'group flex w-full min-w-0 flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 p-4 text-left',
                    'transition-colors hover:border-primary/50 hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                  )}
                  aria-label={`${stage.label}: ${stage.count} clientes. Ver la lista`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {stage.label}
                    </span>
                  </span>
                  <span className="text-3xl font-extrabold leading-none tabular-nums">{stage.count}</span>
                  <span className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <span className="block h-full rounded-full bg-primary/70" style={{ width: `${width}%` }} />
                  </span>
                  <span className="text-xs leading-snug text-foreground/80">{help.meaning}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{help.next}</span>
                  {next && (
                    <span
                      className="mt-auto flex flex-wrap items-center gap-1 border-t border-border/60 pt-2 text-xs text-muted-foreground"
                      title="Conversión a la siguiente etapa"
                      data-funnel-conversion={i}
                    >
                      <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="font-bold tabular-nums text-foreground">{formatConversion(stage.toNext)}</span>
                      <span>pasan a {next.label}</span>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      )}
      {!isLoading && !isError && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          La conversión compara cada etapa con la anterior. Puede pasar de 100 % porque un cliente puede estar en una
          etapa sin haber pasado por la anterior en el mismo período.
        </p>
      )}
    </section>
  )
}
