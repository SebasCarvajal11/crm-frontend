import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AnimatedCounter } from './animated-counter'

describe('AnimatedCounter atom', () => {
  it('renderiza números con clase tabular-nums para evitar jitter', () => {
    const markup = renderToStaticMarkup(<AnimatedCounter value={150} />)
    expect(markup).toContain('150')
    expect(markup).toContain('tabular-nums')
  })

  it('renderiza cadenas monetarias y porcentajes con formato correcto', () => {
    const currency = renderToStaticMarkup(<AnimatedCounter value="$1,250.50" />)
    expect(currency).toContain('$1,250.50')
    expect(currency).toContain('tabular-nums')

    const percent = renderToStaticMarkup(<AnimatedCounter value="85%" />)
    expect(percent).toContain('85%')
  })

  it('soporta sufijos como días y latencias en ms', () => {
    const days = renderToStaticMarkup(<AnimatedCounter value="14 días" />)
    expect(days).toContain('14 días')

    const ms = renderToStaticMarkup(<AnimatedCounter value="320 ms" />)
    expect(ms).toContain('320 ms')
  })

  it('permite cambiar el tag contenedor mediante la propiedad as', () => {
    const markup = renderToStaticMarkup(<AnimatedCounter value={42} as="p" />)
    expect(markup).toContain('<p')
    expect(markup).toContain('42')
  })

  it('renderiza contenido no numérico directamente', () => {
    const textMarkup = renderToStaticMarkup(<AnimatedCounter value="No disponible" />)
    expect(textMarkup).toContain('No disponible')
  })
})
