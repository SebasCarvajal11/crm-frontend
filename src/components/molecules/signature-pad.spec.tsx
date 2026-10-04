import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SignaturePad } from './signature-pad'
import {
  calculateDistance,
  calculateVelocity,
  calculateTaperedStrokeWidth,
  MIN_STROKE_WIDTH,
  MAX_STROKE_WIDTH,
  DEFAULT_STROKE_WIDTH,
} from './signature-pad-math'

describe('SignaturePad Math (Dynamic Ink Tapering)', () => {
  it('calcula la distancia euclidiana correctamente entre dos puntos', () => {
    const dist = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })
    expect(dist).toBe(5)

    const zeroDist = calculateDistance({ x: 10, y: 10 }, { x: 10, y: 10 })
    expect(zeroDist).toBe(0)
  })

  it('calcula la velocidad en px/ms respetando el límite mínimo de delta time', () => {
    const p1 = { x: 0, y: 0, time: 1000 }
    const p2 = { x: 100, y: 0, time: 1100 }
    const velocity = calculateVelocity(p1, p2)
    expect(velocity).toBe(1) // 100px en 100ms = 1 px/ms

    // Cuando el delta time es muy bajo (<10ms), aplica piso de 10ms
    const rapidP2 = { x: 20, y: 0, time: 1002 }
    const clampedVelocity = calculateVelocity(p1, rapidP2)
    expect(clampedVelocity).toBe(2) // 20px / 10ms = 2 px/ms
  })

  it('modula el grosor inversamente a la velocidad (trazos rápidos son más delgados)', () => {
    const slowVelocity = 0.05
    const fastVelocity = 2.0

    const slowWidth = calculateTaperedStrokeWidth(slowVelocity, DEFAULT_STROKE_WIDTH)
    const fastWidth = calculateTaperedStrokeWidth(fastVelocity, DEFAULT_STROKE_WIDTH)

    expect(slowWidth).toBeGreaterThan(fastWidth)
    expect(fastWidth).toBeGreaterThanOrEqual(MIN_STROKE_WIDTH)
    expect(slowWidth).toBeLessThanOrEqual(MAX_STROKE_WIDTH)
  })

  it('respeta la presión del stylus aumentando el grosor en mayor contacto', () => {
    const velocity = 0.5
    const lightPressure = 0.2
    const heavyPressure = 0.9

    const lightWidth = calculateTaperedStrokeWidth(
      velocity,
      DEFAULT_STROKE_WIDTH,
      lightPressure
    )
    const heavyWidth = calculateTaperedStrokeWidth(
      velocity,
      DEFAULT_STROKE_WIDTH,
      heavyPressure
    )

    expect(heavyWidth).toBeGreaterThan(lightWidth)
  })

  it('garantiza que el grosor interpolado nunca supere los límites definidos', () => {
    const extremeFast = calculateTaperedStrokeWidth(100, MIN_STROKE_WIDTH)
    const extremeSlow = calculateTaperedStrokeWidth(0, MAX_STROKE_WIDTH)

    expect(extremeFast).toBeGreaterThanOrEqual(MIN_STROKE_WIDTH)
    expect(extremeSlow).toBeLessThanOrEqual(MAX_STROKE_WIDTH)
  })
})

describe('SignaturePad Component', () => {
  it('renderiza canvas con touch-none, placeholder y botón de limpieza', () => {
    const onChange = vi.fn()
    const markup = renderToStaticMarkup(<SignaturePad onChange={onChange} />)

    expect(markup).toContain('data-testid="signature-canvas"')
    expect(markup).toContain('touch-none')
    expect(markup).toContain('cursor-crosshair')
    expect(markup).toContain('Firme aquí con el dedo, lápiz digital o mouse')
    expect(markup).toContain('Limpiar firma')
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('tinta dinámica')
  })

  it('aplica clases personalizadas pasadas por className', () => {
    const markup = renderToStaticMarkup(
      <SignaturePad onChange={vi.fn()} className="custom-signature-pad-class" />
    )

    expect(markup).toContain('custom-signature-pad-class')
  })
})
