import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MetricRibbon } from './metric-ribbon'

describe('MetricRibbon', () => {
  it('renderiza items y valores correctamente con tipografía tabular', () => {
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
    expect(markup).toContain('tabular-nums')
  })

  it('renderiza skeletons en estado de carga', () => {
    const markup = renderToStaticMarkup(
      <MetricRibbon items={[]} isLoading={true} skeletonCount={4} />
    )
    expect(markup).toContain('animate-pulse')
  })

  it('soporta valores formateados con porcentajes y monedas', () => {
    const markup = renderToStaticMarkup(
      <MetricRibbon
        items={[
          { label: 'Tasa de conversión', value: '94.5%' },
          { label: 'Ingresos', value: '$ 1.250.000' },
        ]}
        columns={2}
      />
    )
    expect(markup).toContain('94.5%')
    expect(markup).toContain('$ 1.250.000')
  })

  it('permite deshabilitar la animación explícitamente en el item', () => {
    const markup = renderToStaticMarkup(
      <MetricRibbon
        items={[
          { label: 'Sin animación', value: '300', animated: false },
        ]}
        columns={2}
      />
    )
    expect(markup).toContain('300')
  })
})
