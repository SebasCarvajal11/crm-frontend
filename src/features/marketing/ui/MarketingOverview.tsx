import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Layers,
  Megaphone,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getAnalyticsSummaryRequest,
  getClientPlanDistributionRequest,
  getClientActivityRequest,
  getCampaignStatusReportRequest,
  getLowStockAlertsRequest,
  getKpiSnapshotsRequest,
} from '../api/marketing-api'

interface MarketingOverviewProps {
  accessToken: string
  onNavigateToCampaigns: () => void
  onNavigateToWorkflows: () => void
}

export function MarketingOverview({
  accessToken,
  onNavigateToCampaigns,
  onNavigateToWorkflows,
}: MarketingOverviewProps) {
  const summaryQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'summary', accessToken],
    queryFn: () => getAnalyticsSummaryRequest(accessToken),
  })

  const planDistQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'planDistribution', accessToken],
    queryFn: () => getClientPlanDistributionRequest(accessToken),
  })

  const statusReportQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'campaignsStatus', accessToken],
    queryFn: () => getCampaignStatusReportRequest(accessToken),
  })

  const lowStockQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'lowStock', accessToken],
    queryFn: () => getLowStockAlertsRequest(accessToken),
  })

  const kpisQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'kpiSnapshots', accessToken],
    queryFn: () => getKpiSnapshotsRequest(accessToken),
  })

  const clientActivityQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'clientActivity', accessToken],
    queryFn: () => getClientActivityRequest(accessToken),
  })

  const isLoading = summaryQuery.isLoading || planDistQuery.isLoading

  const summary = summaryQuery.data
  const planDistribution = planDistQuery.data || []
  const campaignStatuses = statusReportQuery.data || []
  const lowStockAlerts = lowStockQuery.data || []
  const kpiSnapshots = kpisQuery.data || []
  const clientActivities = clientActivityQuery.data || []

  const totalClientsInPlans = planDistribution.reduce((acc, curr) => acc + curr.clientCount, 0) || 1

  return (
    <div className="space-y-6">
      {/* ── Tarjetas Métricas Principales (KPI Cards) ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Campañas Activas */}
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campañas Activas
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Megaphone className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.activeCampaigns ?? 0}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  de {summary?.totalCampaigns ?? 0} totales
                </span>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="size-3 text-emerald-600" />
              Estrategia y pauta multicanal
            </p>
          </CardContent>
        </Card>

        {/* Clientes Registrados */}
        <Card className="border-l-4 border-l-zinc-700 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Clientes en CRM
            </CardTitle>
            <div className="rounded-full bg-zinc-100 p-2 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalClients ?? 0}
                </span>
                <span className="text-xs font-medium text-muted-foreground">empresas</span>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600" />
              Segmentados por plan
            </p>
          </CardContent>
        </Card>

        {/* Alertas de Stock / Capacidad */}
        <Card className={`border-l-4 ${lowStockAlerts.length > 0 ? 'border-l-amber-500' : 'border-l-emerald-500'} shadow-sm hover:shadow-md transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alertas de Capacidad
            </CardTitle>
            <div className={`rounded-full p-2 ${lowStockAlerts.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.lowStockAlerts ?? 0}
                </span>
                <span className="text-xs font-medium text-muted-foreground">servicios en umbral</span>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {summary?.totalStock ?? 0} unidades totales disponibles
            </p>
          </CardContent>
        </Card>

        {/* Snapshots & Estimación */}
        <Card className="border-l-4 border-l-[#A8131A] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Historial de KPIs
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {summary?.totalKpiSnapshots ?? 0}
                </span>
                <span className="text-xs font-medium text-muted-foreground">períodos calculados</span>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <BarChart3 className="size-3 text-primary" />
              Métricas mensuales consolidadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Distribución de Planes y Estado de Campañas ─────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribución de Planes de Clientes */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Distribución de Clientes por Plan
            </CardTitle>
            <CardDescription>
              Segmentación comercial según la membresía y nivel contratado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDistQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : planDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No hay datos de distribución disponibles.</p>
            ) : (
              planDistribution.map((item) => {
                const percentage = Math.round((item.clientCount / totalClientsInPlans) * 100)
                let colorClass = 'bg-primary'
                if (item.plan === 'Oro') colorClass = 'bg-amber-500'
                if (item.plan === 'Esmeralda') colorClass = 'bg-emerald-600'
                if (item.plan === 'Premium') colorClass = 'bg-purple-600'

                return (
                  <div key={item.plan} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <span className={`inline-block size-2 rounded-full ${colorClass}`} />
                        Plan {item.plan}
                      </span>
                      <span className="font-medium text-muted-foreground">
                        {item.clientCount} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Estado de Campañas Activas vs Completadas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Estado de Campañas
              </CardTitle>
              <CardDescription>Resumen del ciclo de vida de las iniciativas</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onNavigateToCampaigns} className="text-xs">
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            {statusReportQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : campaignStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No hay campañas registradas.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {campaignStatuses.map((st) => {
                  let badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' = 'default'
                  if (st.status === 'Active') badgeVariant = 'default'
                  if (st.status === 'Draft') badgeVariant = 'secondary'
                  if (st.status === 'Paused') badgeVariant = 'outline'
                  if (st.status === 'Completed') badgeVariant = 'default'

                  return (
                    <div key={st.status} className="rounded-lg border bg-card p-3 text-center space-y-1">
                      <span className="text-2xl font-black text-foreground">{st.campaignCount}</span>
                      <div>
                        <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold">
                          {st.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Alertas de Inventario / Capacidad & Snapshots de Rendimiento ──────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Alertas de Stock Bajo */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="size-4 text-amber-600" />
                Alertas de Stock & Capacidad
              </CardTitle>
              <CardDescription>Servicios e insumos cercanos a su límite de capacidad</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {lowStockAlerts.length} alertas
            </Badge>
          </CardHeader>
          <CardContent>
            {lowStockQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : lowStockAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                ✨ Todos los niveles de stock y servicios están dentro de los parámetros normales.
              </p>
            ) : (
              <div className="divide-y">
                {lowStockAlerts.map((item) => (
                  <div key={item.inventoryId} className="flex items-center justify-between py-2.5">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground">
                        Tipo: {item.inventoryType || 'General'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-amber-600">
                        {item.totalStock} disponibles
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Umbral: {item.lowStockAlert}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Snapshots Mensuales de KPIs */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Snapshots de Rendimiento Mensual
              </CardTitle>
              <CardDescription>Crecimiento de clientes y tasa de respuesta</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onNavigateToWorkflows} className="text-xs">
              Workflows
            </Button>
          </CardHeader>
          <CardContent>
            {kpisQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : kpiSnapshots.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No hay snapshots generados aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/50 text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="p-2">Período</th>
                      <th className="p-2">Nuevos Clientes</th>
                      <th className="p-2">Tasa Respuesta</th>
                      <th className="p-2">Campañas Activas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium">
                    {kpiSnapshots.slice(0, 4).map((snap) => (
                      <tr key={snap.snapshotsId} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2 font-bold text-foreground flex items-center gap-1.5">
                          <Calendar className="size-3 text-primary" />
                          {snap.period}
                        </td>
                        <td className="p-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                          +{snap.newClients ?? 0}
                        </td>
                        <td className="p-2 text-foreground font-semibold">
                          {snap.responseRate ? `${snap.responseRate}%` : 'N/A'}
                        </td>
                        <td className="p-2 text-muted-foreground">{snap.activeCampaigns ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Resumen de Actividad de Clientes ────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Actividad Comercial por Cuenta
            </CardTitle>
            <CardDescription>Campañas activas y vinculación por cliente</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onNavigateToCampaigns} className="text-xs">
            Ver Campañas
          </Button>
        </CardHeader>
        <CardContent>
          {clientActivityQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : clientActivities.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No hay clientes con actividad registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/50 text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-2">ID Cliente</th>
                    <th className="p-2">Plan</th>
                    <th className="p-2">Campañas</th>
                    <th className="p-2">Proyectos</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {clientActivities.map((act) => (
                    <tr key={act.clientId} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2 font-mono text-[11px] text-foreground">{act.clientId}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {act.plan}
                        </Badge>
                      </td>
                      <td className="p-2 text-foreground font-semibold">{act.campaignCount}</td>
                      <td className="p-2 text-muted-foreground">{act.projectCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
