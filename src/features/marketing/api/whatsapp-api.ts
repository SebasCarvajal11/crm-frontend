import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'

// ── WhatsApp por enviar (mensajes preparados por automatizaciones) ──────────

export interface WhatsappPendingItem {
  interactionId: number
  clientId: string
  clientName: string
  message: string
  createdAt: string
  workflowName?: string | null
}

export interface WhatsappSentResult {
  interactionId: number
  deliveryStatus: 'SENT_MANUAL' | string
  sentAt: string
}

export async function listWhatsappPendingRequest(accessToken: string): Promise<WhatsappPendingItem[]> {
  return api.get(MARKETING_ROUTES.whatsappPending, { headers: bearer(accessToken) }).json<WhatsappPendingItem[]>()
}

/** Marca el WhatsApp como enviado a mano (SENT_MANUAL): desde ahí cuenta como contacto. 409 si ya no está pendiente. */
export async function markWhatsappSentRequest(accessToken: string, interactionId: number): Promise<WhatsappSentResult> {
  return api
    .patch(MARKETING_ROUTES.whatsappPendingSent(interactionId), { headers: bearer(accessToken) })
    .json<WhatsappSentResult>()
}
