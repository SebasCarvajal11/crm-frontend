import type { CSSProperties } from 'react'
import type { MarketingPlan } from '../api/plans-api'

/** Color de respaldo si el plan llega sin color o con un valor inválido. */
export const FALLBACK_PLAN_COLOR = '#64748b'

/** Colores sugeridos en el selector del diálogo de planes. */
export const PLAN_COLOR_SWATCHES = [
  '#64748b',
  '#f59e0b',
  '#0ea5e9',
  '#8b5cf6',
  '#10b981',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
]

/** Normaliza #RGB o #RRGGBB a #rrggbb; devuelve null si no es un color hexadecimal. */
export function normalizeHex(color?: string | null): string | null {
  if (!color) return null
  const value = color.trim().toLowerCase()
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(value)
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
  return /^#[0-9a-f]{6}$/.test(value) ? value : null
}

export function hexToRgba(color: string | null | undefined, alpha: number): string {
  const hex = normalizeHex(color) ?? FALLBACK_PLAN_COLOR
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Estilo del chip de un plan: fondo con transparencia y borde del color del
 * plan. El texto usa el color de primer plano del tema (clase text-foreground),
 * así se lee igual en modo claro y oscuro con cualquier color.
 */
export function planChipStyle(color?: string | null): CSSProperties {
  return {
    backgroundColor: hexToRgba(color, 0.14),
    borderColor: hexToRgba(color, 0.85),
  }
}

/** Busca un plan por nombre sin distinguir mayúsculas (igual que el backend). */
export function findPlanByName(
  plans: MarketingPlan[],
  name?: string | null
): MarketingPlan | null {
  if (!name) return null
  const key = name.trim().toLowerCase()
  return plans.find((p) => p.name.trim().toLowerCase() === key) ?? null
}

/** Planes ordenados por sortOrder y nombre. */
export function sortPlans(plans: MarketingPlan[]): MarketingPlan[] {
  return [...plans].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'es')
  )
}

/** Planes que se pueden asignar a un cliente: solo los activos. */
export function assignablePlans(plans: MarketingPlan[]): MarketingPlan[] {
  return sortPlans(plans.filter((p) => p.active))
}

/** Siguiente orden sugerido para un plan nuevo. */
export function nextSortOrder(plans: MarketingPlan[]): number {
  return plans.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0) + 1
}

export type PlanFormErrors = Partial<Record<'name' | 'color' | 'sortOrder', string>>

/** Validación del diálogo de planes (el backend repite estas reglas). */
export function validatePlanForm(
  input: { name: string; color: string; sortOrder: number },
  plans: MarketingPlan[],
  editingId?: string | null
): PlanFormErrors {
  const errors: PlanFormErrors = {}
  const name = input.name.trim()
  if (!name) errors.name = 'El nombre es obligatorio.'
  else if (name.length > 60) errors.name = 'El nombre admite máximo 60 caracteres.'
  else {
    const repetido = findPlanByName(plans, name)
    if (repetido && repetido.planId !== editingId) errors.name = 'Ya existe un plan con ese nombre.'
  }
  if (!normalizeHex(input.color)) errors.color = 'Use un color hexadecimal, por ejemplo #f59e0b.'
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
    errors.sortOrder = 'El orden debe ser un número entero igual o mayor que 0.'
  }
  return errors
}

/** Textos de la confirmación al desactivar o reactivar un plan. */
export function planToggleMessage(plan: MarketingPlan): {
  title: string
  description: string
  confirmLabel: string
} {
  const n = plan.clientCount ?? 0
  const clientes = n === 1 ? '1 cliente tiene' : `${n} clientes tienen`
  if (plan.active) {
    return {
      title: `¿Desactivar el plan ${plan.name}?`,
      description:
        n > 0
          ? `${clientes} este plan. ${n === 1 ? 'Lo conservará' : 'Lo conservarán'}, pero se verá en gris como inactivo y no se podrá asignar a nadie más.`
          : 'Ningún cliente tiene este plan. Dejará de aparecer en los selectores de asignación.',
      confirmLabel: 'Desactivar',
    }
  }
  return {
    title: `¿Reactivar el plan ${plan.name}?`,
    description:
      n > 0
        ? `${clientes} este plan. Volverá a aparecer en los selectores y se podrá asignar.`
        : 'Volverá a aparecer en los selectores y se podrá asignar.',
    confirmLabel: 'Reactivar',
  }
}
