import { describe, expect, it } from 'vitest'
import {
  clampScore,
  daysOpenLabel,
  daysSinceContactLabel,
  formatConversion,
  funnelPeriodOptions,
  isNotFoundError,
  nextScoreSort,
  normalizeFunnel,
  proposalTitle,
  remainingLabel,
  scoreLevel,
  sortByScore,
  timelineLabel,
} from './commercial.utils'

describe('proposalTitle', () => {
  it('usa la primera línea de la descripción, igual que el backend', () => {
    expect(proposalTitle({ proposalId: 5, description: '\n  Plan Oro anual \nIncluye pauta' })).toBe('Plan Oro anual')
  })
  it('recorta a 80 caracteres y, sin descripción, usa "Propuesta #id"', () => {
    const larga = 'x'.repeat(100)
    expect(proposalTitle({ proposalId: 1, description: larga })).toHaveLength(80)
    expect(proposalTitle({ proposalId: 9, description: '   ' })).toBe('Propuesta #9')
    expect(proposalTitle({ proposalId: 3, description: null })).toBe('Propuesta #3')
  })
})

describe('puntaje de interés', () => {
  it('clasifica por rango: <40 bajo, 40–69 medio, ≥70 alto', () => {
    expect(scoreLevel(39)).toBe('bajo')
    expect(scoreLevel(40)).toBe('medio')
    expect(scoreLevel(69)).toBe('medio')
    expect(scoreLevel(70)).toBe('alto')
  })
  it('limita el valor a 0–100', () => {
    expect(clampScore(140)).toBe(100)
    expect(clampScore(-5)).toBe(0)
    expect(clampScore(null)).toBe(0)
  })
  it('ordena de mayor a menor, de menor a mayor o deja el orden original', () => {
    const clientes = [{ id: 'a', score: 20 }, { id: 'b', score: 90 }, { id: 'c', score: 55 }]
    expect(sortByScore(clientes, 'desc').map((c) => c.id)).toEqual(['b', 'c', 'a'])
    expect(sortByScore(clientes, 'asc').map((c) => c.id)).toEqual(['a', 'c', 'b'])
    expect(sortByScore(clientes, 'none')).toBe(clientes)
    expect(nextScoreSort('none')).toBe('desc')
    expect(nextScoreSort('desc')).toBe('asc')
    expect(nextScoreSort('asc')).toBe('none')
  })
})

describe('embudo', () => {
  it('formatea la conversión en español y "—" si es null; puede pasar de 100', () => {
    expect(formatConversion(66.6667)).toBe('66,7 %')
    expect(formatConversion(125)).toBe('125 %')
    expect(formatConversion(null)).toBe('—')
  })

  it('normaliza las seis etapas en orden aunque falten o lleguen desordenadas', () => {
    const etapas = normalizeFunnel({
      period: null,
      stages: [
        { key: 'approved', label: 'Aprobada', count: 2 },
        { key: 'clients', label: 'Clientes', count: 10 },
      ],
      conversionPercent: [50, null, 0, null, 25],
    })
    expect(etapas.map((e) => e.key)).toEqual(['clients', 'contacted', 'responded', 'proposal_sent', 'approved', 'project'])
    expect(etapas[0]).toMatchObject({ count: 10, toNext: 50 })
    expect(etapas[1]).toMatchObject({ label: 'Contactados', count: 0, toNext: null })
    expect(etapas[5].toNext).toBeUndefined()
    expect(normalizeFunnel([] as never)).toHaveLength(6)
  })

  it('ofrece "Histórico" y los últimos 12 meses', () => {
    const opciones = funnelPeriodOptions(new Date(2026, 9, 21))
    expect(opciones).toHaveLength(13)
    expect(opciones[0]).toEqual({ value: '', label: 'Histórico' })
    expect(opciones[1].value).toBe('2026-10')
    expect(opciones[1].label).toMatch(/^Octubre/)
    expect(opciones[12].value).toBe('2025-11')
  })
})

describe('panel Hoy y línea de tiempo', () => {
  it('describe los días sin contacto y abierta', () => {
    expect(daysSinceContactLabel(null)).toBe('Nunca contactado')
    expect(daysSinceContactLabel(1)).toBe('Hace 1 día')
    expect(daysSinceContactLabel(20)).toBe('Hace 20 días')
    expect(daysOpenLabel(9)).toBe('Abierta hace 9 días')
  })
  it('indica "y N más" solo cuando el total supera lo mostrado', () => {
    expect(remainingLabel(24, 5)).toBe('y 19 más')
    expect(remainingLabel(3, 3)).toBeNull()
  })
  it('traduce el tipo de evento y reconoce el 404', () => {
    expect(timelineLabel('PROPOSAL_DECISION')).toBe('Decisión')
    expect(timelineLabel('OTRO')).toBe('OTRO')
    expect(isNotFoundError({ response: { status: 404 } })).toBe(true)
    expect(isNotFoundError({ response: { status: 500 } })).toBe(false)
    expect(isNotFoundError(null)).toBe(false)
  })
})
