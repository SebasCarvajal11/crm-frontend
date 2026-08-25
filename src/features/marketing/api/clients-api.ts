import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'
import type { MarketingClient } from './proposals-api'

export type ClientPlan = 'Oro' | 'Esmeralda' | 'Premium'

export type { MarketingClient }

export async function listClientsRequest(accessToken: string): Promise<MarketingClient[]> {
  return api.get(MARKETING_ROUTES.clients, { headers: bearer(accessToken) }).json<MarketingClient[]>()
}

export async function listClientsWithoutPlanRequest(accessToken: string): Promise<MarketingClient[]> {
  return api
    .get(MARKETING_ROUTES.clientsWithoutPlan, { headers: bearer(accessToken) })
    .json<MarketingClient[]>()
}

export async function assignClientPlanRequest(
  accessToken: string,
  clientId: string,
  plan: ClientPlan
): Promise<MarketingClient> {
  return api
    .patch(MARKETING_ROUTES.clientPlan(clientId), { headers: bearer(accessToken), json: { plan } })
    .json<MarketingClient>()
}

export async function assignClientPlansBulkRequest(
  accessToken: string,
  asignaciones: Record<string, ClientPlan>
): Promise<{ actualizados: number; clientes: string[] }> {
  return api
    .patch(MARKETING_ROUTES.clientPlansBulk, { headers: bearer(accessToken), json: asignaciones })
    .json<{ actualizados: number; clientes: string[] }>()
}

export async function syncCrmRequest(
  accessToken: string
): Promise<{ clientesSincronizados: number; proyectosSincronizados: number; fecha: string }> {
  return api
    .post(MARKETING_ROUTES.integrationSync, { headers: bearer(accessToken) })
    .json<{ clientesSincronizados: number; proyectosSincronizados: number; fecha: string }>()
}
