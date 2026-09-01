import { type ComponentType, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Users,
  Megaphone,
  FolderKanban,
  AlertTriangle,
  MessageSquare,
  Activity,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
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
import type { InventoryAlertDto } from '@/features/analytics/model'
import { KpiDashboard } from '@/features/analytics/ui/KpiDashboard'

interface Props {
  accessToken: string
}

// Tailwind necesita ver las clases completas de forma literal para incluirlas
// en el build (no soporta interpolación tipo `bg-${accent}-500`).
const ACCENT_STYLES = {
  blue: { bar: 'bg-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  green: { bar: 'bg-green-500', iconBg: 'bg-green-100', iconText: 'text-green-600' },
  purple: { bar: 'bg-purple-500', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  red: { bar: 'bg-red-500', iconBg: 'bg-red-100', iconText: 'text-red-600' },
  cyan: { bar: 'bg-cyan-500', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600' },
  indigo: { bar: 'bg-indigo-500', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
} as const

type Accent = keyof typeof ACCENT_STYLES

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function getStockSeverity(item: InventoryAlertDto): 'critical' | 'warning' {
  if (item.pointOfSaleStock <= 0) return 'critical'
  const ratio = item.pointOfSaleStock / Math.max(item.lowStockAlert, 1)
  return ratio <= 0.5 ? 'critical' : 'warning'
}

interface KpiCardProps {
  label: string
  value: number | string
  subtitle: string
  icon: ComponentType<{ className?: string }>
  accent: Accent
  loading?: boolean
}

function KpiCard({ label, value, subtitle, icon: Icon, accent, loading }: KpiCardProps) {
  const styles = ACCENT_STYLES[accent]
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          )}
          <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`shrink-0 rounded-lg ${styles.iconBg} p-2.5 ${styles.iconText}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

interface ExportButtonsProps {
  label: string
  onExport: (format: ExportFormat) => void
  isPending: boolean
  pendingFormat: ExportFormat | null
}

function ExportButtons({ label, onExport, isPending, pendingFormat }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Exportar ${label}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onExport('xlsx')}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending && pendingFormat === 'xlsx' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-3.5" />
        )}
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onExport('pdf')}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending && pendingFormat === 'pdf' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileText className="size-3.5" />
        )}
        PDF
      </Button>
    </div>
  )
}

export function DashboardAnalytics({ accessToken }: Props) {
  const summaryQuery = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => getAnalyticsSummaryRequest(accessToken),
  })

  const campaignStatusQuery = useQuery({
    queryKey: ['analytics', 'campaign-status'],
    queryFn: () => getCampaignStatusReportRequest(accessToken),
  })

  const lowStockQuery = useQuery({
    queryKey: ['analytics', 'low-stock'],
    queryFn: () => getLowStockAlertsRequest(accessToken),
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
        title="Analítica"
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
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Alertas de Inventario</h3>
          <ExportButtons
            label="inventario"
            onExport={(format) => lowStockExport.mutate(format)}
            isPending={lowStockExport.isPending}
            pendingFormat={lowStockFormat}
          />
        </div>
        <div className="overflow-x-auto">
          {lowStockQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : lowStockQuery.isError ? (
            <p className="text-sm text-destructive">Error al cargar alertas de inventario.</p>
          ) : lowStockQuery.data && lowStockQuery.data.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Producto</th>
                  <th className="py-2 px-4 text-left">Tipo</th>
                  <th className="py-2 px-4 text-right">Stock Total</th>
                  <th className="py-2 px-4 text-right">Stock Punto de Venta</th>
                  <th className="py-2 px-4 text-right">Umbral de Alerta</th>
                  <th className="py-2 px-4 text-center">Severidad</th>
                </tr>
              </thead>
              <tbody>
                {lowStockQuery.data.map((item) => {
                  const severity = getStockSeverity(item)
                  return (
                    <tr key={item.inventoryId} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{item.productName}</td>
                      <td className="py-2 px-4 text-muted-foreground">{item.inventoryType}</td>
                      <td className="py-2 px-4 text-right">{item.totalStock}</td>
                      <td className="py-2 px-4 text-right">{item.pointOfSaleStock}</td>
                      <td className="py-2 px-4 text-right">{item.lowStockAlert}</td>
                      <td className="py-2 px-4 text-center">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {severity === 'critical' ? 'CRÍTICO' : 'ATENCIÓN'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="size-8 text-green-500" />
              <p className="text-sm font-medium">Todo el inventario está en niveles saludables</p>
              <p className="text-xs text-muted-foreground">No hay productos por debajo del umbral de alerta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
