import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MetricRibbon } from './metric-ribbon'

describe('MetricRibbon', () => {
  it('renderiza items y valores correctamente', () => {
    const markup = renderToStaticMarkup(
      <MetricRibbon
        items={[
          { label: 'Total Clientes', value: '150', subtext: 'Activos' },
          { label: 'Proyectos', value: '12', subtext: 'En curso' },
        ]}
        columns={2}
      />
    )
    expect(markup).toContain('Total Clientes')
    expect(markup).toContain('150')
    expect(markup).toContain('Proyectos')
    expect(markup).toContain('12')
  })

  it('renderiza skeletons en estado de carga', () => {
    const markup = renderToStaticMarkup(
      <MetricRibbon items={[]} isLoading={true} skeletonCount={4} />
    )
    expect(markup).toContain('animate-pulse')
  })
})
