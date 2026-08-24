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
