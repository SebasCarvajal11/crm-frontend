import { Eye, Filter, Loader2, Pencil, Target, Users, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { MarketingPlan } from '../api/plans-api'
import type { SavedSegment, SegmentClient } from '../api/segments-api'
import { clientCountLabel } from './audience.utils'
import { ClientNameButton } from './client-name-button'
import { formatShortDate } from './commercial.utils'
import { PlanChip } from './plan-chip'
import { findPlanByName } from './plans.utils'
import { ScoreBar } from './score-bar'
import { SAVED_SEGMENT_HELP, criteriaSummary } from './segment-criteria.utils'

export interface SavedSegmentsSectionProps {
  segments: SavedSegment[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onViewClients: (segment: SavedSegment) => void
  onEdit: (segment: SavedSegment) => void
  onToggleActive: (segment: SavedSegment) => void
  onLoadCriteria: (segment: SavedSegment) => void
  togglingId?: string | null
  /** Error al activar/desactivar (p. ej. 409: lo usa una campaña activa). */
  toggleError?: { segmentId: string; message: string } | null
}

/** Segmentos guardados: número de clientes, ver clientes, editar, activar o desactivar. */
export function SavedSegmentsSection({
  segments,
  isLoading,
  isError,
  onRetry,
  onViewClients,
  onEdit,
  onToggleActive,
  onLoadCriteria,
  togglingId,
  toggleError,
}: SavedSegmentsSectionProps) {
  return (
    <section className="space-y-3" aria-labelledby="saved-segments-title" data-tour="marketing-saved-segments">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Target className="size-5" />
        </span>
        <div>
          <h2 id="saved-segments-title" className="text-base font-bold tracking-tight">
            Segmentos guardados
          </h2>
          <p className="text-xs text-muted-foreground">{SAVED_SEGMENT_HELP}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando segmentos guardados">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/40 py-8 text-center">
          <XCircle className="mx-auto mb-2 size-8 text-destructive" />
          <p className="text-sm font-medium">No se pudieron cargar los segmentos guardados</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : segments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center">
          <Target className="mx-auto mb-2 size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">Todavía no hay segmentos guardados</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Calcule un segmento arriba y pulse “Guardar como segmento” para usarlo como audiencia de campañas.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-testid="saved-segments">
          {segments.map((s) => (
            <li
              key={s.segmentId}
              className={cn(
                'flex flex-col gap-2.5 rounded-xl border bg-card p-4 shadow-2xs',
                s.active ? 'border-border/80' : 'border-dashed border-border opacity-80'
              )}
              data-saved-segment={s.segmentId}
              data-active={s.active}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 font-semibold leading-snug">{s.name}</p>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    s.active
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {s.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {s.description?.trim() && <p className="line-clamp-2 text-xs text-muted-foreground">{s.description}</p>}
              <p className="text-[11px] text-muted-foreground">{criteriaSummary(s.criteria)}</p>
              <p className="flex items-center gap-1.5 text-sm font-bold tabular-nums">
                <Users className="size-4 text-primary" />
                {clientCountLabel(s.clientCount)}
              </p>
              {toggleError?.segmentId === s.segmentId && (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300" role="alert">
                  {toggleError.message}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border/60 pt-2.5">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => onViewClients(s)}>
                  <Eye className="size-3.5" />
                  Ver clientes
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs" onClick={() => onEdit(s)}>
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs" onClick={() => onLoadCriteria(s)}>
                  <Filter className="size-3.5" />
                  Usar criterios
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn('h-8 gap-1.5 text-xs', s.active && 'text-destructive hover:text-destructive')}
                  onClick={() => onToggleActive(s)}
                  disabled={togglingId === s.segmentId}
                >
                  {togglingId === s.segmentId && <Loader2 className="size-3.5 animate-spin" />}
                  {s.active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Clientes que hoy forman un segmento guardado. */
export function SegmentClientsList({
  clients,
  isLoading,
  isError,
  plans,
  onRetry,
}: {
  clients?: SegmentClient[] | null
  isLoading: boolean
  isError: boolean
  plans: MarketingPlan[]
  onRetry: () => void
}) {
  const list = Array.isArray(clients) ? clients : []
  if (isLoading) {
    return (
      <div className="space-y-2 p-5" role="status" aria-label="Cargando clientes del segmento">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    )
  }
  if (isError) {
    return (
      <div className="m-5 rounded-xl border border-destructive/40 py-8 text-center">
        <p className="text-sm font-medium">No se pudieron cargar los clientes</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }
  if (list.length === 0) {
    return <p className="m-5 rounded-xl border border-dashed py-8 text-center text-sm">Hoy ningún cliente cumple el criterio.</p>
  }
  return (
    <ul className="min-h-0 flex-1 divide-y overflow-y-auto px-5 pb-5" data-testid="segment-clients">
      {list.map((c) => (
        <li key={c.clientId} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <ClientNameButton clientId={c.clientId} name={c.name || c.clientId} className="font-medium" />
            <p className="text-xs text-muted-foreground">
              Último contacto: {c.lastContact ? formatShortDate(c.lastContact) : 'nunca'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PlanChip name={c.plan} plan={findPlanByName(plans, c.plan)} />
            <ScoreBar score={c.score} className="w-28" />
          </div>
        </li>
      ))}
    </ul>
  )
}
