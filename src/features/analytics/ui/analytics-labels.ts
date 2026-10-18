import type { KpiDetailItemDto, KpiKey, ProjectStatus } from '../model'
import { formatear, type Formato } from './kpi-definitions'

// ── Estados de proyecto (crm-collab → crm-marketing) ────────────────────────
export const PROJECT_STATUSES: ProjectStatus[] = ['todo', 'in_progress', 'in_review', 'completed']

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  completed: 'Completado',
}

// Estados de campañas y propuestas que llegan en el detalle de KPI.
const OTHER_STATUS_LABELS: Record<string, string> = {
  Draft: 'Borrador',
  Active: 'Activa',
  Paused: 'Pausada',
  Completed: 'Completada',
  Cancelled: 'Cancelada',
  In_diagnosis: 'En diagnóstico',
  Sent: 'Enviada',
  In_negotiation: 'En negociación',
  Approved: 'Aprobada',
  Rejected: 'Rechazada',
}

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  Positioning: 'Posicionamiento',
  Direct_sales: 'Venta directa',
  Value_content: 'Contenido de valor',
  Testimonial: 'Testimoniales',
  Reactivation: 'Reactivación',
}

/** Traduce un estado (proyecto, campaña o propuesta). Lo desconocido se muestra tal cual. */
export function statusLabel(status?: string | null): string {
  if (!status) return '—'
  if (status in PROJECT_STATUS_LABELS) return PROJECT_STATUS_LABELS[status as ProjectStatus]
  return OTHER_STATUS_LABELS[status] ?? status
}

/** Subtítulo legible: traduce los tipos de campaña; el resto (cliente, plan, conteos) pasa igual. */
export function subtitleLabel(subtitle?: string | null): string {
  if (!subtitle) return '—'
  return CAMPAIGN_TYPE_LABELS[subtitle] ?? subtitle
}

// ── Fechas ISO sin zona (2026-10-07T00:36:37) ───────────────────────────────
export function formatIsoDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date)
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** "2026-09" → "septiembre 2026". */
export function periodLabel(period?: string | null): string {
  if (!period) return '—'
  const [year, month] = period.split('-').map(Number)
  if (!year || !month || month < 1 || month > 12) return period
  return `${MESES[month - 1]} ${year}`
}

/** "2026-10" → "2026-09". */
export function previousPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number)
  if (!year || !month) return period
  const date = new Date(year, month - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// ── Valores del detalle ─────────────────────────────────────────────────────
/** Formatea el valor de la tarjeta (kpiValue) igual que la tarjeta. */
export function formatKpiValue(value: number | null | undefined, formato: Formato): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return formatear(Number(value), formato)
}

/**
 * Columna "Valor o estado" del detalle. En ingresos muestra el valor de la propuesta y en
 * días de cierre los días; en los demás KPI muestra el estado (o el plan del cliente).
 */
export function detailValueLabel(kpi: KpiKey, item: KpiDetailItemDto): string {
  if (kpi === 'revenue') return formatKpiValue(item.value, 'moneda')
  if (kpi === 'avg_close_days') {
    return item.value == null ? '—' : `${Number(item.value).toFixed(0)} d`
  }
  return statusLabel(item.status)
}

/** Texto plano usado por el buscador del detalle. */
export function detailSearchText(kpi: KpiKey, item: KpiDetailItemDto): string {
  return [item.title, subtitleLabel(item.subtitle), item.clientName, detailValueLabel(kpi, item)]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('es')
}

export function filterDetailItems(
  kpi: KpiKey,
  items: KpiDetailItemDto[],
  search: string
): KpiDetailItemDto[] {
  const term = search.trim().toLocaleLowerCase('es')
  if (!term) return items
  return items.filter((item) => detailSearchText(kpi, item).includes(term))
}

// ── Variación frente al mes anterior ────────────────────────────────────────
export type DeltaTone = 'positive' | 'negative' | 'neutral' | 'none'

export function deltaTone(deltaPercent: number | null | undefined, mejorSiBaja = false): DeltaTone {
  if (deltaPercent == null || Number.isNaN(Number(deltaPercent))) return 'none'
  const value = Number(deltaPercent)
  if (value === 0) return 'neutral'
  const sube = value > 0
  return sube !== mejorSiBaja ? 'positive' : 'negative'
}

export function formatDelta(deltaPercent: number | null | undefined): string {
  if (deltaPercent == null || Number.isNaN(Number(deltaPercent))) return 'sin dato'
  const value = Number(deltaPercent)
  const abs = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(Math.abs(value))
  if (value > 0) return `▲ ${abs} %`
  if (value < 0) return `▼ ${abs} %`
  return `= 0 %`
}

// ── Sincronización con el CRM ───────────────────────────────────────────────
export function syncResultMessage(result: {
  clientesSincronizados?: number | null
  proyectosSincronizados?: number | null
}): string {
  const clientes = Number(result.clientesSincronizados ?? 0)
  const proyectos = Number(result.proyectosSincronizados ?? 0)
  return `${clientes} ${clientes === 1 ? 'cliente' : 'clientes'} y ${proyectos} ${
    proyectos === 1 ? 'proyecto' : 'proyectos'
  } sincronizados`
}
