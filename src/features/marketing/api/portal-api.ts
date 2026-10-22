import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'
import type { MarketingMessage } from './messages-api'

// ── Portal del cliente ("Mi espacio comercial", rol client) ─────────────────

export interface ClientCommercialSummary {
  clientName: string
  plan?: string | null
  /** Color hexadecimal del plan en el catálogo (null si no tiene plan o el plan no existe). */
  planColor?: string | null
  /** Propuestas en estado Sent o In_negotiation. */
  pendingProposals: number
  /** Mensajes de CIMA que el cliente aún no ha leído. */
  unreadMessages: number
  approvedProposals: number
}

/** Estados de la propuesta tal como llegan del backend. */
export type ClientProposalStatus = 'In_diagnosis' | 'Sent' | 'In_negotiation' | 'Approved' | 'Rejected'

export interface ClientProposal {
  proposalId: number
  title: string
  description?: string | null
  value?: number | null
  status: ClientProposalStatus | string
  documentUrl?: string | null
  createdDate?: string | null
  /** Fecha de la decisión (aceptación o rechazo). */
  responseDate?: string | null
  clientComment?: string | null
  /** Proyecto de CIMAxios creado a partir de la propuesta. */
  projectId?: string | null
}

export type ProposalDecision = 'ACCEPTED' | 'REJECTED'

export interface ProposalDecisionPayload {
  decision: ProposalDecision
  /** Opcional al aceptar, obligatorio al rechazar. Máximo 1000 caracteres. */
  comment?: string | null
}

export async function getMyCommercialSummaryRequest(accessToken: string): Promise<ClientCommercialSummary> {
  return api.get(MARKETING_ROUTES.meSummary, { headers: bearer(accessToken) }).json<ClientCommercialSummary>()
}

export async function getMyProposalsRequest(accessToken: string): Promise<ClientProposal[]> {
  return api.get(MARKETING_ROUTES.meProposals, { headers: bearer(accessToken) }).json<ClientProposal[]>()
}

/** Acepta o rechaza una propuesta pendiente. 409 si ya no está pendiente. */
export async function decideMyProposalRequest(
  accessToken: string,
  proposalId: number,
  payload: ProposalDecisionPayload
): Promise<ClientProposal> {
  return api
    .patch(MARKETING_ROUTES.meProposalDecision(proposalId), { headers: bearer(accessToken), json: payload })
    .json<ClientProposal>()
}

/** Conversación del cliente con CIMA (ascendente). Marca como leídos los mensajes de CIMA. */
export async function getMyMessagesRequest(accessToken: string): Promise<MarketingMessage[]> {
  return api.get(MARKETING_ROUTES.meMessages, { headers: bearer(accessToken) }).json<MarketingMessage[]>()
}

/** Envía un mensaje a CIMA (máximo 4000 caracteres, 30 por hora → 429). */
export async function sendMyMessageRequest(accessToken: string, body: string): Promise<MarketingMessage> {
  return api.post(MARKETING_ROUTES.meMessages, { headers: bearer(accessToken), json: { body } }).json<MarketingMessage>()
}

export const portalKeys = {
  all: ['marketing', 'portal'] as const,
  summary: ['marketing', 'portal', 'summary'] as const,
  proposals: ['marketing', 'portal', 'proposals'] as const,
  messages: ['marketing', 'portal', 'messages'] as const,
}
