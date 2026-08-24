import { useQuery } from '@tanstack/react-query'
import { Megaphone, BarChart3 } from 'lucide-react'
import { getAnalyticsSummaryRequest, listCampaignsRequest } from '../api'

interface Props {
  accessToken: string
}

export function MarketingPanel({ accessToken }: Props) {
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Marketing & Analítica</h2>
        <p className="text-muted-foreground">Campañas, inventario y actividad comercial.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">Total Campañas</h3>
            <Megaphone className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {campaignsQuery.data?.length ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Campañas registradas</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">Alerta Stock Bajo</h3>
            <BarChart3 className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {analyticsQuery.data?.lowStockItemsCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Productos que requieren atención</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-lg pb-4">Campañas Recientes</h3>
        {campaignsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando campañas...</p>
        ) : campaignsQuery.isError ? (
          <p className="text-sm text-destructive">Error al cargar campañas.</p>
        ) : campaignsQuery.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay campañas activas en este momento.</p>
        ) : (
          <div className="space-y-4">
            {campaignsQuery.data?.map((campaign) => (
              <div key={campaign.campaignId} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-sm">{campaign.campaignName}</p>
                  <p className="text-xs text-muted-foreground">Tipo: {campaign.campaignType} | Estado: {campaign.status}</p>
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
