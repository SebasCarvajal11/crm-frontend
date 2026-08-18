import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES, ANALYTICS_ROUTES } from '@/shared/lib/gateway-routes'
import type{
  AnalyticsSummaryDto,
  ClientPlanDistributionDto,
  ClientActivityDto,
  CampaignStatusReportDto,
  InventoryAlertDto,
  KpiSnapshotDto,
} from '@/features/analytics/model'

export interface Campaign {
  campaignId: number
  campaignName: string
  campaignType: 'Positioning' | 'Direct_sales' | 'Value_content' | 'Testimonial' | 'Reactivation'
  clientId: string
  projectId?: string
  createdBy: string
  startDate: string
  endDate?: string
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'
  platforms?: string
  objective?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * @deprecated Esta forma NO coincide con lo que devuelve el backend real
 * (verificado contra AnalyticsController el 2026-08-18). `getAnalyticsSummaryRequest`
 * ya no usa este tipo, retorna `AnalyticsSummaryDto` (ver '@/features/analytics/model').
 * Se deja sin borrar por si algo más en el repo la importa; no usar en código nuevo.
 */
export interface AnalyticsSummary {
  totalClients: number
  activeCampaigns: number
  lowStockItemsCount: number
  averageKpis: Record<string, number>
}

export async function listCampaignsRequest(accessToken: string): Promise<Campaign[]> {
  return api.get(MARKETING_ROUTES.campaigns, { headers: bearer(accessToken) }).json<Campaign[]>()
}

export async function createCampaignRequest(accessToken: string, campaign: Omit<Campaign, 'campaignId' | 'createdBy'>): Promise<Campaign> {
  return api.post(MARKETING_ROUTES.campaigns, { headers: bearer(accessToken), json: campaign }).json<Campaign>()
}

export async function getAnalyticsSummaryRequest(accessToken: string): Promise<AnalyticsSummaryDto> {
  return api.get(ANALYTICS_ROUTES.summary, { headers: bearer(accessToken) }).json<AnalyticsSummaryDto>()
}

export async function getClientPlanDistributionRequest(
  accessToken: string
): Promise<ClientPlanDistributionDto[]> {
  return api
    .get(ANALYTICS_ROUTES.planDistribution, { headers: bearer(accessToken) })
    .json<ClientPlanDistributionDto[]>()
}

export async function getClientActivityRequest(accessToken: string): Promise<ClientActivityDto[]> {
  return api
    .get(ANALYTICS_ROUTES.activity, { headers: bearer(accessToken) })
    .json<ClientActivityDto[]>()
}

export async function getCampaignStatusReportRequest(
  accessToken: string
): Promise<CampaignStatusReportDto[]> {
  return api
    .get(ANALYTICS_ROUTES.campaignsStatus, { headers: bearer(accessToken) })
    .json<CampaignStatusReportDto[]>()
}

export async function getLowStockAlertsRequest(accessToken: string): Promise<InventoryAlertDto[]> {
  return api
    .get(ANALYTICS_ROUTES.lowStock, { headers: bearer(accessToken) })
    .json<InventoryAlertDto[]>()
}

export async function getKpiSnapshotsRequest(accessToken: string): Promise<KpiSnapshotDto[]> {
  return api
    .get(ANALYTICS_ROUTES.kpis, { headers: bearer(accessToken) })
    .json<KpiSnapshotDto[]>()
}

// ── Exportación de reportes (Excel/PDF) ─────────────────────────────────────
export type ExportFormat = 'xlsx' | 'pdf'

export async function exportKpisRequest(
  accessToken: string,
  format: ExportFormat = 'xlsx',
  period?: string
): Promise<Blob> {
  return api
    .get(ANALYTICS_ROUTES.exportKpis, {
      headers: bearer(accessToken),
      searchParams: period ? { format, period } : { format },
    })
    .blob()
}

export async function exportCampaignsRequest(
  accessToken: string,
  format: ExportFormat = 'xlsx'
): Promise<Blob> {
  return api
    .get(ANALYTICS_ROUTES.exportCampaigns, {
      headers: bearer(accessToken),
      searchParams: { format },
    })
    .blob()
}

export async function exportLowStockRequest(
  accessToken: string,
  format: ExportFormat = 'xlsx'
): Promise<Blob> {
  return api
    .get(ANALYTICS_ROUTES.exportLowStock, {
      headers: bearer(accessToken),
      searchParams: { format },
    })
    .blob()
}


