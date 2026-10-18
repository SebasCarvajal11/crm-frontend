import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { ANALYTICS_ROUTES, MARKETING_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  AnalyticsSummaryDto,
  ClientPlanDistributionDto,
  ClientActivityDto,
  CampaignStatusReportDto,
  InventoryAlertDto,
  KpiSnapshotDto,
  ProjectAnalyticsDto,
  CrmSyncResultDto,
} from '@/features/analytics/model'

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

// ── Proyectos sincronizados desde el CRM ────────────────────────────────────
export async function getAnalyticsProjectsRequest(
  accessToken: string
): Promise<ProjectAnalyticsDto[]> {
  return api
    .get(ANALYTICS_ROUTES.projects, { headers: bearer(accessToken) })
    .json<ProjectAnalyticsDto[]>()
}

/** Sincroniza clientes y proyectos desde el CRM (solo admin en el backend). */
export async function syncCrmFromAnalyticsRequest(accessToken: string): Promise<CrmSyncResultDto> {
  return api
    .post(MARKETING_ROUTES.integrationSync, { headers: bearer(accessToken) })
    .json<CrmSyncResultDto>()
}
