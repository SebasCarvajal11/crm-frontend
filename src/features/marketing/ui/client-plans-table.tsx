import { Card, CardContent } from '@/components/ui/card'
import type { ClientPlan, MarketingClient } from '../api/clients-api'
import { PLANS, planMeta, clientLabel } from './client-plans.constants'

interface ClientPlansTableProps {
  clients: MarketingClient[]
  isBusy: boolean
  onAssignPlan: (clientId: string, plan: ClientPlan) => void
}

export function ClientPlansTable({ clients, isBusy, onAssignPlan }: ClientPlansTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto scroll-smooth scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Identificador</th>
                <th className="px-4 py-3 font-semibold">Plan actual</th>
                <th className="px-4 py-3 text-right font-semibold">Asignar plan</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const meta = planMeta(client.plan)
                const Icon = meta?.icon
                return (
                  <tr
                    key={client.clientId}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{clientLabel(client)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {client.clientId.slice(0, 13)}…
                    </td>
                    <td className="px-4 py-3">
                      {meta && Icon ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.chip}`}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          Sin clasificar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={client.plan ?? ''}
                        disabled={isBusy}
                        onChange={(e) =>
                          onAssignPlan(client.clientId, e.target.value as ClientPlan)
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-60"
                      >
                        <option value="" disabled>
                          Elegir…
                        </option>
                        {PLANS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
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
