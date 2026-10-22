import { describe, expect, it } from 'vitest'
import type { MarketingPlan } from '../api/plans-api'
import {
  assignablePlans,
  findPlanByName,
  hexToRgba,
  nextSortOrder,
  normalizeHex,
  planChipStyle,
  planToggleMessage,
  sortPlans,
  validatePlanForm,
} from './plans.utils'

const plan = (over: Partial<MarketingPlan>): MarketingPlan => ({
  planId: 'p',
  name: 'Plan',
  color: '#64748b',
  description: null,
  sortOrder: 1,
  active: true,
  clientCount: 0,
  ...over,
})

const plans: MarketingPlan[] = [
  plan({ planId: 'd', name: 'Diamante', color: '#0ea5e9', sortOrder: 3, clientCount: 2 }),
  plan({ planId: 'p', name: 'Platinum', color: '#64748b', sortOrder: 1, clientCount: 5 }),
  plan({ planId: 'o', name: 'Oro', color: '#f59e0b', sortOrder: 2, clientCount: 1 }),
  plan({ planId: 'v', name: 'Plata', color: '#94a3b8', sortOrder: 4, active: false, clientCount: 3 }),
]

describe('colores de plan', () => {
  it('normaliza #RGB y #RRGGBB y rechaza valores inválidos', () => {
    expect(normalizeHex('#F59E0B')).toBe('#f59e0b')
    expect(normalizeHex('#abc')).toBe('#aabbcc')
    expect(normalizeHex('amarillo')).toBeNull()
    expect(normalizeHex('#12345')).toBeNull()
    expect(normalizeHex(null)).toBeNull()
  })

  it('convierte a rgba y usa el gris de respaldo si el color no sirve', () => {
    expect(hexToRgba('#f59e0b', 0.14)).toBe('rgba(245, 158, 11, 0.14)')
    expect(hexToRgba('x', 1)).toBe('rgba(100, 116, 139, 1)')
  })

  it('el chip usa fondo transparente y borde del mismo color', () => {
    expect(planChipStyle('#0ea5e9')).toEqual({
      backgroundColor: 'rgba(14, 165, 233, 0.14)',
      borderColor: 'rgba(14, 165, 233, 0.85)',
    })
  })
})

describe('catálogo de planes', () => {
  it('ordena por sortOrder y ofrece para asignar solo los activos', () => {
    expect(sortPlans(plans).map((p) => p.name)).toEqual(['Platinum', 'Oro', 'Diamante', 'Plata'])
    expect(assignablePlans(plans).map((p) => p.name)).toEqual(['Platinum', 'Oro', 'Diamante'])
  })

  it('busca por nombre sin distinguir mayúsculas ni espacios', () => {
    expect(findPlanByName(plans, '  oro ')?.planId).toBe('o')
    expect(findPlanByName(plans, 'Esmeralda')).toBeNull()
    expect(findPlanByName(plans, null)).toBeNull()
  })

  it('sugiere el siguiente orden', () => {
    expect(nextSortOrder(plans)).toBe(5)
    expect(nextSortOrder([])).toBe(1)
  })
})

describe('validatePlanForm', () => {
  it('exige nombre, color hexadecimal y orden entero', () => {
    expect(validatePlanForm({ name: ' ', color: 'rojo', sortOrder: -1 }, plans)).toEqual({
      name: 'El nombre es obligatorio.',
      color: 'Use un color hexadecimal, por ejemplo #f59e0b.',
      sortOrder: 'El orden debe ser un número entero igual o mayor que 0.',
    })
  })

  it('no permite repetir el nombre de otro plan, pero sí conservar el propio', () => {
    expect(validatePlanForm({ name: 'ORO', color: '#fff', sortOrder: 2 }, plans).name).toBe(
      'Ya existe un plan con ese nombre.'
    )
    expect(validatePlanForm({ name: 'Oro', color: '#fff', sortOrder: 2 }, plans, 'o')).toEqual({})
  })
})

describe('planToggleMessage', () => {
  it('al desactivar avisa cuántos clientes lo tienen', () => {
    const msg = planToggleMessage(plans[1])
    expect(msg.title).toBe('¿Desactivar el plan Platinum?')
    expect(msg.description).toContain('5 clientes tienen este plan')
    expect(msg.description).toContain('Lo conservarán')
    expect(msg.confirmLabel).toBe('Desactivar')
  })

  it('usa singular con un cliente y ofrece reactivar un plan inactivo', () => {
    expect(planToggleMessage(plans[2]).description).toContain('1 cliente tiene este plan. Lo conservará,')
    const msg = planToggleMessage(plans[3])
    expect(msg.title).toBe('¿Reactivar el plan Plata?')
    expect(msg.confirmLabel).toBe('Reactivar')
  })
})
