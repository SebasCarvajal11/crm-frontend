import type { Campaign } from '../api/marketing-api'

/**
 * Enlace de WhatsApp sin número: el cliente no tiene teléfono en la API, así
 * que WhatsApp deja escoger el contacto y trae el mensaje ya escrito.
 */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message.trim())}`
}

/** Canal con el que se registra la interacción (mismo valor que CANALES en RegisterContactDialog). */
export const WHATSAPP_CHANNEL = 'whatsapp'

/**
 * Campañas para registrar el contacto: primero las del cliente (activas
 * primero) y, si no tiene, todas. Devuelve también si se filtró por cliente.
 */
export function campaignsForClient(
  campaigns: Campaign[],
  clientId?: string | null,
  /** Campañas cuya audiencia incluye al cliente según el backend (GET /campaigns/client/{clientId}). */
  audienceCampaignIds?: ReadonlySet<number> | null
): { campaigns: Campaign[]; ofClient: boolean } {
  const order = (c: Campaign) => (c.status === 'Active' ? 0 : 1)
  const sorted = [...campaigns].sort((a, b) => order(a) - order(b))
  // Las campañas para todos los clientes, o de un segmento que lo incluye, también son suyas.
  const propias = clientId
    ? sorted.filter(
        (c) => c.clientId === clientId || c.audienceType === 'ALL' || audienceCampaignIds?.has(c.campaignId)
      )
    : []
  return propias.length > 0
    ? { campaigns: propias, ofClient: true }
    : { campaigns: sorted, ofClient: false }
}
