import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'
import type { DeliveryStatus } from './interactions-api'

// ── Mensajes entre CIMA y sus clientes (portal ↔ bandeja de Marketing) ─────

/** OUTBOUND = de CIMA al cliente; INBOUND = del cliente a CIMA. */
export type MessageDirection = 'OUTBOUND' | 'INBOUND'

export interface MarketingMessage {
  messageId: string
  direction: MessageDirection | string
  body: string
  createdAt: string
  /** Cuándo lo leyó el destinatario; null si aún no. */
  readAt?: string | null
  /** "Equipo CIMA" en los mensajes de CIMA; nombre del cliente en los suyos. */
  authorName?: string | null
}

export interface StaffMessage extends MarketingMessage {
  /** Solo cuando se pidió alsoEmail=true. */
  emailDeliveryStatus?: DeliveryStatus | null
  emailDetail?: string | null
}

export interface MessageThread {
  clientId: string
  clientName: string
  plan?: string | null
  lastMessage?: string | null
  lastAt?: string | null
  lastDirection?: MessageDirection | string | null
  /** Mensajes del cliente sin leer por CIMA. */
  unread: number
}

export interface StaffMessagePayload {
  body: string
  /** También envía el mensaje por correo (respeta el cupo diario). */
  alsoEmail?: boolean
}

export async function getMessageThreadsRequest(accessToken: string): Promise<MessageThread[]> {
  return api.get(MARKETING_ROUTES.messageThreads, { headers: bearer(accessToken) }).json<MessageThread[]>()
}

export async function getClientMessagesRequest(accessToken: string, clientId: string): Promise<MarketingMessage[]> {
  return api
    .get(MARKETING_ROUTES.clientMessages(clientId), { headers: bearer(accessToken) })
    .json<MarketingMessage[]>()
}

export async function sendClientMessageRequest(
  accessToken: string,
  clientId: string,
  payload: StaffMessagePayload
): Promise<StaffMessage> {
  return api
    .post(MARKETING_ROUTES.clientMessages(clientId), { headers: bearer(accessToken), json: payload })
    .json<StaffMessage>()
}

/** Marca como leídos los mensajes del cliente en esa conversación. */
export async function markClientMessagesReadRequest(
  accessToken: string,
  clientId: string
): Promise<{ marked: number }> {
  return api
    .patch(MARKETING_ROUTES.clientMessagesRead(clientId), { headers: bearer(accessToken) })
    .json<{ marked: number }>()
}

export const messagesKeys = {
  threads: ['marketing', 'messages', 'threads'] as const,
  thread: (clientId: string) => ['marketing', 'messages', 'thread', clientId] as const,
}
