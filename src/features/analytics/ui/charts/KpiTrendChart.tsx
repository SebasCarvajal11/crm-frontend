import { usePrefersReducedMotion } from '@/shared/hooks'
import type { KpiSnapshotDto } from '../../model'
import { KpiTrendAreaContent } from './kpi-trend-area-content'

interface Props {
  data: KpiSnapshotDto[]
  loading?: boolean
}

function formatPeriodLabel(kpi: KpiSnapshotDto): string {
  if (kpi.period) return kpi.period
  if (kpi.calculatedAt) return new Date(kpi.calculatedAt).toLocaleDateString()
  return ''
}

export function KpiTrendChart({ data, loading }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (loading) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-xl bg-muted/15 text-sm text-muted-foreground animate-pulse">
        Cargando gráfico de tendencias...
      </div>
    )
  }

  const safeData = Array.isArray(data) ? data : Array.isArray((data as unknown as { data: unknown })?.data) ? (data as unknown as { data: typeof data }).data : []

  if (!safeData || safeData.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Aún no hay períodos consolidados. Use «Consolidar período» en los indicadores del mes.
      </div>
    )
  }

  const sortedData = [...safeData].sort((a, b) =>
    (a.period ?? '').localeCompare(b.period ?? '')
  )

  const chartData = sortedData.map((kpi) => ({
    period: formatPeriodLabel(kpi),
    newClients: kpi.newClients,
    closedProjects: kpi.closedProjects,
    projectsInProgress: kpi.projectsInProgress,
    activeCampaigns: kpi.activeCampaigns,
  }))

  return (
    <div data-testid="kpi-trend-area-chart" className="w-full">
      <KpiTrendAreaContent
        data={chartData}
        prefersReducedMotion={prefersReducedMotion}
      />
    </div>
  )
}