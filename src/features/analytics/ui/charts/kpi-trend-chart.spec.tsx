import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { KpiSnapshotDto } from '../../model'
import { KpiTrendChart } from './KpiTrendChart'
import { KpiChartTooltip, type KpiTooltipPayloadItem } from './kpi-chart-tooltip'
import { KpiChartGradients } from './kpi-chart-gradients'

const mockKpis: KpiSnapshotDto[] = [
  {
    snapshotsId: 1,
    period: '2026-01',
    newClients: 12,
    closedProjects: 8,
    projectsInProgress: 15,
    activeCampaigns: 4,
    estimatedRevenue: 12000,
    clientsContacted: 30,
    responseRate: 40,
    avgCloseDays: 14,
    calculatedBy: 'admin',
    calculatedAt: '2026-01-31T23:59:59Z',
  },
  {
    snapshotsId: 2,
    period: '2026-02',
    newClients: 18,
    closedProjects: 11,
    projectsInProgress: 14,
    activeCampaigns: 6,
    estimatedRevenue: 18000,
    clientsContacted: 45,
    responseRate: 42,
    avgCloseDays: 12,
    calculatedBy: 'admin',
    calculatedAt: '2026-02-28T23:59:59Z',
  },
]

describe('KpiTrendChart: Áreas Degradadas y Tooltips Glassmorphic', () => {
  it('renderiza mensaje de carga cuando loading es true', () => {
    const markup = renderToStaticMarkup(
      <KpiTrendChart data={[]} loading={true} />
    )

    expect(markup).toContain('Cargando gráfico de tendencias...')
  })

  it('renderiza estado vacío cuando no existen períodos consolidados', () => {
    const markup = renderToStaticMarkup(
      <KpiTrendChart data={[]} loading={false} />
    )

    expect(markup).toContain('Aún no hay períodos consolidados')
  })

  it('renderiza contenedor de gráfico responsive con datos válidos', () => {
    const markup = renderToStaticMarkup(
      <KpiTrendChart data={mockKpis} loading={false} />
    )

    expect(markup).toContain('data-testid="kpi-trend-area-chart"')
    expect(markup).toContain('class="recharts-responsive-container"')
  })
})

describe('KpiChartGradients', () => {
  it('renderiza 4 gradientes radiantes para las series corporativas', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <KpiChartGradients />
      </svg>
    )

    expect(markup).toContain('id="gradientNewClients"')
    expect(markup).toContain('stop-opacity="0.32"')
    expect(markup).toContain('stop-opacity="0.01"')
  })
})

describe('KpiChartTooltip', () => {
  it('retorna null si active es false o no hay payload', () => {
    const markupInactive = renderToStaticMarkup(
      <KpiChartTooltip active={false} payload={[]} label="2026-01" />
    )
    expect(markupInactive).toBe('')

    const markupEmpty = renderToStaticMarkup(
      <KpiChartTooltip active={true} payload={[]} label="2026-01" />
    )
    expect(markupEmpty).toBe('')
  })

  it('renderiza tooltip flotante glassmorphic con valores tabulares cuando está activo', () => {
    const mockPayload: KpiTooltipPayloadItem[] = [
      {
        dataKey: 'newClients',
        name: 'Nuevos Clientes',
        value: 12,
        color: '#3b82f6',
      },
      {
        dataKey: 'closedProjects',
        name: 'Proyectos Cerrados',
        value: 8,
        color: '#10b981',
      },
    ]

    const markup = renderToStaticMarkup(
      <KpiChartTooltip
        active={true}
        payload={mockPayload}
        label="2026-01"
      />
    )

    expect(markup).toContain('data-testid="kpi-chart-glass-tooltip"')
    expect(markup).toContain('Período:')
    expect(markup).toContain('2026-01')
    expect(markup).toContain('Nuevos Clientes')
    expect(markup).toContain('12')
    expect(markup).toContain('Proyectos Cerrados')
    expect(markup).toContain('8')
    expect(markup).toContain('backdrop-blur-md')
  })
})
