import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { KpiDetailDto } from '../model'
import { KPIS } from './kpi-definitions'
import { KpiDetailPanel, type KpiDetailPanelProps } from './KpiDetailPanel'
import { KpiDeltaBadge } from './KpiDeltaBadge'

const revenue = KPIS.find((k) => k.apiKey === 'revenue')!
const newClients = KPIS.find((k) => k.apiKey === 'new_clients')!

const revenueDetail: KpiDetailDto = {
  kpi: 'revenue',
  period: '2026-10',
  total: 2,
  kpiValue: 3500000,
  items: [
    {
      id: '10',
      title: 'Plan Oro anual',
      subtitle: 'Acme SAS',
      date: '2026-10-07T00:36:37',
      value: 2000000,
      status: 'Approved',
      clientId: 'c1',
      clientName: 'Acme SAS',
    },
    {
      id: '11',
      title: 'Video corporativo',
      subtitle: 'Beta Ltda',
      date: '2026-10-12T09:00:00',
      value: 1500000,
      status: 'Approved',
      clientId: 'c2',
      clientName: 'Beta Ltda',
    },
  ],
}

function renderPanel(over: Partial<KpiDetailPanelProps> = {}) {
  const props: KpiDetailPanelProps = {
    definition: revenue,
    period: '2026-10',
    detail: revenueDetail,
    isLoading: false,
    isError: false,
    search: '',
    onSearchChange: () => {},
    onRetry: () => {},
    onPreviousPeriod: () => {},
    onExport: () => {},
    isExporting: false,
    exportFormat: null,
    ...over,
  }
  return renderToStaticMarkup(<KpiDetailPanel {...props} />)
}

describe('KpiDetailPanel', () => {
  it('muestra el valor de la tarjeta y el número de registros en el encabezado', () => {
    const markup = renderPanel()
    expect(markup).toContain('Ingresos estimados')
    expect(markup).toContain('3.500.000')
    expect(markup).toContain('2 registros')
    expect(markup).toContain('octubre 2026')
  })

  it('lista los registros con título, subtítulo, fecha y valor', () => {
    const markup = renderPanel()
    expect(markup).toContain('Plan Oro anual')
    expect(markup).toContain('Beta Ltda')
    expect(markup).toContain('2.000.000')
    expect(markup).toContain('Valor o estado')
    expect(markup).toContain('Total: 2 registros')
  })

  it('ofrece exportar a Excel y PDF', () => {
    const markup = renderPanel()
    expect(markup).toContain('Excel')
    expect(markup).toContain('PDF')
  })

  it('filtra con el buscador e indica cuántos coinciden', () => {
    const markup = renderPanel({ search: 'video' })
    expect(markup).toContain('Video corporativo')
    expect(markup).not.toContain('Plan Oro anual')
    expect(markup).toContain('Mostrando 1 de 2 registros')
  })

  it('sugiere limpiar la búsqueda cuando nada coincide', () => {
    const markup = renderPanel({ search: 'zzz' })
    expect(markup).toContain('Ningún registro coincide')
    expect(markup).toContain('Limpiar búsqueda')
  })

  it('en un mes sin registros ofrece ver el mes anterior', () => {
    const markup = renderPanel({
      definition: newClients,
      detail: { kpi: 'new_clients', period: '2026-10', total: 0, kpiValue: 0, items: [] },
    })
    expect(markup).toContain('Sin registros en octubre 2026')
    expect(markup).toContain('Ver el mes anterior')
    expect(markup).toContain('0 registros')
  })

  it('muestra carga y error con reintento', () => {
    expect(renderPanel({ isLoading: true, detail: null })).toContain('Cargando detalle')
    const error = renderPanel({ isError: true, detail: null })
    expect(error).toContain('No se pudo cargar el detalle')
    expect(error).toContain('Reintentar')
  })

  it('informa si la exportación falla', () => {
    expect(renderPanel({ exportError: 'No se pudo generar el archivo.' })).toContain(
      'No se pudo generar el archivo.'
    )
  })
})

describe('KpiDeltaBadge', () => {
  it('muestra subida en verde con referencia al mes anterior', () => {
    const markup = renderToStaticMarkup(<KpiDeltaBadge deltaPercent={20} previousPeriod="2026-09" />)
    expect(markup).toContain('▲ 20 %')
    expect(markup).toContain('data-tone="positive"')
    expect(markup).toContain('vs septiembre 2026')
  })

  it('muestra bajada en rojo', () => {
    const markup = renderToStaticMarkup(<KpiDeltaBadge deltaPercent={-5.5} />)
    expect(markup).toContain('▼ 5,5 %')
    expect(markup).toContain('data-tone="negative"')
  })

  it('invierte el color cuando bajar es mejor', () => {
    const markup = renderToStaticMarkup(<KpiDeltaBadge deltaPercent={-5} mejorSiBaja />)
    expect(markup).toContain('data-tone="positive"')
  })

  it('indica "sin dato" cuando deltaPercent es null', () => {
    const markup = renderToStaticMarkup(<KpiDeltaBadge deltaPercent={null} />)
    expect(markup).toContain('sin dato')
    expect(markup).toContain('data-tone="none"')
  })
})
