import {
  Users,
  Megaphone,
  FolderKanban,
  AlertTriangle,
  MessageSquare,
  Activity,
  RefreshCw,
  ChartAreaIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { Button } from '@/components/ui/button'
import {
  CampaignStatusChart,
  KpiTrendChart,
  PlanDistributionChart,
} from '@/features/analytics/ui/charts'
import { KpiDashboard } from '@/features/analytics/ui/KpiDashboard'
import { KpiCard } from './analytics-kpi-card'
import { ACCENT_STYLES } from './analytics-kpi-styles'
import { ExportButtons } from './analytics-export-buttons'
import { InventoryAlertsCard } from './analytics-inventory-alerts'
import { useDashboardAnalytics } from './use-dashboard-analytics'

interface Props {
  accessToken: string
}

export function DashboardAnalytics({ accessToken }: Props) {
  const {
    summaryQuery,
    campaignStatusQuery,
    lowStockQuery,
    snapshotsQuery,
    planQuery,
    summary,
    isRefreshing,
    refreshAll,
    campaignsFormat,
    campaignsExport,
    lowStockFormat,
    lowStockExport,
    kpisFormat,
    kpisExport,
  } = useDashboardAnalytics(accessToken)

  const lowStockCount = summary?.lowStockAlerts ?? 0

  return (
    <div className="space-y-6">
      <div data-tour="analytics-header">
        <PageHeader
          eyebrow={
            <>
              Métricas y <span className="font-black text-primary">Rendimiento</span>
            </>
          }
          title={
            <>
              Consola de{' '}
              <span className="font-black tracking-tight text-foreground">
                Analítica
              </span>
            </>
          }
          description="Vista general de las métricas operativas y comerciales de CIMA."
          icon={ChartAreaIcon}
          actions={(
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={isRefreshing}
              data-tour="analytics-refresh-btn"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          )}
        />
      </div>

      <div data-tour="analytics-charts">
        <KpiDashboard accessToken={accessToken} />
      </div>

      {summaryQuery.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar el resumen de analítica. Verifica que el backend de marketing esté corriendo.
        </div>
      )}

      {/* KPI Cards */}
      <div data-tour="analytics-kpis" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Clientes"
          value={summary?.totalClients ?? 0}
          subtitle={`${summary?.totalUsers ?? 0} usuarios internos`}
          icon={Users}
          accent="blue"
          loading={summaryQuery.isLoading}
          className="animate-fade-up stagger-1"
        />
        <KpiCard
          label="Campañas activas"
          value={summary?.activeCampaigns ?? 0}
          subtitle={`${summary?.totalCampaigns ?? 0} en total`}
          icon={Megaphone}
          accent="green"
          loading={summaryQuery.isLoading}
          className="animate-fade-up stagger-2"
        />
        <KpiCard
          label="Proyectos en curso"
          value={summary?.projectsInProgress ?? 0}
          subtitle={`${summary?.totalProjects ?? 0} en total`}
          icon={FolderKanban}
          accent="purple"
          loading={summaryQuery.isLoading}
          className="animate-fade-up stagger-3"
        />
        <KpiCard
          label="Alertas de stock bajo"
          value={lowStockCount}
          subtitle={`${summary?.totalProducts ?? 0} productos · ${summary?.totalStock ?? 0} unidades`}
          icon={AlertTriangle}
          accent={lowStockCount > 0 ? 'red' : 'green'}
          loading={summaryQuery.isLoading}
          className="animate-fade-up stagger-4"
        />
        <KpiCard
          label="Interacciones de marketing"
          value={summary?.totalMarketingInteractions ?? 0}
          subtitle="Contactos registrados con clientes"
          icon={MessageSquare}
          accent="cyan"
          loading={summaryQuery.isLoading}
          className="animate-fade-up stagger-5"
        />
        <KpiCard
          label="Snapshots de KPI"
          value={summary?.totalKpiSnapshots ?? 0}
          subtitle="Períodos calculados históricamente"
          icon={Activity}
          accent="indigo"
          loading={summaryQuery.isLoading}
          className="animate-fade-up stagger-6"
        />
      </div>

      {/* Historial de KPIs: tendencia de los períodos consolidados */}
      <div
        className={
          'rounded-2xl border border-border/80 bg-card p-6 shadow-xs ' +
          'hover:shadow-md transition-shadow duration-200 animate-fade-up'
        }
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg ${ACCENT_STYLES.indigo.iconBg} p-2.5 ${ACCENT_STYLES.indigo.iconText}`}>
              <Activity className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Historial de KPIs</p>
              <p className="text-xs text-muted-foreground">
                Evolución mensual de los períodos consolidados ({summary?.totalKpiSnapshots ?? 0})
              </p>
            </div>
          </div>
          <ExportButtons
            label="KPIs"
            onExport={(format) => kpisExport.mutate(format)}
            isPending={kpisExport.isPending}
            pendingFormat={kpisFormat}
          />
        </div>
        {snapshotsQuery.isError ? (
          <p className="text-sm text-destructive">Error al cargar el historial de KPIs.</p>
        ) : (
          <KpiTrendChart data={snapshotsQuery.data ?? []} loading={snapshotsQuery.isLoading} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Estado de Campañas */}
        <div
          data-tour="analytics-campaign-chart"
          className={
            'rounded-2xl border border-border/80 bg-card p-6 shadow-xs ' +
            'hover:shadow-md transition-shadow duration-200 animate-fade-up'
          }
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Estado de Campañas</h3>
            <ExportButtons
              label="campañas"
              onExport={(format) => campaignsExport.mutate(format)}
              isPending={campaignsExport.isPending}
              pendingFormat={campaignsFormat}
            />
          </div>
          {campaignStatusQuery.isError ? (
            <p className="text-sm text-destructive">Error al cargar el estado de campañas.</p>
          ) : (
            <CampaignStatusChart
              data={campaignStatusQuery.data ?? []}
              loading={campaignStatusQuery.isLoading}
            />
          )}
        </div>

        {/* Distribución de clientes por plan comercial */}
        <div
          className={
            'rounded-2xl border border-border/80 bg-card p-6 shadow-xs ' +
            'hover:shadow-md transition-shadow duration-200 animate-fade-up'
          }
        >
          <div className="mb-4">
            <h3 className="font-semibold">Clientes por plan</h3>
            <p className="text-xs text-muted-foreground">Platinum, Oro y Diamante</p>
          </div>
          {planQuery.isError ? (
            <p className="text-sm text-destructive">Error al cargar la distribución por plan.</p>
          ) : (
            <PlanDistributionChart data={planQuery.data ?? []} loading={planQuery.isLoading} />
          )}
        </div>
      </div>

      {/* Alertas de Stock */}
      <div data-tour="analytics-inventory-alerts">
        <InventoryAlertsCard
          data={lowStockQuery.data}
          isLoading={lowStockQuery.isLoading}
          isError={lowStockQuery.isError}
          onExport={(format) => lowStockExport.mutate(format)}
          isExporting={lowStockExport.isPending}
          exportFormat={lowStockFormat}
        />
      </div>
    </div>
  )
}
