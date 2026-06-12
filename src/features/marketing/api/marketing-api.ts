import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES, ANALYTICS_ROUTES } from '@/shared/lib/gateway-routes'

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

export async function getAnalyticsSummaryRequest(accessToken: string): Promise<AnalyticsSummary> {
  return api.get(ANALYTICS_ROUTES.summary, { headers: bearer(accessToken) }).json<AnalyticsSummary>()
}
