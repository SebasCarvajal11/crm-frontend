import { describe, expect, it } from 'vitest'
import type { KpiDetailItemDto } from '../model'
import { KPIS } from './kpi-definitions'
import {
  deltaTone,
  detailValueLabel,
  filterDetailItems,
  formatDelta,
  formatIsoDate,
  formatKpiValue,
  periodLabel,
  previousPeriod,
  statusLabel,
  subtitleLabel,
  syncResultMessage,
} from './analytics-labels'

const item = (over: Partial<KpiDetailItemDto>): KpiDetailItemDto => ({
  id: '1',
  title: null,
  subtitle: null,
  date: null,
  value: null,
  status: null,
  clientId: null,
  clientName: null,
  ...over,
})

describe('KPIS: claves del backend', () => {
  it('cada tarjeta tiene una clave de crm-marketing única', () => {
    const keys = KPIS.map((k) => k.apiKey)
    expect(new Set(keys).size).toBe(8)
    expect(keys).toEqual(
      expect.arrayContaining([
        'new_clients',
        'closed_projects',
        'revenue',
        'active_campaigns',
        'clients_contacted',
        'response_rate',
        'avg_close_days',
        'projects_in_progress',
      ])
    )
  })

  it('solo los días de cierre mejoran al bajar', () => {
    expect(KPIS.filter((k) => k.mejorSiBaja).map((k) => k.apiKey)).toEqual(['avg_close_days'])
  })
})

describe('statusLabel y subtitleLabel', () => {
  it('traduce estados de proyecto, campaña y propuesta', () => {
    expect(statusLabel('todo')).toBe('Por hacer')
    expect(statusLabel('in_progress')).toBe('En progreso')
    expect(statusLabel('in_review')).toBe('En revisión')
    expect(statusLabel('completed')).toBe('Completado')
    expect(statusLabel('Active')).toBe('Activa')
    expect(statusLabel('Approved')).toBe('Aprobada')
  })

  it('deja pasar valores desconocidos (planes) y muestra guion si no hay dato', () => {
    expect(statusLabel('Oro')).toBe('Oro')
    expect(statusLabel(null)).toBe('—')
    expect(subtitleLabel('Direct_sales')).toBe('Venta directa')
    expect(subtitleLabel('Cliente Uno')).toBe('Cliente Uno')
    expect(subtitleLabel(undefined)).toBe('—')
  })
})

describe('fechas y períodos', () => {
  it('formatea fechas ISO sin zona', () => {
    expect(formatIsoDate('2026-10-07T00:36:37')).toContain('2026')
    expect(formatIsoDate('no-es-fecha')).toBe('—')
    expect(formatIsoDate(null)).toBe('—')
  })

  it('nombra el período y calcula el mes anterior, incluido el cambio de año', () => {
    expect(periodLabel('2026-09')).toBe('septiembre 2026')
    expect(previousPeriod('2026-10')).toBe('2026-09')
    expect(previousPeriod('2026-01')).toBe('2025-12')
  })
})

describe('valores del detalle', () => {
  it('formatea kpiValue igual que la tarjeta', () => {
    expect(formatKpiValue(42.5, 'porcentaje')).toBe('42.5%')
    expect(formatKpiValue(12, 'entero')).toBe('12')
    expect(formatKpiValue(null, 'moneda')).toBe('—')
    expect(formatKpiValue(1500000, 'moneda')).toContain('1.500.000')
  })

  it('muestra valor en ingresos y días de cierre, y estado en el resto', () => {
    expect(detailValueLabel('revenue', item({ value: 2000000 }))).toContain('2.000.000')
    expect(detailValueLabel('avg_close_days', item({ value: 14 }))).toBe('14 d')
    expect(detailValueLabel('projects_in_progress', item({ status: 'in_review' }))).toBe('En revisión')
    expect(detailValueLabel('clients_contacted', item({ status: 'Platinum', value: 3 }))).toBe('Platinum')
  })

  it('busca por título, cliente o estado traducido', () => {
    const items = [
      item({ id: 'a', title: 'Campaña Navidad', clientName: 'Acme', status: 'Active' }),
      item({ id: 'b', title: 'Lanzamiento', clientName: 'Beta SAS', status: 'Paused' }),
    ]
    expect(filterDetailItems('active_campaigns', items, '').length).toBe(2)
    expect(filterDetailItems('active_campaigns', items, 'beta').map((i) => i.id)).toEqual(['b'])
    expect(filterDetailItems('active_campaigns', items, 'activa').map((i) => i.id)).toEqual(['a'])
  })
})

describe('variación frente al mes anterior', () => {
  it('formatea flechas y "sin dato"', () => {
    expect(formatDelta(33.33)).toBe('▲ 33,3 %')
    expect(formatDelta(-12)).toBe('▼ 12 %')
    expect(formatDelta(0)).toBe('= 0 %')
    expect(formatDelta(null)).toBe('sin dato')
  })

  it('decide el color e invierte cuando bajar es mejor', () => {
    expect(deltaTone(10)).toBe('positive')
    expect(deltaTone(-10)).toBe('negative')
    expect(deltaTone(10, true)).toBe('negative')
    expect(deltaTone(-10, true)).toBe('positive')
    expect(deltaTone(0)).toBe('neutral')
    expect(deltaTone(null)).toBe('none')
  })
})

describe('syncResultMessage', () => {
  it('usa los dos conteos que devuelve el backend', () => {
    expect(syncResultMessage({ clientesSincronizados: 5, proyectosSincronizados: 17 })).toBe(
      '5 clientes y 17 proyectos sincronizados'
    )
    expect(syncResultMessage({ clientesSincronizados: 1, proyectosSincronizados: 1 })).toBe(
      '1 cliente y 1 proyecto sincronizados'
    )
  })
})
