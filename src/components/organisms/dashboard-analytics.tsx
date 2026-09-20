import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
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
  getAnalyticsSummaryRequest,
  getCampaignStatusReportRequest,
  getLowStockAlertsRequest,
  exportCampaignsRequest,
  exportLowStockRequest,
  exportKpisRequest,
  type ExportFormat,
} from '@/features/analytics/api'
import { CampaignStatusChart } from '@/features/analytics/ui/charts'
import { analyticsKeys } from '@/features/analytics/model'
import { KpiDashboard } from '@/features/analytics/ui/KpiDashboard'
import { KpiCard, ACCENT_STYLES } from './analytics-kpi-card'
import { ExportButtons, triggerDownload } from './analytics-export-buttons'
import { InventoryAlertsCard } from './analytics-inventory-alerts'

interface Props {
  accessToken: string
}

export function DashboardAnalytics({ accessToken }: Props) {
  const summaryQuery = useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: () => getAnalyticsSummaryRequest(accessToken),
    staleTime: 60_000,
  })

  const campaignStatusQuery = useQuery({
    queryKey: analyticsKeys.campaignStatus(),
    queryFn: () => getCampaignStatusReportRequest(accessToken),
    staleTime: 60_000,
  })

  const lowStockQuery = useQuery({
    queryKey: analyticsKeys.lowStock(),
    queryFn: () => getLowStockAlertsRequest(accessToken),
    staleTime: 60_000,
  })

  const summary = summaryQuery.data
  const isRefreshing =
    summaryQuery.isFetching || campaignStatusQuery.isFetching || lowStockQuery.isFetching

  function refreshAll() {
    summaryQuery.refetch()
    campaignStatusQuery.refetch()
    lowStockQuery.refetch()
  }

  // ── Exportaciones ──────────────────────────────────────────────────────
  const [campaignsFormat, setCampaignsFormat] = useState<ExportFormat | null>(null)
  const campaignsExport = useMutation({
    mutationFn: async (format: ExportFormat) => {
      setCampaignsFormat(format)
      const blob = await exportCampaignsRequest(accessToken, format)
      return { blob, format }
    },
    onSuccess: ({ blob, format }) => triggerDownload(blob, `campanas-cimaxis.${format}`),
    onSettled: () => setCampaignsFormat(null),
  })

  const [lowStockFormat, setLowStockFormat] = useState<ExportFormat | null>(null)
  const lowStockExport = useMutation({
    mutationFn: async (format: ExportFormat) => {
      setLowStockFormat(format)
      const blob = await exportLowStockRequest(accessToken, format)
      return { blob, format }
    },
    onSuccess: ({ blob, format }) => triggerDownload(blob, `inventario-cimaxis.${format}`),
    onSettled: () => setLowStockFormat(null),
  })

  const [kpisFormat, setKpisFormat] = useState<ExportFormat | null>(null)
  const kpisExport = useMutation({
    mutationFn: async (format: ExportFormat) => {
      setKpisFormat(format)
      const blob = await exportKpisRequest(accessToken, format)
      return { blob, format }
    },
    onSuccess: ({ blob, format }) => triggerDownload(blob, `kpis-cimaxis.${format}`),
    onSettled: () => setKpisFormat(null),
  })

  const lowStockCount = summary?.lowStockAlerts ?? 0

  return (
    <div className="space-y-6">
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
          <Button type="button" variant="outline" size="sm" onClick={refreshAll} disabled={isRefreshing}>
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        )}
      />

      <KpiDashboard accessToken={accessToken} />

      {summaryQuery.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar el resumen de analítica. Verifica que el backend de marketing esté corriendo.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Clientes"
          value={summary?.totalClients ?? 0}
          subtitle={`${summary?.totalUsers ?? 0} usuarios internos`}
          icon={Users}
          accent="blue"
          loading={summaryQuery.isLoading}
        />
        <KpiCard
          label="Campañas activas"
          value={summary?.activeCampaigns ?? 0}
          subtitle={`${summary?.totalCampaigns ?? 0} en total`}
          icon={Megaphone}
          accent="green"
          loading={summaryQuery.isLoading}
        />
        <KpiCard
          label="Proyectos en curso"
          value={summary?.projectsInProgress ?? 0}
          subtitle={`${summary?.totalProjects ?? 0} en total`}
          icon={FolderKanban}
          accent="purple"
          loading={summaryQuery.isLoading}
        />
        <KpiCard
          label="Alertas de stock bajo"
          value={lowStockCount}
          subtitle={`${summary?.totalProducts ?? 0} productos · ${summary?.totalStock ?? 0} unidades`}
          icon={AlertTriangle}
          accent={lowStockCount > 0 ? 'red' : 'green'}
          loading={summaryQuery.isLoading}
        />
        <KpiCard
          label="Interacciones de marketing"
          value={summary?.totalMarketingInteractions ?? 0}
          subtitle="Contactos registrados con clientes"
          icon={MessageSquare}
          accent="cyan"
          loading={summaryQuery.isLoading}
        />
        <KpiCard
          label="Snapshots de KPI"
          value={summary?.totalKpiSnapshots ?? 0}
          subtitle="Períodos calculados históricamente"
          icon={Activity}
          accent="indigo"
          loading={summaryQuery.isLoading}
        />
      </div>

      {/* Exportar historial de KPIs (no hay gráfico todavía, solo descarga) */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg ${ACCENT_STYLES.indigo.iconBg} p-2.5 ${ACCENT_STYLES.indigo.iconText}`}>
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Historial de KPIs</p>
            <p className="text-xs text-muted-foreground">
              {summary?.totalKpiSnapshots ?? 0} snapshot(s) calculados
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

      {/* Gráfico de Estado de Campañas */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
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

      {/* Alertas de Stock */}
      <InventoryAlertsCard
        data={lowStockQuery.data}
        isLoading={lowStockQuery.isLoading}
        isError={lowStockQuery.isError}
        onExport={(format) => lowStockExport.mutate(format)}
        isExporting={lowStockExport.isPending}
        exportFormat={lowStockFormat}
      />
    </div>
  )
}
