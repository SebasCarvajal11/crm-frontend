import type { AudienceType, Campaign, CreateCampaignInput } from '../api/marketing-api'

export const AUDIENCE_OPTIONS: { value: AudienceType; label: string; help: string }[] = [
  { value: 'CLIENT', label: 'Un cliente', help: 'La campaña es para un solo cliente.' },
  {
    value: 'SEGMENT',
    label: 'Un segmento guardado',
    help: 'Le llega a los clientes que hoy cumplen el criterio del segmento.',
  },
  { value: 'ALL', label: 'Todos los clientes', help: 'Le llega a toda la cartera de clientes.' },
]

/** Las campañas anteriores a las audiencias no traen audienceType: son de un cliente. */
export function audienceTypeOf(campaign?: Pick<Campaign, 'audienceType'> | null): AudienceType {
  const t = campaign?.audienceType
  return t === 'SEGMENT' || t === 'ALL' ? t : 'CLIENT'
}

export function clientCountLabel(count?: number | null): string {
  const n = Math.max(0, count ?? 0)
  return `${n.toLocaleString('es-CO')} ${n === 1 ? 'cliente' : 'clientes'}`
}

/**
 * Audiencia legible para tarjetas y formularios:
 * "Cliente: Ana", "Segmento: Oro sin proyecto · 8 clientes" o "Todos los clientes · 25".
 */
export function audienceLabel(
  campaign: Pick<Campaign, 'audienceType' | 'clientId' | 'segmentName' | 'audienceSize'>,
  clientName?: string | null
): string {
  const type = audienceTypeOf(campaign)
  if (type === 'ALL') {
    return campaign.audienceSize != null
      ? `Todos los clientes · ${campaign.audienceSize.toLocaleString('es-CO')}`
      : 'Todos los clientes'
  }
  if (type === 'SEGMENT') {
    const name = campaign.segmentName?.trim() || 'sin nombre'
    return campaign.audienceSize != null
      ? `Segmento: ${name} · ${clientCountLabel(campaign.audienceSize)}`
      : `Segmento: ${name}`
  }
  if (!campaign.clientId) return 'Cliente: sin asignar'
  return `Cliente: ${clientName?.trim() || 'Cliente del CRM'}`
}

/** Error del formulario de audiencia, o null si está completa. */
export function validateAudience(form: Pick<CreateCampaignInput, 'audienceType' | 'clientId' | 'segmentId'>): string | null {
  const type = form.audienceType ?? 'CLIENT'
  if (type === 'CLIENT' && !form.clientId) return 'Elija el cliente al que va dirigida la campaña.'
  if (type === 'SEGMENT' && !form.segmentId) return 'Elija el segmento guardado al que va dirigida la campaña.'
  return null
}

/** Solo envía el identificador que corresponde a la audiencia (el otro va en null). */
export function campaignPayload(form: CreateCampaignInput): CreateCampaignInput {
  const audienceType = form.audienceType ?? 'CLIENT'
  return {
    ...form,
    audienceType,
    clientId: audienceType === 'CLIENT' ? form.clientId || null : null,
    segmentId: audienceType === 'SEGMENT' ? form.segmentId || null : null,
    endDate: form.endDate || null,
  }
}

/** ¿La campaña actúa hoy? Activa y con la fecha de hoy entre su inicio y su cierre. */
export function campaignRunsToday(
  campaign: Pick<Campaign, 'status' | 'startDate' | 'endDate'>,
  today: Date = new Date()
): { ok: boolean; reason: string | null } {
  if (campaign.status !== 'Active') {
    return { ok: false, reason: 'La campaña no está activa: la automatización no enviará nada hasta activarla.' }
  }
  const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const start = campaign.startDate?.slice(0, 10)
  const end = campaign.endDate?.slice(0, 10)
  if (start && day < start) return { ok: false, reason: 'La campaña todavía no empieza: está fuera de sus fechas.' }
  if (end && day > end) return { ok: false, reason: 'La campaña ya terminó: está fuera de sus fechas.' }
  return { ok: true, reason: null }
}

/** "Le llegará a: …": "Ana · 1 cliente", "Segmento Oro sin proyecto · 8 clientes", "Todos los clientes · 25 clientes". */
export function audienceReach(
  campaign: Pick<Campaign, 'audienceType' | 'clientId' | 'segmentName' | 'audienceSize'>,
  clientName?: string | null
): string {
  const type = audienceTypeOf(campaign)
  if (type === 'CLIENT') {
    return `${clientName?.trim() || (campaign.clientId ? 'Cliente del CRM' : 'sin cliente')} · ${clientCountLabel(campaign.clientId ? 1 : 0)}`
  }
  const who = type === 'ALL' ? 'Todos los clientes' : `Segmento ${campaign.segmentName?.trim() || 'sin nombre'}`
  return campaign.audienceSize != null ? `${who} · ${clientCountLabel(campaign.audienceSize)}` : who
}
