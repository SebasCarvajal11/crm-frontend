import { describe, expect, it } from 'vitest'
import { formatAnimatedValue, parseNumericValue } from './number-parser'

describe('number-parser', () => {
  it('parses raw numbers', () => {
    const parsed = parseNumericValue(150)
    expect(parsed.isNumeric).toBe(true)
    expect(parsed.target).toBe(150)
    expect(parsed.prefix).toBe('')
    expect(parsed.suffix).toBe('')
    expect(parsed.decimals).toBe(0)
    expect(formatAnimatedValue(150, parsed)).toBe('150')
  })

  it('parses percentage strings', () => {
    const parsed = parseNumericValue('85%')
    expect(parsed.isNumeric).toBe(true)
    expect(parsed.target).toBe(85)
    expect(parsed.suffix).toBe('%')
    expect(formatAnimatedValue(42.5, parsed)).toBe('43%')
    expect(formatAnimatedValue(85, parsed)).toBe('85%')
  })

  it('parses strings with decimals and prefixes', () => {
    const parsed = parseNumericValue('+12.5%')
    expect(parsed.isNumeric).toBe(true)
    expect(parsed.target).toBe(12.5)
    expect(parsed.hasExplicitPlus).toBe(true)
    expect(parsed.suffix).toBe('%')
    expect(parsed.decimals).toBe(1)
    expect(formatAnimatedValue(6.25, parsed)).toBe('+6.3%')
    expect(formatAnimatedValue(12.5, parsed)).toBe('+12.5%')
    // No debe generar artefactos de doble signo (-+) al interpolar valores negativos
    expect(formatAnimatedValue(-5, parsed)).toBe('-5.0%')
  })

  it('parses currency with thousands separators (comma and period)', () => {
    const usCurrency = parseNumericValue('$1,250.50')
    expect(usCurrency.isNumeric).toBe(true)
    expect(usCurrency.target).toBe(1250.5)
    expect(usCurrency.prefix).toBe('$')
    expect(usCurrency.thousandsSeparator).toBe(',')
    expect(usCurrency.decimalSeparator).toBe('.')
    expect(formatAnimatedValue(1250.5, usCurrency)).toBe('$1,250.50')

    const copCurrency = parseNumericValue('$ 1.250.000')
    expect(copCurrency.isNumeric).toBe(true)
    expect(copCurrency.target).toBe(1250000)
    expect(copCurrency.prefix).toBe('$ ')
    expect(copCurrency.thousandsSeparator).toBe('.')
    expect(copCurrency.decimals).toBe(0)
    expect(formatAnimatedValue(600000, copCurrency)).toBe('$ 600.000')
    expect(formatAnimatedValue(1250000, copCurrency)).toBe('$ 1.250.000')
  })

  it('parses negative currency with sign outside or inside symbol and avoids negative zero', () => {
    const negOutside = parseNumericValue('-$1,250.50')
    expect(negOutside.isNumeric).toBe(true)
    expect(negOutside.target).toBe(-1250.5)
    expect(negOutside.prefix).toBe('$')
    expect(formatAnimatedValue(-1250.5, negOutside)).toBe('-$1,250.50')
    // Cero debe formatearse sin signo negativo residual
    expect(formatAnimatedValue(0, negOutside)).toBe('$0.00')

    const negInside = parseNumericValue('$-500')
    expect(negInside.isNumeric).toBe(true)
    expect(negInside.target).toBe(-500)
    expect(formatAnimatedValue(-500, negInside)).toBe('-$500')

    // Prevención de cero negativo en redondeos cercanos a cero
    const nearZero = parseNumericValue('-0.04', { decimals: 0 })
    expect(formatAnimatedValue(-0.04, nearZero)).toBe('0')
  })

  it('parses leading decimal points correctly', () => {
    const leadingDot = parseNumericValue('.75')
    expect(leadingDot.isNumeric).toBe(true)
    expect(leadingDot.target).toBe(0.75)
    expect(leadingDot.decimals).toBe(2)
    expect(formatAnimatedValue(0.75, leadingDot)).toBe('0.75')

    const dollarDot = parseNumericValue('$.50')
    expect(dollarDot.isNumeric).toBe(true)
    expect(dollarDot.target).toBe(0.5)
    expect(dollarDot.prefix).toBe('$')
  })

  it('parses suffix words like días and ms', () => {
    const days = parseNumericValue('14 días')
    expect(days.isNumeric).toBe(true)
    expect(days.target).toBe(14)
    expect(days.suffix).toBe(' días')
    expect(formatAnimatedValue(7, days)).toBe('7 días')

    const latency = parseNumericValue('320 ms')
    expect(latency.isNumeric).toBe(true)
    expect(latency.target).toBe(320)
    expect(latency.suffix).toBe(' ms')
    expect(formatAnimatedValue(320, latency)).toBe('320 ms')
  })

  it('gracefully returns isNumeric false for non-numeric inputs', () => {
    const nonNum = parseNumericValue('Activo')
    expect(nonNum.isNumeric).toBe(false)
    expect(formatAnimatedValue(0, nonNum)).toBe('Activo')

    const empty = parseNumericValue('')
    expect(empty.isNumeric).toBe(false)

    const dash = parseNumericValue('—')
    expect(dash.isNumeric).toBe(false)
  })
})
