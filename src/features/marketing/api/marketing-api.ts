import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES, ANALYTICS_ROUTES } from '@/shared/lib/gateway-routes'

// ── Tipos y Enums de Campañas ───────────────────────────────────────────────
export type CampaignType = 'Positioning' | 'Direct_sales' | 'Value_content' | 'Testimonial' | 'Reactivation'
export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'

export interface Campaign {
  campaignId: number
  campaignName: string
  campaignType: CampaignType
  clientId: string
  projectId?: string | null
  createdBy: string
  startDate: string
  endDate?: string | null
  status: CampaignStatus
  platforms?: string | null
  objective?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CreateCampaignInput = {
  campaignName: string
  campaignType: CampaignType
  clientId: string
  projectId?: string | null
  startDate: string
  endDate?: string | null
  status: CampaignStatus
  platforms?: string | null
  objective?: string | null
}

export type UpdateCampaignInput = Partial<CreateCampaignInput>

// ── Tipos y Enums de Workflows ──────────────────────────────────────────────
export type TriggerType = 'scheduled_date' | 'no_contact_x_days' | 'proposal_no_response' | 'project_completed' | 'manual'
export type ActionType = 'send_email' | 'send_whatsapp' | 'log_followup' | 'notify_admin'

export interface Workflow {
  workflowId: number
  campaignId: number
  workflowName: string
  description?: string | null
  triggerType: TriggerType
  noContactDays?: number | null
  actionType: ActionType
  messageTemplate?: string | null
  active: boolean
  createdAt?: string
}

export type CreateWorkflowInput = {
  campaignId: number
  workflowName: string
  description?: string | null
  triggerType: TriggerType
  noContactDays?: number | null
  actionType: ActionType
  messageTemplate?: string | null
  active?: boolean
}

export type UpdateWorkflowInput = Partial<CreateWorkflowInput>

// ── Tipos de Ejecuciones de Workflow ────────────────────────────────────────
export type ExecutionResult = 'success' | 'failed'

export interface WorkflowExecution {
  executionId: number
  workflowId: number
  clientId?: string | null
  executedAt: string
  sentMessage?: string | null
  result: ExecutionResult
  errorDetail?: string | null
}

// ── Tipos de Analítica y Reportes ───────────────────────────────────────────
export interface AnalyticsSummary {
  totalClients: number
  totalUsers: number
  totalCampaigns: number
  activeCampaigns: number
  totalProjects: number
  projectsInProgress: number
  totalProducts: number
  totalInventoryItems: number
  totalStock: number
  lowStockAlerts: number
  totalKpiSnapshots: number
  totalMarketingInteractions: number
}

export interface ClientPlanDistribution {
  plan: string
  clientCount: number
}

export interface ClientActivity {
  clientId: string
  plan: string
  campaignCount: number
  projectCount: number
}

export interface CampaignStatusReport {
  status: string
  campaignCount: number
}

export interface InventoryAlert {
  inventoryId: number
  productId: number
  productName: string
  totalStock: number
  pointOfSaleStock?: number | null
  lowStockAlert: number
  inventoryType?: string | null
}

export interface KpiSnapshot {
  snapshotsId: number
  period: string
  calculatedAt?: string | null
  newClients?: number | null
  closedProjects?: number | null
  estimatedRevenue?: number | null
  activeCampaigns?: number | null
  clientsContacted?: number | null
  responseRate?: number | null
  avgCloseDays?: number | null
  projectsInProgress?: number | null
  calculatedBy?: string | null
}

// ── Peticiones API: Campañas ───────────────────────────────────────────────
export async function listCampaignsRequest(accessToken: string): Promise<Campaign[]> {
  return api.get(MARKETING_ROUTES.campaigns, { headers: bearer(accessToken) }).json<Campaign[]>()
}

export async function getCampaignByIdRequest(accessToken: string, campaignId: number | string): Promise<Campaign> {
  return api.get(MARKETING_ROUTES.campaign(campaignId), { headers: bearer(accessToken) }).json<Campaign>()
}

export async function getCampaignsByClientRequest(accessToken: string, clientId: string): Promise<Campaign[]> {
  return api.get(MARKETING_ROUTES.campaignsByClient(clientId), { headers: bearer(accessToken) }).json<Campaign[]>()
}

export async function createCampaignRequest(accessToken: string, input: CreateCampaignInput): Promise<Campaign> {
  return api.post(MARKETING_ROUTES.campaigns, { headers: bearer(accessToken), json: input }).json<Campaign>()
}

export async function updateCampaignRequest(
  accessToken: string,
  campaignId: number | string,
  input: UpdateCampaignInput
): Promise<Campaign> {
  return api.put(MARKETING_ROUTES.campaign(campaignId), { headers: bearer(accessToken), json: input }).json<Campaign>()
}

export async function deleteCampaignRequest(accessToken: string, campaignId: number | string): Promise<void> {
  await api.delete(MARKETING_ROUTES.campaign(campaignId), { headers: bearer(accessToken) })
}

// ── Peticiones API: Workflows ──────────────────────────────────────────────
export async function listWorkflowsRequest(accessToken: string): Promise<Workflow[]> {
  return api.get(MARKETING_ROUTES.workflows, { headers: bearer(accessToken) }).json<Workflow[]>()
}

export async function listActiveWorkflowsRequest(accessToken: string): Promise<Workflow[]> {
  return api.get(MARKETING_ROUTES.workflowsActive, { headers: bearer(accessToken) }).json<Workflow[]>()
}

export async function listWorkflowsByCampaignRequest(accessToken: string, campaignId: number | string): Promise<Workflow[]> {
  return api.get(MARKETING_ROUTES.workflowsByCampaign(campaignId), { headers: bearer(accessToken) }).json<Workflow[]>()
}

export async function getWorkflowByIdRequest(accessToken: string, workflowId: number | string): Promise<Workflow> {
  return api.get(MARKETING_ROUTES.workflow(workflowId), { headers: bearer(accessToken) }).json<Workflow>()
}

export async function createWorkflowRequest(accessToken: string, input: CreateWorkflowInput): Promise<Workflow> {
  return api.post(MARKETING_ROUTES.workflows, { headers: bearer(accessToken), json: input }).json<Workflow>()
}

export async function updateWorkflowRequest(
  accessToken: string,
  workflowId: number | string,
  input: UpdateWorkflowInput
): Promise<Workflow> {
  return api.put(MARKETING_ROUTES.workflow(workflowId), { headers: bearer(accessToken), json: input }).json<Workflow>()
}

export async function toggleWorkflowRequest(accessToken: string, workflowId: number | string): Promise<Workflow> {
  return api.patch(MARKETING_ROUTES.workflowToggle(workflowId), { headers: bearer(accessToken) }).json<Workflow>()
}

export async function deleteWorkflowRequest(accessToken: string, workflowId: number | string): Promise<void> {
  await api.delete(MARKETING_ROUTES.workflow(workflowId), { headers: bearer(accessToken) })
}

// ── Peticiones API: Ejecuciones de Workflow ─────────────────────────────────
export async function runWorkflowRequest(accessToken: string, workflowId: number | string): Promise<WorkflowExecution[]> {
  return api.post(MARKETING_ROUTES.executionsRun(workflowId), { headers: bearer(accessToken) }).json<WorkflowExecution[]>()
}

export async function runWorkflowForClientRequest(
  accessToken: string,
  workflowId: number | string,
  clientId: string
): Promise<WorkflowExecution> {
  return api.post(MARKETING_ROUTES.executionsRunForClient(workflowId, clientId), { headers: bearer(accessToken) }).json<WorkflowExecution>()
}

export async function getExecutionsByWorkflowRequest(accessToken: string, workflowId: number | string): Promise<WorkflowExecution[]> {
  return api.get(MARKETING_ROUTES.executionsByWorkflow(workflowId), { headers: bearer(accessToken) }).json<WorkflowExecution[]>()
}

export async function getExecutionsByClientRequest(accessToken: string, clientId: string): Promise<WorkflowExecution[]> {
  return api.get(MARKETING_ROUTES.executionsByClient(clientId), { headers: bearer(accessToken) }).json<WorkflowExecution[]>()
}

// ── Peticiones API: Analítica ───────────────────────────────────────────────
export async function getAnalyticsSummaryRequest(accessToken: string): Promise<AnalyticsSummary> {
  return api.get(ANALYTICS_ROUTES.summary, { headers: bearer(accessToken) }).json<AnalyticsSummary>()
}

export async function getClientPlanDistributionRequest(accessToken: string): Promise<ClientPlanDistribution[]> {
  return api.get(ANALYTICS_ROUTES.planDistribution, { headers: bearer(accessToken) }).json<ClientPlanDistribution[]>()
}

export async function getClientActivityRequest(accessToken: string): Promise<ClientActivity[]> {
  return api.get(ANALYTICS_ROUTES.activity, { headers: bearer(accessToken) }).json<ClientActivity[]>()
}

export async function getCampaignStatusReportRequest(accessToken: string): Promise<CampaignStatusReport[]> {
  return api.get(ANALYTICS_ROUTES.campaignsStatus, { headers: bearer(accessToken) }).json<CampaignStatusReport[]>()
}

export async function getLowStockAlertsRequest(accessToken: string): Promise<InventoryAlert[]> {
  return api.get(ANALYTICS_ROUTES.lowStock, { headers: bearer(accessToken) }).json<InventoryAlert[]>()
}

export async function getKpiSnapshotsRequest(accessToken: string): Promise<KpiSnapshot[]> {
  return api.get(ANALYTICS_ROUTES.kpis, { headers: bearer(accessToken) }).json<KpiSnapshot[]>()
}
