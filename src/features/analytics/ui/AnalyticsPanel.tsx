import { KpiDashboard } from './KpiDashboard'
import { useQuery } from '@tanstack/react-query'
import { Megaphone, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { getAnalyticsSummaryRequest, listCampaignsRequest } from '../api'

interface Props {
  accessToken: string
}

export function AnalyticsPanel({ accessToken }: Props) {
  const analyticsQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'summary'],
    queryFn: () => getAnalyticsSummaryRequest(accessToken),
  })

  const campaignsQuery = useQuery({
    queryKey: ['marketing', 'campaigns'],
    queryFn: () => listCampaignsRequest(accessToken),
  })

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
            Panel de{' '}
            <span className="font-black tracking-tight text-foreground">
              Analítica & Desempeño
            </span>
          </>
        }
        description="Seguimiento de indicadores clave, campañas activas y alertas operativas de CIMA."
        icon={BarChart3}
      />

      <div className="animate-fade-up">
        <KpiDashboard accessToken={accessToken} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-up stagger-1">
        <div className="rounded-xl border bg-card p-6 shadow-sm interactive-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">Total Campañas</h3>
            <Megaphone className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {campaignsQuery.data?.length ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Campañas registradas</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm interactive-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">Alerta Stock Bajo</h3>
            <BarChart3 className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {analyticsQuery.data?.lowStockAlerts ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Productos que requieren atención</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm interactive-card animate-fade-up stagger-2">
        <h3 className="font-semibold text-base pb-3 border-b">Campañas Recientes</h3>
        {campaignsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground pt-3">Cargando campañas...</p>
        ) : campaignsQuery.isError ? (
          <p className="text-sm text-destructive pt-3">Error al cargar campañas.</p>
        ) : campaignsQuery.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground pt-3">No hay campañas activas en este momento.</p>
        ) : (
          <div className="divide-y pt-1">
            {campaignsQuery.data?.map((campaign) => (
              <div
                key={campaign.campaignId}
                className="flex justify-between items-center py-2.5 px-2 rounded-lg interactive-row"
              >
                <div>
                  <p className="font-medium text-sm">{campaign.campaignName}</p>
                  <p className="text-xs text-muted-foreground">
                    Tipo: {campaign.campaignType} | Estado: {campaign.status}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Inicia: {campaign.startDate}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
