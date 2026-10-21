import { Users, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { FunnelClient } from '../api/commercial-api'
import type { MarketingPlan } from '../api/plans-api'
import { ClientNameButton } from './client-name-button'
import { PlanChip } from './plan-chip'
import { ScoreBar } from './score-bar'
import { findPlanByName } from './plans.utils'
import { formatShortDate } from './commercial.utils'

export interface FunnelStageClientsProps {
  clients?: FunnelClient[] | null
  isLoading: boolean
  isError: boolean
  plans: MarketingPlan[]
  onRetry: () => void
}

/** Clientes de una etapa del embudo (de mayor a menor puntaje). */
export function FunnelStageClients({ clients, isLoading, isError, plans, onRetry }: FunnelStageClientsProps) {
  const list = Array.isArray(clients) ? clients : []

  if (isLoading) {
    return (
      <div className="space-y-2 p-5" role="status" aria-label="Cargando clientes de la etapa">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }
  if (isError) {
    return (
      <div className="m-5 rounded-xl border border-destructive/40 py-8 text-center">
        <XCircle className="mx-auto mb-2 size-8 text-destructive" />
        <p className="text-sm font-medium">No se pudieron cargar los clientes</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }
  if (list.length === 0) {
    return (
      <div className="m-5 rounded-xl border border-dashed border-border py-10 text-center">
        <Users className="mx-auto mb-2 size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">Ningún cliente en esta etapa</p>
        <p className="mt-1 text-xs text-muted-foreground">Pruebe con otro período o con "Histórico".</p>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      <p className="mb-3 text-xs text-muted-foreground">
        {list.length} {list.length === 1 ? 'cliente' : 'clientes'}, de mayor a menor puntaje. Pulse un nombre para ver su
        ficha 360°.
      </p>
      <ul className="divide-y rounded-xl border border-border/80" data-testid="funnel-stage-clients">
        {list.map((c) => (
          <li key={c.clientId} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
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
    </div>
  )
}
