import type { MarketingClient } from '../api/clients-api'

export function clientLabel(client: MarketingClient) {
  // additionalInfo = nombre sincronizado del CRM; contactInfo = correo
  return client.additionalInfo || client.contactInfo || client.clientId
}
