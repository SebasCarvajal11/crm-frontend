import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TourSpotlight } from './tour-spotlight'

describe('TourSpotlight: Spotlight Continuo con Morphing de Foco', () => {
  it('retorna null si el tutorial está minimizado', () => {
    const markup = renderToStaticMarkup(
      <TourSpotlight
        target={null}
        status="ready"
        minimized={true}
        compact={false}
        revision={1}
      />
    )

    expect(markup).toBe('')
  })

  it('retorna null si el viewport es compacto (móvil apaisado / teclado abierto)', () => {
    const markup = renderToStaticMarkup(
      <TourSpotlight
        target={null}
        status="ready"
        minimized={false}
        compact={true}
        revision={1}
      />
    )

    expect(markup).toBe('')
  })

  it('retorna null si target es null', () => {
    const markup = renderToStaticMarkup(
      <TourSpotlight
        target={null}
        status="loading"
        minimized={false}
        compact={false}
        revision={1}
      />
    )

    expect(markup).toBe('')
  })

  it('renderiza foco spotlight con estado y atributos WAI-ARIA cuando hay target', () => {
    // Mock dummy HTMLElement for static rendering
    const dummyTarget = {
      getBoundingClientRect: () => ({
        left: 50,
        top: 100,
        right: 250,
        bottom: 160,
        width: 200,
        height: 60,
      }),
    } as unknown as HTMLElement

    const markup = renderToStaticMarkup(
      <TourSpotlight
        target={dummyTarget}
        status="ready"
        minimized={false}
        compact={false}
        revision={1}
      />
    )

    expect(markup).toContain('data-testid="tour-spotlight"')
    expect(markup).toContain('class="cima-tour-highlight')
    expect(markup).toContain('data-status="ready"')
    expect(markup).toContain('aria-hidden="true"')
  })
})
