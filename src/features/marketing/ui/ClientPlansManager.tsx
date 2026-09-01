import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Gem,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  listClientsRequest,
  assignClientPlanRequest,
  assignClientPlansBulkRequest,
  syncCrmRequest,
  type ClientPlan,
  type MarketingClient,
} from '../api/clients-api'

interface ClientPlansManagerProps {
  accessToken: string
}

const PLANS: { value: ClientPlan; label: string; icon: typeof Crown; chip: string }[] = [
  {
    value: 'Oro',
    label: 'Oro',
    icon: Crown,
    chip: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  {
    value: 'Esmeralda',
    label: 'Esmeralda',
    icon: Gem,
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    value: 'Premium',
    label: 'Premium',
    icon: Sparkles,
    chip: 'bg-violet-50 text-violet-800 border-violet-300',
  },
]

function planMeta(plan?: string | null) {
  return PLANS.find((p) => p.value === plan) ?? null
}

function clientLabel(client: MarketingClient) {
  return client.contactInfo || client.additionalInfo || client.clientId
}

export function ClientPlansManager({ accessToken }: ClientPlansManagerProps) {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('ALL')
  const [bulkPlan, setBulkPlan] = useState<ClientPlan>('Oro')
  const [feedback, setFeedback] = useState<string | null>(null)

  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients'],
    queryFn: () => listClientsRequest(accessToken),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['marketing', 'clients'] })
    void queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }

  const assignMutation = useMutation({
    mutationFn: ({ clientId, plan }: { clientId: string; plan: ClientPlan }) =>
      assignClientPlanRequest(accessToken, clientId, plan),
    onSuccess: invalidate,
  })

  const bulkMutation = useMutation({
    mutationFn: (asignaciones: Record<string, ClientPlan>) =>
      assignClientPlansBulkRequest(accessToken, asignaciones),
    onSuccess: (data) => {
      invalidate()
      setFeedback(`${data.actualizados} cliente(s) actualizados con el plan ${bulkPlan}.`)
    },
  })

  const syncMutation = useMutation({
    mutationFn: () => syncCrmRequest(accessToken),
    onSuccess: (data) => {
      invalidate()
      setFeedback(
        `Sincronización completada: ${data.clientesSincronizados} cliente(s) y ${data.proyectosSincronizados} proyecto(s).`
      )
    },
    onError: () =>
      setFeedback('No se pudo sincronizar. Verifique que el CRM base esté disponible.'),
  })

  const clients = clientsQuery.data ?? []

  const sinPlan = useMemo(() => clients.filter((c) => !c.plan), [clients])

  const conteoPorPlan = useMemo(() => {
    const mapa: Record<string, number> = { Oro: 0, Esmeralda: 0, Premium: 0 }
    clients.forEach((c) => {
      if (c.plan && mapa[c.plan] !== undefined) mapa[c.plan] += 1
    })
    return mapa
  }, [clients])

  const filtered = useMemo(() => {
    const termino = searchTerm.trim().toLowerCase()
    return clients.filter((c) => {
      if (planFilter === 'SIN_PLAN' && c.plan) return false
      if (planFilter !== 'ALL' && planFilter !== 'SIN_PLAN' && c.plan !== planFilter) return false
      if (!termino) return true
      return clientLabel(c).toLowerCase().includes(termino)
    })
  }, [clients, searchTerm, planFilter])

  function asignarATodosSinPlan() {
    const asignaciones: Record<string, ClientPlan> = {}
    sinPlan.forEach((c) => {
      asignaciones[c.clientId] = bulkPlan
    })
    if (Object.keys(asignaciones).length > 0) {
      bulkMutation.mutate(asignaciones)
    }
  }

  const isBusy = assignMutation.isPending || bulkMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Users className="h-6 w-6 text-primary" />
            CLIENTES Y PLANES
          </h2>
          <p className="text-sm text-muted-foreground">
            Clasificación comercial de la cartera sincronizada desde el CRM
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? 'Sincronizando…' : 'Sincronizar con el CRM'}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const total = conteoPorPlan[plan.value] ?? 0
          const pct = clients.length > 0 ? Math.round((total / clients.length) * 100) : 0
          return (
            <Card key={plan.value} className="border-l-4 border-l-primary">
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Plan {plan.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold leading-none">{total}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{pct}% de la cartera</p>
                </div>
                <div className="rounded-full bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}

        <Card className={`border-l-4 ${sinPlan.length > 0 ? 'border-l-amber-500' : 'border-l-muted'}`}>
          <CardContent className="flex items-start justify-between gap-3 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sin clasificar
              </p>
              <p className="mt-1 text-3xl font-bold leading-none">{sinPlan.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {sinPlan.length > 0 ? 'Pendientes de plan' : 'Cartera completa'}
              </p>
            </div>
            <div className="rounded-full bg-muted p-2">
              {sinPlan.length > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {feedback && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <span>{feedback}</span>
          <IconButton label="Cerrar aviso" onClick={() => setFeedback(null)}>
            <XCircle className="h-4 w-4" />
          </IconButton>
        </div>
      )}

      {sinPlan.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900">
              {sinPlan.length} cliente(s) sin plan asignado
            </p>
            <p className="text-amber-800">
              Los clientes sin plan quedan fuera de la segmentación por servicio contratado.
            </p>
          </div>
          <select
            value={bulkPlan}
            onChange={(e) => setBulkPlan(e.target.value as ClientPlan)}
            className="h-9 rounded-md border border-amber-300 bg-white px-3 text-sm"
          >
            {PLANS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={asignarATodosSinPlan} disabled={bulkMutation.isPending}>
            {bulkMutation.isPending ? 'Asignando…' : 'Asignar a todos'}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por correo o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-52"
        >
          <option value="ALL">Todos los planes</option>
          <option value="SIN_PLAN">Sin clasificar</option>
          {PLANS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {clientsQuery.isLoading ? (
        <Skeleton className="h-80 w-full rounded-lg" />
      ) : clientsQuery.isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-10 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="font-medium">No se pudieron cargar los clientes</p>
            <Button variant="outline" className="mt-4" onClick={() => clientsQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No hay clientes sincronizados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Los clientes viven en el CRM base. Ejecute la sincronización para traerlos.
            </p>
            <Button className="mt-4 gap-2" onClick={() => syncMutation.mutate()}>
              <RefreshCw className="h-4 w-4" />
              Sincronizar con el CRM
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                  {filtered.map((client) => {
                    const meta = planMeta(client.plan)
                    const Icon = meta?.icon
                    return (
                      <tr key={client.clientId} className="border-b last:border-0 hover:bg-muted/30">
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
                              assignMutation.mutate({
                                clientId: client.clientId,
                                plan: e.target.value as ClientPlan,
                              })
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

            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Ningún cliente coincide con el filtro.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
