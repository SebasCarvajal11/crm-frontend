import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'

/** Plan comercial configurable (crm-marketing, marketing_plans). */
export interface MarketingPlan {
  planId: string
  name: string
  color: string
  description?: string | null
  sortOrder: number
  active: boolean
  clientCount: number
}

export type PlanInput = {
  name: string
  color: string
  description?: string | null
  sortOrder: number
}

export async function listPlansRequest(
  accessToken: string,
  includeInactive = false
): Promise<MarketingPlan[]> {
  return api
    .get(MARKETING_ROUTES.plans, {
      headers: bearer(accessToken),
      searchParams: { includeInactive: String(includeInactive) },
    })
    .json<MarketingPlan[]>()
}

export async function createPlanRequest(
  accessToken: string,
  input: PlanInput
): Promise<MarketingPlan> {
  return api
    .post(MARKETING_ROUTES.plans, { headers: bearer(accessToken), json: input })
    .json<MarketingPlan>()
}

export async function updatePlanRequest(
  accessToken: string,
  planId: string,
  input: PlanInput
): Promise<MarketingPlan> {
  return api
    .put(MARKETING_ROUTES.plan(planId), { headers: bearer(accessToken), json: input })
    .json<MarketingPlan>()
}

export async function setPlanActiveRequest(
  accessToken: string,
  planId: string,
  active: boolean
): Promise<MarketingPlan> {
  return api
    .patch(MARKETING_ROUTES.planActive(planId), { headers: bearer(accessToken), json: { active } })
    .json<MarketingPlan>()
}
