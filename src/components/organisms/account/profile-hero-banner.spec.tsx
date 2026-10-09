import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProfileHeroBanner } from './profile-hero-banner'

describe('ProfileHeroBanner organism', () => {
  it('renderiza con atributos accesibles y data-testid', () => {
    const markup = renderToStaticMarkup(<ProfileHeroBanner />)
    expect(markup).toContain('data-testid="profile-hero-banner"')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('select-none')
  })

  it('incluye las tres capas de orbes atmosféricos animados para la GPU', () => {
    const markup = renderToStaticMarkup(<ProfileHeroBanner />)
    expect(markup).toContain('animate-aurora-orb-1')
    expect(markup).toContain('animate-aurora-orb-2')
    expect(markup).toContain('animate-aurora-orb-3')
  })

  it('preserva el degradado ejecutivo de base de marca CIMA', () => {
    const markup = renderToStaticMarkup(<ProfileHeroBanner />)
    expect(markup).toContain('bg-gradient-to-r')
    expect(markup).toContain('from-primary')
  })

  it('permite inyectar clases adicionales mediante la prop className', () => {
    const markup = renderToStaticMarkup(<ProfileHeroBanner className="custom-banner-class" />)
    expect(markup).toContain('custom-banner-class')
  })
})
