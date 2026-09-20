import type { CampaignType, CampaignStatus } from '../api/marketing-api'
import type { MarketingClient } from '../api/clients-api'

export const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'Positioning', label: 'Posicionamiento' },
  { value: 'Direct_sales', label: 'Venta Directa' },
  { value: 'Value_content', label: 'Contenido de Valor' },
  { value: 'Testimonial', label: 'Testimoniales / Social Proof' },
  { value: 'Reactivation', label: 'Reactivación' },
]

export const CAMPAIGN_STATUSES: {
  value: CampaignStatus
  label: string
  badge: 'default' | 'secondary' | 'outline' | 'destructive'
}[] = [
  { value: 'Active', label: 'Activa', badge: 'default' },
  { value: 'Draft', label: 'Borrador', badge: 'secondary' },
  { value: 'Paused', label: 'Pausada', badge: 'outline' },
  { value: 'Completed', label: 'Completada', badge: 'default' },
  { value: 'Cancelled', label: 'Cancelada', badge: 'destructive' },
]

export function clientLabel(client: MarketingClient): string {
  return client.contactInfo || client.additionalInfo || client.clientId
}
