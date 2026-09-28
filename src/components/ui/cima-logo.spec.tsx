import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CimaLogo } from './cima-logo'

describe('CimaLogo', () => {
  it.each([
    ['basic', 'CIMA', 651, 225],
    ['full', 'CIMA — Centro de Innovación Multimedia y Artística', 483, 237],
    ['emblem', 'CIMA', 276, 287],
    ['cimaxis', 'CIMAxis', 1149, 217],
  ] as const)('renderiza la variante oficial %s con dimensiones y texto accesible', (variant, alt, width, height) => {
    const markup = renderToStaticMarkup(<CimaLogo variant={variant} />)
    expect(markup).toContain(`alt="${alt}"`)
    expect(markup).toContain(`width="${width}"`)
    expect(markup).toContain(`height="${height}"`)
    expect(markup).toContain('.png')
    expect(markup).not.toContain('<svg')
  })

  it('integra el logo transparente sin superficies y conserva el ancho solicitado', () => {
    const markup = renderToStaticMarkup(<CimaLogo variant="cimaxis" width={120} />)
    expect(markup).not.toContain('bg-')
    expect(markup).toContain('width:120px')
    expect(markup).toContain('max-w-full')
    expect(markup).toContain('dark:brightness-0 dark:invert')
  })

  it('utiliza el negativo de la imagen original en superficies oscuras', () => {
    const markup = renderToStaticMarkup(<CimaLogo variant="cimaxis" tone="inverse" />)
    expect(markup).toContain('brightness-0 invert')
    expect(markup).not.toContain('bg-')
  })
})
