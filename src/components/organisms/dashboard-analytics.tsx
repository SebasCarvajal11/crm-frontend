import {
  Users,
  Megaphone,
  FolderKanban,
  FolderSync,
  MessageSquare,
  Activity,
  RefreshCw,
  ChartAreaIcon,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
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
import { IconButton } from '@/components/ui/icon-button'
import { AnalyticsProjectsView } from '@/features/analytics/ui/AnalyticsProjectsView'
import type { ProjectStatusFilter } from '@/features/analytics/ui/analytics-projects.utils'
import { useDashboardAnalytics } from './use-dashboard-analytics'
import { Client360Provider } from '@/features/marketing/ui/Client360Provider'

interface Props {
  accessToken: string
  /** Rol del usuario; "Sincronizar con el CRM" solo se muestra a admin. */
  role?: string
}

export function DashboardAnalytics({ accessToken, role }: Props) {
  const isAdmin = role === 'admin'
  const {
    summaryQuery,
    campaignStatusQuery,
    snapshotsQuery,
    planQuery,
    projectsQuery,
    summary,
    isRefreshing,
    refreshAll,
    campaignsFormat,
    campaignsExport,
    canSync,
    syncMutation,
    syncNotice,
    dismissSyncNotice,
    kpisFormat,
    kpisExport,
  } = useDashboardAnalytics(accessToken, { isAdmin })
  const [projectFilter, setProjectFilter] = useState<ProjectStatusFilter>('all')

  return (
    <Client360Provider accessToken={accessToken}>
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
              <div className="flex flex-wrap items-center gap-2">
                {canSync && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    data-tour="analytics-sync-btn"
                    className="gap-1.5"
                  >
                    <FolderSync className={`size-4 ${syncMutation.isPending ? 'animate-pulse' : ''}`} />
                    {syncMutation.isPending ? 'Sincronizando…' : 'Sincronizar con el CRM'}
                  </Button>
                )}
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
              </div>
            )}
          />
        </div>

        {syncNotice && (
          <div
            role={syncNotice.tone === 'error' ? 'alert' : 'status'}
            className={
              'flex items-start justify-between gap-3 rounded-lg border p-4 text-sm ' +
              (syncNotice.tone === 'error'
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300')
            }
          >
            <span>{syncNotice.text}</span>
            <IconButton label="Cerrar aviso" onClick={dismissSyncNotice}>
              <XCircle className="h-4 w-4" />
            </IconButton>
          </div>
        )}

        <div data-tour="analytics-charts">
          <KpiDashboard accessToken={accessToken} />
        </div>

        {summaryQuery.isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            No se pudo cargar el resumen de analítica. Verifica que el backend de marketing esté corriendo.
          </div>
        )}

        {/* KPI Cards */}
        <div data-tour="analytics-kpis" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
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
            label="Interacciones de marketing"
            value={summary?.totalMarketingInteractions ?? 0}
            subtitle="Contactos registrados con clientes"
            icon={MessageSquare}
            accent="cyan"
            loading={summaryQuery.isLoading}
            className="animate-fade-up stagger-4"
          />
          <KpiCard
            label="Snapshots de KPI"
            value={summary?.totalKpiSnapshots ?? 0}
            subtitle="Períodos calculados históricamente"
            icon={Activity}
            accent="indigo"
            loading={summaryQuery.isLoading}
            className="animate-fade-up stagger-5"
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

        {/* Proyectos sincronizados desde el CRM (el inventario se oculta: no se alimenta) */}
        <AnalyticsProjectsView
          projects={Array.isArray(projectsQuery.data) ? projectsQuery.data : []}
          isLoading={projectsQuery.isLoading}
          isError={projectsQuery.isError}
          statusFilter={projectFilter}
          onStatusFilterChange={setProjectFilter}
          onRetry={() => void projectsQuery.refetch()}
          isAdmin={canSync}
          onSync={() => syncMutation.mutate()}
          isSyncing={syncMutation.isPending}
        />
      </div>
    </Client360Provider>
  )
}
