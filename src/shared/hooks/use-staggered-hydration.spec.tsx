import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useStaggeredHydration } from './use-staggered-hydration'

function TestComponent({ t2, t3 }: { t2?: number; t3?: number }) {
  const { tier2, tier3 } = useStaggeredHydration(t2, t3)
  return <div data-tier2={tier2} data-tier3={tier3} />
}

describe('useStaggeredHydration', () => {
  it('inicializa con tier2 y tier3 en false para proteger el primer paint', () => {
    const markup = renderToStaticMarkup(<TestComponent />)
    expect(markup).toContain('data-tier2="false"')
    expect(markup).toContain('data-tier3="false"')
  })

  it('permite configurar retrasos personalizados sin arrojar excepciones', () => {
    expect(() => {
      renderToStaticMarkup(<TestComponent t2={80} t3={250} />)
    }).not.toThrow()
  })
})
