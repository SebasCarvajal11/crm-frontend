import { Activity, Briefcase, Megaphone, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricRibbon, type MetricRibbonItem } from '@/components/molecules/metric-ribbon'
import type { OverviewMarketingMetrics } from '../model/overview.types'

type Props = {
  metrics: OverviewMarketingMetrics
  isLoading: boolean
}

function buildClientKpis(metrics: OverviewMarketingMetrics): MetricRibbonItem[] {
  return [
    {
      id: 'kpi-total-clients',
      label: 'Clientes Totales',
      value: metrics.totalClients,
      subtext: 'Registrados en la plataforma',
      icon: <Users className="size-4" />,
      accent: 'primary',
      className: 'overview-kpi',
    },
    {
      id: 'kpi-new-clients',
      label: 'Nuevos Clientes',
      value: metrics.newClients,
      subtext: 'Último ciclo comercial',
      icon: <UserPlus className="size-4" />,
      accent: 'emerald',
      className: 'overview-kpi',
    },
  ]
}

function buildCampaignAndProjectKpis(metrics: OverviewMarketingMetrics): MetricRibbonItem[] {
  return [
    {
      id: 'kpi-active-campaigns', label: 'Campañas Activas', value: metrics.activeCampaigns,
      subtext: 'Estrategias en ejecución', icon: <Megaphone className="size-4" />,
      accent: 'blue', className: 'overview-kpi',
    },
    {
      id: 'kpi-active-projects', label: 'Proyectos Activos', value: metrics.projectsInProgress,
      subtext: `De ${metrics.totalProjects} proyectos totales`, icon: <Briefcase className="size-4" />,
      accent: 'amber', className: 'overview-kpi',
    },
    {
      id: 'kpi-interactions', label: 'Interacciones', value: metrics.totalInteractions,
      subtext: 'Contactos y seguimiento', icon: <Activity className="size-4" />,
      accent: 'primary', className: 'overview-kpi',
    },
    {
      id: 'kpi-response-rate', label: 'Tasa de Respuesta', value: `${metrics.responseRate}%`,
      subtext: 'Efectividad en clientes', icon: <TrendingUp className="size-4" />,
      accent: 'emerald', className: 'overview-kpi',
    },
  ]
}

function buildMarketingKpiItems(metrics: OverviewMarketingMetrics): MetricRibbonItem[] {
  return [...buildClientKpis(metrics), ...buildCampaignAndProjectKpis(metrics)]
}

export function OverviewMarketingKpisSection({ metrics, isLoading }: Props) {
  const items = buildMarketingKpiItems(metrics)

  return (
    <Card
      data-testid="overview-marketing-kpis"
      className="overview-panel overview-panel-kpis min-w-0 w-full max-w-full overflow-hidden"
    >
      <CardHeader className="pb-3 min-w-0 w-full">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary shrink-0" />
          <CardTitle className="text-base font-bold truncate">
            Métricas Clave de Clientes y Marketing
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Indicadores esenciales de captación, campañas y desempeño comercial.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 w-full max-w-full overflow-hidden p-0">
        <MetricRibbon
          items={items}
          columns={6}
          isLoading={isLoading}
          skeletonCount={6}
          className="border-0 rounded-none shadow-none divide-border/60"
        />
      </CardContent>
    </Card>
  )
}
