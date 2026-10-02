import { Activity, Briefcase, Megaphone, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricRibbon, type MetricRibbonItem } from '@/components/molecules/metric-ribbon'
import type { OverviewMarketingMetrics } from '../model/overview.types'

type Props = {
  metrics: OverviewMarketingMetrics
  isLoading: boolean
}

export function OverviewMarketingKpisSection({ metrics, isLoading }: Props) {
  const items: MetricRibbonItem[] = [
    {
      label: 'Clientes Totales',
      value: metrics.totalClients,
      subtext: 'Registrados en la plataforma',
      icon: <Users className="size-4" />,
      accent: 'primary',
      className: 'overview-kpi',
    },
    {
      label: 'Nuevos Clientes',
      value: metrics.newClients,
      subtext: 'Último ciclo comercial',
      icon: <UserPlus className="size-4" />,
      accent: 'emerald',
      className: 'overview-kpi',
    },
    {
      label: 'Campañas Activas',
      value: metrics.activeCampaigns,
      subtext: 'Estrategias en ejecución',
      icon: <Megaphone className="size-4" />,
      accent: 'blue',
      className: 'overview-kpi',
    },
    {
      label: 'Proyectos Activos',
      value: metrics.projectsInProgress,
      subtext: `De ${metrics.totalProjects} proyectos totales`,
      icon: <Briefcase className="size-4" />,
      accent: 'amber',
      className: 'overview-kpi',
    },
    {
      label: 'Interacciones',
      value: metrics.totalInteractions,
      subtext: 'Contactos y seguimiento',
      icon: <Activity className="size-4" />,
      accent: 'primary',
      className: 'overview-kpi',
    },
    {
      label: 'Tasa de Respuesta',
      value: `${metrics.responseRate}%`,
      subtext: 'Efectividad en clientes',
      icon: <TrendingUp className="size-4" />,
      accent: 'emerald',
      className: 'overview-kpi',
    },
  ]

  return (
    <Card className="overview-panel overview-panel-kpis min-w-0 w-full max-w-full overflow-hidden">
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
