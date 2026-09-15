import {
  Activity,
  Briefcase,
  Megaphone,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
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
  accentColor: string
}

export function OverviewMarketingKpisSection({ metrics, isLoading }: Props) {
  const items: KpiCardConfig[] = [
    {
      label: 'Clientes Totales',
      value: metrics.totalClients,
      subtext: 'Registrados en la plataforma',
      icon: Users,
      accentColor: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'Nuevos Clientes',
      value: metrics.newClients,
      subtext: 'Último ciclo comercial',
      icon: UserPlus,
      accentColor: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: 'Campañas Activas',
      value: metrics.activeCampaigns,
      subtext: 'Estrategias en ejecución',
      icon: Megaphone,
      accentColor: 'text-violet-500 bg-violet-500/10',
    },
    {
      label: 'Proyectos Activos',
      value: metrics.projectsInProgress,
      subtext: `De ${metrics.totalProjects} proyectos totales`,
      icon: Briefcase,
      accentColor: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Interacciones',
      value: metrics.totalInteractions,
      subtext: 'Contactos y seguimiento',
      icon: Activity,
      accentColor: 'text-cyan-500 bg-cyan-500/10',
    },
    {
      label: 'Tasa de Respuesta',
      value: `${metrics.responseRate}%`,
      subtext: 'Efectividad en clientes',
      icon: TrendingUp,
      accentColor: 'text-rose-500 bg-rose-500/10',
    },
  ]

  return (
    <Card className="shadow-sm border border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">
            Métricas Clave de Clientes y Marketing
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Indicadores esenciales de captación, campañas y desempeño comercial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex flex-col justify-between rounded-lg border bg-card/60 p-3 shadow-xs interactive-card hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground truncate">
                      {item.label}
                    </span>
                    <div className={`flex size-6 items-center justify-center rounded-md ${item.accentColor}`}>
                      <Icon className="size-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-bold tracking-tight text-foreground">
                      {item.value}
                    </p>
                    {item.subtext && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
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
