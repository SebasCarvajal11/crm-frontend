import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'
import type { MarketingClient } from './proposals-api'

export interface SegmentCriteria {
  plans?: string[]
  hasProjects?: boolean | null
  hasInteractions?: boolean | null
  minDaysWithoutContact?: number | null
  proposalStatuses?: string[]
}

export interface SegmentPreview {
  total: number
  clients: MarketingClient[]
}

export async function previewSegmentRequest(
  accessToken: string,
  criteria: SegmentCriteria
): Promise<SegmentPreview> {
  return api
    .post(MARKETING_ROUTES.segmentPreview, { headers: bearer(accessToken), json: criteria })
    .json<SegmentPreview>()
}

export async function executeOnSegmentRequest(
  accessToken: string,
  workflowId: number | string,
  criteria: SegmentCriteria
): Promise<unknown[]> {
  return api
    .post(MARKETING_ROUTES.segmentExecute(workflowId), {
      headers: bearer(accessToken),
      json: criteria,
    })
    .json<unknown[]>()
}

export interface SchedulerRunResult {
  executionsGenerated: number
  executions: {
    executionId?: number
    workflowId?: number
    clientId?: string
    result?: string
    sentMessage?: string | null
    errorDetail?: string | null
    executedAt?: string
  }[]
}

export async function runSchedulerRequest(accessToken: string): Promise<SchedulerRunResult> {
  return api
    .post(MARKETING_ROUTES.schedulerRun, { headers: bearer(accessToken) })
    .json<SchedulerRunResult>()
}

// ── Segmentos guardados (audiencia de campañas) ─────────────────────────────
export interface SavedSegment {
  segmentId: string
  name: string
  description?: string | null
  /** Mismo objeto que usa /segments/preview. */
  criteria: SegmentCriteria
  active: boolean
  /** Clientes que hoy cumplen el criterio. */
  clientCount: number
}

export interface SavedSegmentInput {
  name: string
  description?: string | null
  criteria: SegmentCriteria
}

export interface SegmentClient {
  clientId: string
  name: string
  plan?: string | null
  lastContact?: string | null
  score: number
}

export async function listSavedSegmentsRequest(accessToken: string): Promise<SavedSegment[]> {
  return api.get(MARKETING_ROUTES.savedSegments, { headers: bearer(accessToken) }).json<SavedSegment[]>()
}

export async function createSavedSegmentRequest(accessToken: string, input: SavedSegmentInput): Promise<SavedSegment> {
  return api.post(MARKETING_ROUTES.savedSegments, { headers: bearer(accessToken), json: input }).json<SavedSegment>()
}

export async function updateSavedSegmentRequest(
  accessToken: string,
  segmentId: string,
  input: SavedSegmentInput
): Promise<SavedSegment> {
  return api
    .put(MARKETING_ROUTES.savedSegment(segmentId), { headers: bearer(accessToken), json: input })
    .json<SavedSegment>()
}

/** 409 si una campaña activa usa el segmento (el mensaje del backend explica cuál). */
export async function setSavedSegmentActiveRequest(
  accessToken: string,
  segmentId: string,
  active: boolean
): Promise<SavedSegment> {
  return api
    .patch(MARKETING_ROUTES.savedSegmentActive(segmentId), { headers: bearer(accessToken), json: { active } })
    .json<SavedSegment>()
}

export async function getSavedSegmentClientsRequest(accessToken: string, segmentId: string): Promise<SegmentClient[]> {
  return api.get(MARKETING_ROUTES.savedSegmentClients(segmentId), { headers: bearer(accessToken) }).json<SegmentClient[]>()
}

export const savedSegmentsKey = ['marketing', 'segments', 'saved'] as const
