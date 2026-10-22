import type { FunnelResponse, FunnelStageKey, TimelineEventType } from '../api/commercial-api'
import type { MarketingClient, Proposal } from '../api/proposals-api'

/**
 * Título de una propuesta, con la misma regla del backend: primera línea de la
 * descripción (máximo 80 caracteres) o "Propuesta #id".
 */
export function proposalTitle(proposal: Pick<Proposal, 'proposalId' | 'description'>): string {
  const firstLine = (proposal.description ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0)
  if (!firstLine) return `Propuesta #${proposal.proposalId}`
  return firstLine.length > 80 ? `${firstLine.slice(0, 79).trimEnd()}…` : firstLine
}

// ── Puntaje de interés ──────────────────────────────────────────────────────
export type ScoreLevel = 'bajo' | 'medio' | 'alto'

export const SCORE_FORMULA =
  'Puntaje de interés (0–100): +30 si respondió en los últimos 30 días, +20 si tiene una propuesta abierta, ' +
  '+30 si tiene una propuesta aprobada y +20 si tiene un proyecto. Resta 1 punto por cada día sin contacto ' +
  'después de 15.'

export function clampScore(score?: number | null): number {
  if (typeof score !== 'number' || !Number.isFinite(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

/** Rango del puntaje: menos de 40 bajo, de 40 a 69 medio, 70 o más alto. */
export function scoreLevel(score?: number | null): ScoreLevel {
  const s = clampScore(score)
  if (s >= 70) return 'alto'
  if (s >= 40) return 'medio'
  return 'bajo'
}

export const SCORE_TONES: Record<ScoreLevel, { bar: string; text: string; chip: string; label: string }> = {
  bajo: {
    bar: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    chip: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    label: 'Interés bajo',
  },
  medio: {
    bar: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    chip: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    label: 'Interés medio',
  },
  alto: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    label: 'Interés alto',
  },
}

export type ScoreSort = 'none' | 'desc' | 'asc'

export function nextScoreSort(current: ScoreSort): ScoreSort {
  return current === 'desc' ? 'asc' : current === 'asc' ? 'none' : 'desc'
}

/** Ordena clientes por puntaje sin mutar la lista ('none' conserva el orden). */
export function sortByScore<T extends Pick<MarketingClient, 'score'>>(clients: T[], sort: ScoreSort): T[] {
  if (sort === 'none') return clients
  const dir = sort === 'desc' ? -1 : 1
  return [...clients].sort((a, b) => (clampScore(a.score) - clampScore(b.score)) * dir)
}

// ── Embudo ──────────────────────────────────────────────────────────────────
export const FUNNEL_ORDER: FunnelStageKey[] = [
  'clients',
  'contacted',
  'responded',
  'proposal_sent',
  'approved',
  'project',
]

export const FUNNEL_STAGE_LABELS: Record<FunnelStageKey, string> = {
  clients: 'Clientes',
  contacted: 'Contactados',
  responded: 'Respondieron',
  proposal_sent: 'Propuesta enviada',
  approved: 'Aprobada',
  project: 'Con proyecto',
}

/** Qué significa cada etapa y qué hacer con esos clientes. */
export const FUNNEL_STAGE_HELP: Record<FunnelStageKey, { meaning: string; next: string }> = {
  clients: {
    meaning: 'Clientes registrados en el CRM.',
    next: 'Siguiente paso: contactarlos por correo, WhatsApp o llamada.',
  },
  contacted: {
    meaning: 'Clientes a los que se les envió o registró un contacto.',
    next: 'Siguiente paso: hacer seguimiento hasta obtener respuesta.',
  },
  responded: {
    meaning: 'Clientes que contestaron un mensaje.',
    next: 'Siguiente paso: enviarles una propuesta.',
  },
  proposal_sent: {
    meaning: 'Clientes con una propuesta enviada.',
    next: 'Siguiente paso: negociarla y conseguir la aprobación.',
  },
  approved: {
    meaning: 'Clientes con una propuesta aprobada.',
    next: 'Siguiente paso: crear su proyecto en Colaboración.',
  },
  project: {
    meaning: 'Clientes con un proyecto en marcha.',
    next: 'Siguiente paso: entregar y mantener la relación.',
  },
}

export function isFunnelStageKey(value: string): value is FunnelStageKey {
  return (FUNNEL_ORDER as string[]).includes(value)
}

/** Conversión entre etapas: "66,7 %" o "—" cuando no hay dato. Puede pasar de 100 %. */
export function formatConversion(value?: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)} %`
}

/** Opciones del selector de período: "Histórico" y los últimos 12 meses. */
export function funnelPeriodOptions(now = new Date()): { value: string; label: string }[] {
  const options = [{ value: '', label: 'Histórico' }]
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(d)
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return options
}

// ── Panel Hoy ───────────────────────────────────────────────────────────────
export function daysSinceContactLabel(days: number | null | undefined): string {
  if (days === null || days === undefined) return 'Nunca contactado'
  if (days === 0) return 'Hoy'
  return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
}

export function daysOpenLabel(days: number): string {
  return days === 1 ? 'Abierta hace 1 día' : `Abierta hace ${days} días`
}

/** "y N más" cuando el total real supera lo que se muestra. */
export function remainingLabel(total: number, shown: number): string | null {
  const rest = total - shown
  return rest > 0 ? `y ${rest} más` : null
}

// ── Línea de tiempo ─────────────────────────────────────────────────────────
export const TIMELINE_LABELS: Record<TimelineEventType, string> = {
  PLAN: 'Plan',
  CAMPAIGN: 'Campaña',
  MESSAGE: 'Mensaje',
  RESPONSE: 'Respuesta',
  PROPOSAL: 'Propuesta',
  PROPOSAL_DECISION: 'Decisión',
  PROJECT: 'Proyecto',
}

export const TIMELINE_TONES: Record<TimelineEventType, string> = {
  PLAN: 'bg-slate-500/15 text-slate-700 ring-slate-500/30 dark:text-slate-300',
  CAMPAIGN: 'bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300',
  MESSAGE: 'bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300',
  RESPONSE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300',
  PROPOSAL: 'bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300',
  PROPOSAL_DECISION: 'bg-primary/15 text-primary ring-primary/30',
  PROJECT: 'bg-teal-500/15 text-teal-700 ring-teal-500/30 dark:text-teal-300',
}

export function timelineLabel(type: string): string {
  return TIMELINE_LABELS[type as TimelineEventType] ?? type
}

export function timelineTone(type: string): string {
  return TIMELINE_TONES[type as TimelineEventType] ?? 'bg-muted text-muted-foreground ring-border'
}

/** Fecha corta de la línea de tiempo (las fechas llegan en ISO sin zona). */
export function formatShortDate(value?: string | null, withTime = false): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CO', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(d)
}

/** Errores de ky/fetch con estado HTTP 404 (p. ej. ficha de un cliente que no existe). */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const response = (error as { response?: { status?: number } }).response
  return response?.status === 404
}

/** Normaliza la respuesta: seis etapas en orden aunque falte alguna. */
export function normalizeFunnel(data?: FunnelResponse | null) {
  const stages = Array.isArray(data?.stages) ? data.stages : []
  const byKey = new Map(stages.filter((s) => isFunnelStageKey(s.key)).map((s) => [s.key, s]))
  const conversion = Array.isArray(data?.conversionPercent) ? data.conversionPercent : []
  return FUNNEL_ORDER.map((key, i) => ({
    key,
    label: byKey.get(key)?.label || FUNNEL_STAGE_LABELS[key],
    count: byKey.get(key)?.count ?? 0,
    /** Conversión hacia la siguiente etapa (la última no tiene). */
    toNext: i < FUNNEL_ORDER.length - 1 ? (conversion[i] ?? null) : undefined,
  }))
}

/** Filas visibles en cada tarjeta del panel Hoy antes de "Mostrar más". */
export const TODAY_INITIAL_ROWS = 5
