import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ClientPlan, MarketingClient } from '../api/clients-api'
import type { MarketingPlan } from '../api/plans-api'
import { clientLabel } from './client-plans.constants'
import { ClientNameButton } from './client-name-button'
import { PlanChip } from './plan-chip'
import { ScoreBar } from './score-bar'
import { findPlanByName } from './plans.utils'
import { nextScoreSort, sortByScore, type ScoreSort } from './commercial.utils'

interface ClientPlansTableProps {
  clients: MarketingClient[]
  /** Catálogo completo (activos e inactivos), para pintar el chip. */
  plans: MarketingPlan[]
  /** Solo los planes activos: los únicos que se ofrecen al asignar. */
  activePlans: MarketingPlan[]
  isBusy: boolean
  onAssignPlan: (clientId: string, plan: ClientPlan) => void
  onWhatsApp?: (client: MarketingClient) => void
  /** Orden inicial por puntaje (las pruebas lo fijan). */
  initialScoreSort?: ScoreSort
}

const SORT_LABEL: Record<ScoreSort, string> = {
  none: 'Ordenar por puntaje de mayor a menor',
  desc: 'Ordenar por puntaje de menor a mayor',
  asc: 'Quitar el orden por puntaje',
}

export function ClientPlansTable({
  clients,
  plans,
  activePlans,
  isBusy,
  onAssignPlan,
  onWhatsApp,
  initialScoreSort = 'none',
}: ClientPlansTableProps) {
  const [scoreSort, setScoreSort] = useState<ScoreSort>(initialScoreSort)
  const rows = useMemo(() => sortByScore(clients, scoreSort), [clients, scoreSort])

  const planSelect = (client: MarketingClient, className: string) => {
    const plan = findPlanByName(plans, client.plan)
    const planAsignable = plan?.active ? plan.name : ''
    return (
      <select
        aria-label={`Asignar plan a ${clientLabel(client)}`}
        value={planAsignable}
        disabled={isBusy || activePlans.length === 0}
        onChange={(e) => onAssignPlan(client.clientId, e.target.value)}
        className={`rounded-md border border-input bg-background px-2 text-xs disabled:opacity-60 ${className}`}
      >
        <option value="" disabled>
          {client.plan && !planAsignable ? 'Cambiar plan…' : 'Elegir…'}
        </option>
        {activePlans.map((p) => (
          <option key={p.planId} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
    )
  }

  const SortIcon = scoreSort === 'asc' ? ChevronUp : ChevronDown
  const sortIconClass = scoreSort === 'none' ? 'size-3.5 opacity-40' : 'size-3.5 text-primary'

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Celular y tablet: tarjetas sin desplazamiento horizontal. */}
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5 xl:hidden">
          <span className="text-xs text-muted-foreground">{rows.length} cliente(s)</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setScoreSort(nextScoreSort(scoreSort))}
            aria-label={SORT_LABEL[scoreSort]}
          >
            Puntaje
            <SortIcon className={sortIconClass} />
          </Button>
        </div>
        <ul className="grid md:grid-cols-2 xl:hidden" aria-label="Clientes">
          {rows.map((client) => (
            <li
              key={client.clientId}
              data-testid="client-card"
              className="flex flex-col gap-2.5 border-b p-4 last:border-b-0 md:odd:border-r md:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <ClientNameButton
                    clientId={client.clientId}
                    name={clientLabel(client)}
                    className="font-medium leading-snug"
                  />
                  <p className="truncate text-xs text-muted-foreground">{client.contactInfo || 'Sin correo'}</p>
                </div>
                <PlanChip name={client.plan} plan={findPlanByName(plans, client.plan)} />
              </div>
              <ScoreBar score={client.score} />
              <div className="mt-auto flex gap-2 pt-1">
                {planSelect(client, 'h-9 flex-1')}
                {onWhatsApp && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 gap-1.5 text-xs"
                    onClick={() => onWhatsApp(client)}
                    aria-label={`Abrir en WhatsApp a ${clientLabel(client)}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Escritorio: tabla con la columna de puntaje ordenable. */}
        <div className="hidden overflow-x-auto scroll-smooth scrollbar-thin xl:block">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Plan actual</th>
                <th
                  className="px-4 py-3 font-semibold"
                  aria-sort={scoreSort === 'desc' ? 'descending' : scoreSort === 'asc' ? 'ascending' : 'none'}
                >
                  <button
                    type="button"
                    onClick={() => setScoreSort(nextScoreSort(scoreSort))}
                    className="inline-flex items-center gap-1 rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    aria-label={SORT_LABEL[scoreSort]}
                    title={SORT_LABEL[scoreSort]}
                    data-tour="marketing-clients-score-sort"
                  >
                    Puntaje
                    <SortIcon className={sortIconClass} />
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">Asignar plan</th>
                {onWhatsApp && <th className="px-4 py-3 text-right font-semibold">Contacto</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((client, index) => (
                <tr
                  key={client.clientId}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors duration-150"
                >
                  <td className="px-4 py-3 font-medium">
                    <ClientNameButton clientId={client.clientId} name={clientLabel(client)} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{client.contactInfo || '—'}</td>
                  <td className="px-4 py-3">
                    <PlanChip name={client.plan} plan={findPlanByName(plans, client.plan)} />
                  </td>
                  <td className="w-40 px-4 py-3">
                    <ScoreBar score={client.score} />
                  </td>
                  <td className="px-4 py-3 text-right">{planSelect(client, 'h-8')}</td>
                  {onWhatsApp && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 whitespace-nowrap text-xs"
                        onClick={() => onWhatsApp(client)}
                        aria-label={`Abrir en WhatsApp a ${clientLabel(client)}`}
                        data-tour={index === 0 ? 'marketing-whatsapp-btn' : undefined}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Abrir en WhatsApp
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clients.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Ningún cliente coincide con el filtro.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
