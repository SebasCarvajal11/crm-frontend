import type { ActionType } from '../api/marketing-api'
import type { MessageTemplate, TemplateChannel } from '../api/templates-api'

export const TEMPLATE_CHANNELS: { value: TemplateChannel; label: string }[] = [
  { value: 'EMAIL', label: 'Correo' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'IN_APP', label: 'En la aplicación' },
]

export function channelLabel(channel?: string | null): string {
  return TEMPLATE_CHANNELS.find((c) => c.value === channel)?.label ?? channel ?? '—'
}

/** Variables que el backend reemplaza en asunto y cuerpo. */
export const TEMPLATE_VARIABLES = [
  { token: '{nombre}', label: 'Nombre' },
  { token: '{plan}', label: 'Plan' },
  { token: '{empresa}', label: 'Empresa' },
  { token: '{workflow}', label: 'Automatización' },
] as const

/**
 * Inserta una variable en la posición del cursor (o reemplaza la selección).
 * Devuelve el texto nuevo y dónde debe quedar el cursor.
 */
export function insertAtCursor(
  text: string,
  selectionStart: number | null | undefined,
  selectionEnd: number | null | undefined,
  token: string
): { text: string; cursor: number } {
  const start = Math.max(0, Math.min(selectionStart ?? text.length, text.length))
  const end = Math.max(start, Math.min(selectionEnd ?? start, text.length))
  return { text: text.slice(0, start) + token + text.slice(end), cursor: start + token.length }
}

/** Canal de plantilla que corresponde a la acción de una automatización. */
export function channelForAction(actionType: ActionType): TemplateChannel {
  if (actionType === 'send_email') return 'EMAIL'
  if (actionType === 'send_whatsapp') return 'WHATSAPP'
  return 'IN_APP'
}

export type TemplateFilters = {
  channel: TemplateChannel | 'ALL'
  /** 'ALL' o el nombre de un plan; un plan incluye también las plantillas generales. */
  plan: string
  search?: string
}

/** Mismo criterio que GET /templates: un plan incluye las plantillas sin plan. Activas primero. */
export function filterTemplates(templates: MessageTemplate[], filters: TemplateFilters): MessageTemplate[] {
  const plan = filters.plan === 'ALL' ? null : filters.plan.trim().toLowerCase()
  const term = (filters.search ?? '').trim().toLowerCase()
  return templates
    .filter((t) => filters.channel === 'ALL' || t.channel === filters.channel)
    .filter((t) => !plan || !t.plan || t.plan.trim().toLowerCase() === plan)
    .filter(
      (t) =>
        !term ||
        t.name.toLowerCase().includes(term) ||
        (t.subject ?? '').toLowerCase().includes(term) ||
        t.body.toLowerCase().includes(term)
    )
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, 'es'))
}

/** Plantillas activas que puede usar una automatización según su acción. */
export function templatesForAction(templates: MessageTemplate[], actionType: ActionType): MessageTemplate[] {
  const channel = channelForAction(actionType)
  return templates.filter((t) => t.active && t.channel === channel)
}

export type TemplateFormErrors = Partial<Record<'name' | 'body' | 'subject', string>>

export function validateTemplateForm(input: {
  name: string
  channel: TemplateChannel
  subject: string
  body: string
}): TemplateFormErrors {
  const errors: TemplateFormErrors = {}
  if (!input.name.trim()) errors.name = 'El nombre es obligatorio.'
  else if (input.name.trim().length > 120) errors.name = 'El nombre admite máximo 120 caracteres.'
  if (input.channel === 'EMAIL' && input.subject.trim().length > 200) {
    errors.subject = 'El asunto admite máximo 200 caracteres.'
  }
  if (!input.body.trim()) errors.body = 'El cuerpo del mensaje es obligatorio.'
  return errors
}
