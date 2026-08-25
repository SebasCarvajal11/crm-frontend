import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'

export type InteractionType =
  | 'no_response'
  | 'open'
  | 'click'
  | 'message'
  | 'inquiry'
  | 'purchase'
  | 'testimonial'

export interface MarketingInteraction {
  interactionId: number
  campaignId: number
  clientId: string
  executionId?: number | null
  loggedBy?: string | null
  contactDate: string
  interactionType: InteractionType
  channel?: string | null
  response?: string | null
}

export type CreateInteractionInput = {
  campaignId: number
  clientId: string
  channel?: string | null
  interactionType?: InteractionType
  response?: string | null
}

export async function listInteractionsRequest(
  accessToken: string
): Promise<MarketingInteraction[]> {
  return api
    .get(MARKETING_ROUTES.interactions, { headers: bearer(accessToken) })
    .json<MarketingInteraction[]>()
}

export async function getInteractionsByClientRequest(
  accessToken: string,
  clientId: string
): Promise<MarketingInteraction[]> {
  return api
    .get(MARKETING_ROUTES.interactionsByClient(clientId), { headers: bearer(accessToken) })
    .json<MarketingInteraction[]>()
}

export async function getInteractionsByCampaignRequest(
  accessToken: string,
  campaignId: number | string
): Promise<MarketingInteraction[]> {
  return api
    .get(MARKETING_ROUTES.interactionsByCampaign(campaignId), { headers: bearer(accessToken) })
    .json<MarketingInteraction[]>()
}

export async function createInteractionRequest(
  accessToken: string,
  input: CreateInteractionInput
): Promise<MarketingInteraction> {
  return api
    .post(MARKETING_ROUTES.interactions, { headers: bearer(accessToken), json: input })
    .json<MarketingInteraction>()
}

export async function registerInteractionResponseRequest(
  accessToken: string,
  interactionId: number | string,
  response: string,
  interactionType: InteractionType
): Promise<MarketingInteraction> {
  return api
    .patch(MARKETING_ROUTES.interactionResponse(interactionId), {
      headers: bearer(accessToken),
      json: { response, interactionType },
    })
    .json<MarketingInteraction>()
}

export async function deleteInteractionRequest(
  accessToken: string,
  interactionId: number | string
): Promise<void> {
  await api.delete(MARKETING_ROUTES.interaction(interactionId), { headers: bearer(accessToken) })
}
