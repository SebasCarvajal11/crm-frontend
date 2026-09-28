import { api } from '@/shared/lib/api-client'
import { bearer } from '@/shared/lib/bearer'
import { ADMIN_ROUTES, IDENTITY_ROUTES } from '@/shared/lib/gateway-routes'
import { useSessionStore } from '@/app/session/session-store'
import { getAccessTokenRole } from '@/shared/lib/access-token-role'
import { snapshotSchema, type PresencePages } from '../model/presence'

export async function observeOwnPresence(signal: AbortSignal) {
  const response = await api.post(IDENTITY_ROUTES.presence, { headers: bearer(), signal, timeout: 10_000 })
    .json<{ data: { heartbeat_interval_seconds: number } }>()
  const seconds = response.data.heartbeat_interval_seconds
  if (!Number.isFinite(seconds) || seconds < 30 || seconds > 300) throw new Error('Frecuencia de presencia inválida')
  return seconds * 1000
}

export async function listPresence(q: string, pages: PresencePages, signal: AbortSignal) {
  if (getAccessTokenRole(useSessionStore.getState().token) !== 'admin') throw new Error('Consulta de presencia no autorizada')
  const response = await api.get(ADMIN_ROUTES.presence, { headers: bearer(), signal, timeout: 10_000,
    searchParams: { q, worker_page: pages.worker, client_page: pages.client, admin_page: pages.admin },
  }).json<{ data: unknown }>()
  return { ...snapshotSchema.parse(response.data), receivedAt: Date.now() }
}
