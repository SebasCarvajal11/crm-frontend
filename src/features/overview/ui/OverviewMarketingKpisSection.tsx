import { Activity, Briefcase, Megaphone, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { OverviewMarketingMetrics } from '../model/overview.types'

type Props = {
  metrics: OverviewMarketingMetrics
  isLoading: boolean
}

type KpiCardConfig = {
  label: string
  value: string | number
  subtext?: string
  icon: typeof Users
}

export function OverviewMarketingKpisSection({ metrics, isLoading }: Props) {
  const items: KpiCardConfig[] = [
    {
      label: 'Clientes Totales',
      value: metrics.totalClients,
      subtext: 'Registrados en la plataforma',
      icon: Users,
    },
    {
      label: 'Nuevos Clientes',
      value: metrics.newClients,
      subtext: 'Último ciclo comercial',
      icon: UserPlus,
    },
    {
      label: 'Campañas Activas',
      value: metrics.activeCampaigns,
      subtext: 'Estrategias en ejecución',
      icon: Megaphone,
    },
    {
      label: 'Proyectos Activos',
      value: metrics.projectsInProgress,
      subtext: `De ${metrics.totalProjects} proyectos totales`,
      icon: Briefcase,
    },
    {
      label: 'Interacciones',
      value: metrics.totalInteractions,
      subtext: 'Contactos y seguimiento',
      icon: Activity,
    },
    {
      label: 'Tasa de Respuesta',
      value: `${metrics.responseRate}%`,
      subtext: 'Efectividad en clientes',
      icon: TrendingUp,
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
      <CardContent className="min-w-0 w-full max-w-full overflow-hidden">
        {isLoading ? (
          <div className="overview-kpi-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="overview-kpi-grid">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="overview-kpi flex min-w-0 flex-col justify-between gap-5 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold leading-snug text-muted-foreground">
                      {item.label}
                    </span>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                      {item.value}
                    </p>
                    {item.subtext && (
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">
                        {item.subtext}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
