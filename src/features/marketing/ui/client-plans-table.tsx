import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ClientPlan, MarketingClient } from '../api/clients-api'
import type { MarketingPlan } from '../api/plans-api'
import { clientLabel } from './client-plans.constants'
import { PlanChip } from './plan-chip'
import { findPlanByName } from './plans.utils'

interface ClientPlansTableProps {
  clients: MarketingClient[]
  /** Catálogo completo (activos e inactivos), para pintar el chip. */
  plans: MarketingPlan[]
  /** Solo los planes activos: los únicos que se ofrecen al asignar. */
  activePlans: MarketingPlan[]
  isBusy: boolean
  onAssignPlan: (clientId: string, plan: ClientPlan) => void
  onWhatsApp?: (client: MarketingClient) => void
}

export function ClientPlansTable({
  clients,
  plans,
  activePlans,
  isBusy,
  onAssignPlan,
  onWhatsApp,
}: ClientPlansTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto scroll-smooth scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Plan actual</th>
                <th className="px-4 py-3 text-right font-semibold">Asignar plan</th>
                {onWhatsApp && <th className="px-4 py-3 text-right font-semibold">Contacto</th>}
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => {
                const plan = findPlanByName(plans, client.plan)
                const planAsignable = plan?.active ? plan.name : ''
                return (
                  <tr
                    key={client.clientId}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-medium">{clientLabel(client)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {client.contactInfo || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <PlanChip name={client.plan} plan={plan} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        aria-label={`Asignar plan a ${clientLabel(client)}`}
                        value={planAsignable}
                        disabled={isBusy || activePlans.length === 0}
                        onChange={(e) => onAssignPlan(client.clientId, e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-60"
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
                    </td>
                    {onWhatsApp && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 whitespace-nowrap text-xs"
                          onClick={() => onWhatsApp(client)}
                          data-tour={index === 0 ? 'marketing-whatsapp-btn' : undefined}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Abrir en WhatsApp
                        </Button>
                      </td>
                    )}
                  </tr>
                )
              })}
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
