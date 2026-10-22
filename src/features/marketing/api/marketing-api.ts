import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'

// ── Tipos y Enums de Campañas ───────────────────────────────────────────────
export type CampaignType = 'Positioning' | 'Direct_sales' | 'Value_content' | 'Testimonial' | 'Reactivation'
export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'

/** CLIENT: un cliente; SEGMENT: un segmento guardado; ALL: todos los clientes. */
export type AudienceType = 'CLIENT' | 'SEGMENT' | 'ALL'

export interface Campaign {
  campaignId: number
  campaignName: string
  campaignType: CampaignType
  /** Sin valor en campañas anteriores: equivale a CLIENT. */
  audienceType?: AudienceType | null
  /** Solo en audiencia CLIENT; null en SEGMENT o ALL. */
  clientId: string | null
  segmentId?: string | null
  segmentName?: string | null
  /** Clientes que hoy forman la audiencia (el backend lo recalcula en cada consulta). */
  audienceSize?: number | null
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
  /** Sin valor = CLIENT. */
  audienceType?: AudienceType
  /** Obligatorio solo con audienceType CLIENT. */
  clientId?: string | null
  /** Obligatorio solo con audienceType SEGMENT. */
  segmentId?: string | null
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
export type ActionType = 'send_email' | 'send_portal_message' | 'send_whatsapp' | 'log_followup' | 'notify_admin'

export interface Workflow {
  workflowId: number
  campaignId: number
  workflowName: string
  description?: string | null
  triggerType: TriggerType
  /** Solo en no_contact_x_days y proposal_no_response. */
  noContactDays?: number | null
  /** Fecha y hora (Bogotá) del disparador scheduled_date, p. ej. "2026-12-01T09:00:00". */
  scheduledAt?: string | null
  actionType: ActionType
  messageTemplate?: string | null
  /** Plantilla de la biblioteca (opcional; debe estar activa). */
  templateId?: string | null
  active: boolean
  createdAt?: string
}

export type CreateWorkflowInput = {
  campaignId: number
  workflowName: string
  description?: string | null
  triggerType: TriggerType
  /** Enviar SOLO en no_contact_x_days y proposal_no_response (otro disparador → 400). */
  noContactDays?: number | null
  /** Obligatorio con scheduled_date. */
  scheduledAt?: string | null
  actionType: ActionType
  messageTemplate?: string | null
  templateId?: string | null
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


// ── Vista previa y "Ejecutar ahora" ─────────────────────────────────────────
export interface WorkflowAudienceClient {
  clientId: string
  name: string
  plan?: string | null
}

export interface WorkflowSkippedClient {
  clientId: string
  name: string
  /** Motivo en español (p. ej. "Ya lo recibió hace 3 días"). */
  reason: string
}

export interface WorkflowPreview {
  campaignName: string
  campaignActive: boolean
  audienceType: AudienceType | string
  audienceSize: number
  /** Próxima ejecución (scheduled_date). */
  nextRunAt?: string | null
  eligible: WorkflowAudienceClient[]
  skipped: WorkflowSkippedClient[]
}

export interface WorkflowExecutedClient {
  clientId: string
  name: string
  /** success | failed | pending */
  result: string | null
  /** QUEUED | FAILED | SIMULATED | SKIPPED_LIMIT | SENT_MANUAL, o null si la acción no envía nada. */
  deliveryStatus: string | null
  detail?: string | null
}

export interface WorkflowRunNowResult {
  executed: WorkflowExecutedClient[]
  skipped: WorkflowSkippedClient[]
}

export async function previewWorkflowRequest(accessToken: string, workflowId: number | string): Promise<WorkflowPreview> {
  return api.get(MARKETING_ROUTES.workflowPreview(workflowId), { headers: bearer(accessToken) }).json<WorkflowPreview>()
}

export async function runWorkflowNowRequest(accessToken: string, workflowId: number | string): Promise<WorkflowRunNowResult> {
  return api.post(MARKETING_ROUTES.workflowRunNow(workflowId), { headers: bearer(accessToken) }).json<WorkflowRunNowResult>()
}
