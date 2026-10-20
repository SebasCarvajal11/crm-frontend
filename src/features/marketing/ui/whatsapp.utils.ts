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
  clientId?: string | null
): { campaigns: Campaign[]; ofClient: boolean } {
  const order = (c: Campaign) => (c.status === 'Active' ? 0 : 1)
  const sorted = [...campaigns].sort((a, b) => order(a) - order(b))
  const propias = clientId ? sorted.filter((c) => c.clientId === clientId) : []
  return propias.length > 0
    ? { campaigns: propias, ofClient: true }
    : { campaigns: sorted, ofClient: false }
}
