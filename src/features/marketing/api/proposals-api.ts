import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'

export type ProposalStatus =
  | 'In_diagnosis'
  | 'Sent'
  | 'In_negotiation'
  | 'Approved'
  | 'Rejected'

export interface Proposal {
  proposalId: number
  clientId: string
  description?: string | null
  documentUrl?: string | null
  status: ProposalStatus
  estimatedValue?: number | null
  createdDate?: string | null
  responseDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CreateProposalInput = {
  clientId: string
  description?: string | null
  documentUrl?: string | null
  status: ProposalStatus
  estimatedValue?: number | null
  createdDate?: string | null
}

export type UpdateProposalInput = Partial<CreateProposalInput>

export interface MarketingClient {
  clientId: string
  userId?: string | null
  contactInfo?: string | null
  address?: string | null
  additionalInfo?: string | null
  plan?: 'Oro' | 'Esmeralda' | 'Premium' | null
  createdAt?: string
  updatedAt?: string
}

export async function listProposalsRequest(accessToken: string): Promise<Proposal[]> {
  return api.get(MARKETING_ROUTES.proposals, { headers: bearer(accessToken) }).json<Proposal[]>()
}

export async function getProposalByIdRequest(
  accessToken: string,
  proposalId: number | string
): Promise<Proposal> {
  return api.get(MARKETING_ROUTES.proposal(proposalId), { headers: bearer(accessToken) }).json<Proposal>()
}

export async function getProposalsByClientRequest(
  accessToken: string,
  clientId: string
): Promise<Proposal[]> {
  return api
    .get(MARKETING_ROUTES.proposalsByClient(clientId), { headers: bearer(accessToken) })
    .json<Proposal[]>()
}

export async function createProposalRequest(
  accessToken: string,
  input: CreateProposalInput
): Promise<Proposal> {
  return api.post(MARKETING_ROUTES.proposals, { headers: bearer(accessToken), json: input }).json<Proposal>()
}

export async function updateProposalRequest(
  accessToken: string,
  proposalId: number | string,
  input: UpdateProposalInput
): Promise<Proposal> {
  return api
    .put(MARKETING_ROUTES.proposal(proposalId), { headers: bearer(accessToken), json: input })
    .json<Proposal>()
}

export async function changeProposalStatusRequest(
  accessToken: string,
  proposalId: number | string,
  status: ProposalStatus
): Promise<Proposal> {
  return api
    .patch(MARKETING_ROUTES.proposalStatus(proposalId), {
      headers: bearer(accessToken),
      json: { status },
    })
    .json<Proposal>()
}

export async function deleteProposalRequest(
  accessToken: string,
  proposalId: number | string
): Promise<void> {
  await api.delete(MARKETING_ROUTES.proposal(proposalId), { headers: bearer(accessToken) })
}

export async function listMarketingClientsRequest(accessToken: string): Promise<MarketingClient[]> {
  return api.get(MARKETING_ROUTES.clients, { headers: bearer(accessToken) }).json<MarketingClient[]>()
}
