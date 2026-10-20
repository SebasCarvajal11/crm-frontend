import type { ClientPlanDistributionDto } from '../../model'

// El color de cada plan viene del catálogo configurable (GET plan-distribution).
// Si falta (p. ej. "sin plan" o un plan heredado), se usa la paleta de respaldo.
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444']
export const SIN_PLAN_COLOR = '#cbd5e1'

export function planSliceColor(d: ClientPlanDistributionDto, index: number): string {
  if (d.color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(d.color.trim())) return d.color.trim()
  return d.plan ? COLORS[index % COLORS.length] : SIN_PLAN_COLOR
}
