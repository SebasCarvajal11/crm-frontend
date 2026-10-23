import type {
  ActionType,
  CreateWorkflowInput,
  TriggerType,
  Workflow,
  WorkflowExecutedClient,
} from '../api/marketing-api'
import { ACTION_TYPES, TRIGGER_TYPES } from './workflow.constants'
import { channelForAction } from './templates.utils'

/** Solo estos disparadores usan "días" (el backend responde 400 si se envían en otros). */
export function triggerUsesDays(trigger: TriggerType | string): boolean {
  return trigger === 'no_contact_x_days' || trigger === 'proposal_no_response'
}

export function triggerUsesSchedule(trigger: TriggerType | string): boolean {
  return trigger === 'scheduled_date'
}

export function actionUsesTemplate(action: ActionType): boolean {
  return channelForAction(action) !== null
}

export function triggerMeta(trigger: TriggerType | string) {
  return TRIGGER_TYPES.find((t) => t.value === trigger) ?? null
}

export function actionMeta(action: ActionType | string) {
  return ACTION_TYPES.find((a) => a.value === action) ?? null
}

export const DEFAULT_DAYS = 15

/** "2026-12-01T09:00:00" (Bogotá) → valor de <input type="datetime-local"> ("2026-12-01T09:00"). */
export function toDateTimeLocal(value?: string | null): string {
  if (!value) return ''
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(value)
  return m ? `${m[1]}T${m[2]}` : ''
}

/** Valor del input datetime-local → LocalDateTime del backend con segundos. */
export function fromDateTimeLocal(value?: string | null): string | null {
  if (!value) return null
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2}))?$/.exec(value)
  return m ? `${m[1]}T${m[2]}:${m[3] ?? '00'}` : null
}

/** Fecha y hora legibles sin cambiar de zona (el backend las da en hora de Bogotá). */
export function formatLocalDateTime(value?: string | null): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value ?? '')
  if (!m) return '—'
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]))
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export type WorkflowFormErrors = Partial<Record<'workflowName' | 'campaignId' | 'scheduledAt' | 'noContactDays', string>>

export function validateWorkflowForm(form: CreateWorkflowInput): WorkflowFormErrors {
  const errors: WorkflowFormErrors = {}
  if (!form.workflowName.trim()) errors.workflowName = 'Escriba un nombre para la automatización.'
  if (!form.campaignId) errors.campaignId = 'Elija la campaña de la automatización.'
  if (triggerUsesSchedule(form.triggerType) && !fromDateTimeLocal(toDateTimeLocal(form.scheduledAt))) {
    errors.scheduledAt = 'Elija la fecha y hora en que se enviará.'
  }
  if (triggerUsesDays(form.triggerType)) {
    const days = form.noContactDays ?? 0
    if (!Number.isInteger(days) || days < 1 || days > 365) errors.noContactDays = 'Escriba un número de días entre 1 y 365.'
  }
  return errors
}

/**
 * Cuerpo para el backend: noContactDays solo en los disparadores que lo usan,
 * scheduledAt solo en "Fecha y hora programada" y templateId solo si la acción usa plantilla.
 */
export function workflowPayload(form: CreateWorkflowInput): CreateWorkflowInput {
  const payload: CreateWorkflowInput = {
    ...form,
    workflowName: form.workflowName.trim(),
    templateId: actionUsesTemplate(form.actionType) ? form.templateId ?? null : null,
  }
  if (triggerUsesDays(form.triggerType)) payload.noContactDays = form.noContactDays ?? DEFAULT_DAYS
  else delete payload.noContactDays
  if (triggerUsesSchedule(form.triggerType)) payload.scheduledAt = fromDateTimeLocal(toDateTimeLocal(form.scheduledAt))
  else delete payload.scheduledAt
  return payload
}

/** "Sin contacto (X días) · 15 días", "Fecha y hora programada · 1 dic 2026, 9:00", "Proyecto finalizado". */
export function triggerSummary(w: Pick<Workflow, 'triggerType' | 'noContactDays' | 'scheduledAt'>): string {
  const label = triggerMeta(w.triggerType)?.label ?? w.triggerType
  if (triggerUsesDays(w.triggerType) && w.noContactDays) {
    return `${label} · ${w.noContactDays} ${w.noContactDays === 1 ? 'día' : 'días'}`
  }
  if (triggerUsesSchedule(w.triggerType)) {
    return w.scheduledAt ? `${label} · ${formatLocalDateTime(w.scheduledAt)}` : `${label} · sin fecha`
  }
  return label
}

export type RunResultTone = 'ok' | 'neutral' | 'pending' | 'warn' | 'error'

/** Resultado por cliente de "Ejecutar ahora", en español. */
export function runResultMeta(
  item: Pick<WorkflowExecutedClient, 'result' | 'deliveryStatus'>,
  actionType: ActionType | string
): { label: string; tone: RunResultTone } {
  if (item.result === 'failed' || item.deliveryStatus === 'FAILED') return { label: 'Falló', tone: 'error' }
  if (item.deliveryStatus === 'SKIPPED_LIMIT') return { label: 'Sin cupo de correo hoy', tone: 'warn' }
  if (actionType === 'send_whatsapp') return { label: 'WhatsApp por enviar', tone: 'pending' }
  if (actionType === 'send_portal_message') return { label: 'En el portal', tone: 'ok' }
  if (item.deliveryStatus === 'QUEUED') return { label: 'Enviado (en cola)', tone: 'ok' }
  if (item.deliveryStatus === 'SIMULATED') return { label: 'Simulado', tone: 'neutral' }
  if (item.deliveryStatus === 'SENT_MANUAL') return { label: 'Enviado por WhatsApp', tone: 'ok' }
  if (actionType === 'log_followup') return { label: 'Seguimiento registrado', tone: 'ok' }
  if (item.result === 'pending') return { label: 'Pendiente', tone: 'pending' }
  return { label: 'Hecho', tone: 'ok' }
}

export const RUN_TONE_CLASSES: Record<RunResultTone, string> = {
  ok: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  neutral: 'border-border bg-muted text-muted-foreground',
  pending: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  warn: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
}

/** Texto de confirmación de "Ejecutar ahora". */
export function runNowWarning(trigger: TriggerType | string): string {
  if (trigger === 'manual') return 'Es un disparo manual: le llegará otra vez a toda la audiencia.'
  return 'Se aplican las mismas reglas del disparador: solo les llega a los clientes que cumplan las condiciones hoy.'
}
