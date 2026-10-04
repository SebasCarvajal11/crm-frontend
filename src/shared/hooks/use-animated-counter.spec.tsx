import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { easeOutCubic, useAnimatedCounter } from './use-animated-counter'

function TestCounter({ value, options }: { value: unknown; options?: Parameters<typeof useAnimatedCounter>[1] }) {
  const result = useAnimatedCounter(value as React.ReactNode, options)
  return <span>{result}</span>
}

describe('useAnimatedCounter hook', () => {
  it('aplica desaceleración cúbica ease-out correctamente', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBe(0.875)
    // Desaceleración: la tasa de cambio en la primera mitad es mucho mayor que en la segunda
    const firstHalfProgress = easeOutCubic(0.5) - easeOutCubic(0)
    const secondHalfProgress = easeOutCubic(1) - easeOutCubic(0.5)
    expect(firstHalfProgress).toBeGreaterThan(secondHalfProgress)
  })

  it('devuelve el valor formateado estáticamente en entornos SSR o sin rAF', () => {
    const markup = renderToStaticMarkup(<TestCounter value={100} />)
    expect(markup).toContain('100')
  })

  it('respeta opciones de prefijos, sufijos y decimales personalizadas', () => {
    const markup = renderToStaticMarkup(
      <TestCounter
        value={1500}
        options={{ prefix: 'USD ', suffix: ' /mes', thousandsSeparator: ',' }}
      />
    )
    expect(markup).toContain('USD 1,500 /mes')
  })

  it('permite omitir animación si disabled es true', () => {
    const markup = renderToStaticMarkup(
      <TestCounter value={99} options={{ disabled: true }} />
    )
    expect(markup).toContain('99')
  })

  it('permite establecer initialValue nulo para evitar animación inicial', () => {
    const markup = renderToStaticMarkup(
      <TestCounter value={250} options={{ initialValue: null }} />
    )
    expect(markup).toContain('250')
  })

  it('renderiza números negativos y monedas en SSR correctamente', () => {
    const markup = renderToStaticMarkup(<TestCounter value="-$1,250" />)
    expect(markup).toContain('-$1,250')
  })

  it('mantiene valores no numéricos sin alteración', () => {
    const markup = renderToStaticMarkup(<TestCounter value="Estado OK" />)
    expect(markup).toContain('Estado OK')
  })
})
