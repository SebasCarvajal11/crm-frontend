import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'
import type { Proposal } from './proposals-api'

// ── Embudo comercial ─────────────────────────────────────────────────────────
export type FunnelStageKey =
  | 'clients'
  | 'contacted'
  | 'responded'
  | 'proposal_sent'
  | 'approved'
  | 'project'

export interface FunnelStage {
  key: FunnelStageKey
  label: string
  count: number
}

export interface FunnelResponse {
  /** null = histórico (sin período). */
  period: string | null
  stages: FunnelStage[]
  /** 5 valores: conversión de la etapa i a la i+1; null si la etapa i es 0. Puede pasar de 100. */
  conversionPercent: (number | null)[]
}

export interface FunnelClient {
  clientId: string
  name: string
  plan?: string | null
  lastContact?: string | null
  score: number
}

// ── Ficha 360° ──────────────────────────────────────────────────────────────
export type TimelineEventType =
  | 'PLAN'
  | 'CAMPAIGN'
  | 'MESSAGE'
  | 'RESPONSE'
  | 'PROPOSAL'
  | 'PROPOSAL_DECISION'
  | 'PROJECT'

export interface TimelineClient {
  clientId: string
  name: string
  /** Correo del cliente (el modelo no tiene teléfono). */
  email?: string | null
  plan?: string | null
  createdAt?: string | null
  lastContact?: string | null
  score: number
}

export interface TimelineStats {
  interactions: number
  responses: number
  proposals: number
  approvedValue: number
  projects: number
}

export interface TimelineEvent {
  type: TimelineEventType | string
  date?: string | null
  title: string
  detail?: string | null
  refId?: string | null
}

export interface ClientTimeline {
  client: TimelineClient
  stats: TimelineStats
  events: TimelineEvent[]
}

// ── Panel Hoy ───────────────────────────────────────────────────────────────
export interface ClientWithoutContact {
  clientId: string
  name: string
  plan?: string | null
  /** null = nunca contactado. */
  daysSinceContact: number | null
}

export interface ProposalWithoutResponse {
  proposalId: number
  title: string
  clientId: string
  clientName: string
  daysOpen: number
  value?: number | null
}

export interface ApprovedWithoutProject {
  proposalId: number
  title: string
  clientId: string
  clientName: string
  value?: number | null
}

export interface TodayPanel {
  clientsWithoutContact: ClientWithoutContact[]
  proposalsWithoutResponse: ProposalWithoutResponse[]
  approvedWithoutProject: ApprovedWithoutProject[]
  counts: {
    clientsWithoutContact: number
    proposalsWithoutResponse: number
    approvedWithoutProject: number
  }
}

export async function getFunnelRequest(accessToken: string, period?: string | null): Promise<FunnelResponse> {
  return api
    .get(MARKETING_ROUTES.funnel, {
      headers: bearer(accessToken),
      searchParams: period ? { period } : {},
    })
    .json<FunnelResponse>()
}

export async function getFunnelClientsRequest(
  accessToken: string,
  stageKey: FunnelStageKey,
  period?: string | null
): Promise<FunnelClient[]> {
  return api
    .get(MARKETING_ROUTES.funnelClients(stageKey), {
      headers: bearer(accessToken),
      searchParams: period ? { period } : {},
    })
    .json<FunnelClient[]>()
}

export async function getClientTimelineRequest(
  accessToken: string,
  clientId: string
): Promise<ClientTimeline> {
  return api
    .get(MARKETING_ROUTES.clientTimeline(clientId), { headers: bearer(accessToken) })
    .json<ClientTimeline>()
}

export async function getTodayPanelRequest(
  accessToken: string,
  options: { daysWithoutContact?: number; daysWithoutResponse?: number } = {}
): Promise<TodayPanel> {
  return api
    .get(MARKETING_ROUTES.today, {
      headers: bearer(accessToken),
      searchParams: {
        daysWithoutContact: String(options.daysWithoutContact ?? 15),
        daysWithoutResponse: String(options.daysWithoutResponse ?? 7),
      },
    })
    .json<TodayPanel>()
}

/** Vincula (o con null desvincula) una propuesta aprobada con un proyecto de CIMAxios. */
export async function linkProposalProjectRequest(
  accessToken: string,
  proposalId: number,
  projectId: string | null
): Promise<Proposal> {
  return api
    .patch(MARKETING_ROUTES.proposalProject(proposalId), {
      headers: bearer(accessToken),
      json: { projectId },
    })
    .json<Proposal>()
}

/** Claves de consulta del flujo comercial (se invalidan juntas al crear o vincular). */
export const commercialKeys = {
  funnel: (period: string | null) => ['marketing', 'funnel', period ?? 'all'] as const,
  funnelClients: (stage: string, period: string | null) =>
    ['marketing', 'funnel', 'clients', stage, period ?? 'all'] as const,
  timeline: (clientId: string) => ['marketing', 'timeline', clientId] as const,
  today: ['marketing', 'today'] as const,
}
