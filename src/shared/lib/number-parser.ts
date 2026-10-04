export interface ParsedNumericSpec {
  isNumeric: boolean
  target: number
  prefix: string
  suffix: string
  decimals: number
  thousandsSeparator: string
  decimalSeparator: string
  hasExplicitPlus?: boolean
  raw: unknown
}

export interface ParseOptions {
  prefix?: string
  suffix?: string
  decimals?: number
  thousandsSeparator?: string
  decimalSeparator?: string
  hasExplicitPlus?: boolean
}

interface SeparatorInfo {
  thousandsSeparator: string
  decimalSeparator: string
  decimals: number
  cleaned: string
}

function parseMixedSeparators(body: string): SeparatorInfo {
  const commaIndex = body.lastIndexOf(',')
  const dotIndex = body.lastIndexOf('.')
  if (dotIndex > commaIndex) {
    return {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      decimals: body.length - dotIndex - 1,
      cleaned: body.replace(/,/g, ''),
    }
  }
  return {
    thousandsSeparator: '.',
    decimalSeparator: ',',
    decimals: body.length - commaIndex - 1,
    cleaned: body.replace(/\./g, '').replace(',', '.'),
  }
}

function parseSingleSeparator(body: string, sep: ',' | '.'): SeparatorInfo {
  const parts = body.split(sep)
  const last = parts[parts.length - 1]
  const isThousands = parts.length > 2 || (parts.length === 2 && last.length === 3 && parts[0].length <= 3)

  if (isThousands) {
    const cleaned = sep === ',' ? body.replace(/,/g, '') : body.replace(/\./g, '')
    const thousandsSeparator = sep
    const decimalSeparator = sep === ',' ? '.' : ','
    return { thousandsSeparator, decimalSeparator, decimals: 0, cleaned }
  }

  const cleaned = sep === ',' ? body.replace(',', '.') : body
  return { thousandsSeparator: '', decimalSeparator: sep, decimals: last.length, cleaned }
}

function parseSeparators(body: string): SeparatorInfo {
  const hasComma = body.includes(',')
  const hasDot = body.includes('.')

  if (hasComma && hasDot) return parseMixedSeparators(body)
  if (hasComma) return parseSingleSeparator(body, ',')
  if (hasDot) return parseSingleSeparator(body, '.')
  return { thousandsSeparator: '', decimalSeparator: '.', decimals: 0, cleaned: body }
}

function splitPrefixNumberSuffix(trimmed: string) {
  const match = trimmed.match(/^([+\-\u2212]?)(.*?)([+\-\u2212]?)((?:\d+(?:[\d.,]*\d+)?|[.,]\d+))(.*)$/)
  if (!match) return null

  const [, leadingSign, rawPrefix, innerSign, numBody, rawSuffix] = match
  const signChar = leadingSign || innerSign
  const isNegative = signChar === '-' || signChar === '\u2212'
  const hasExplicitPlus = signChar === '+'
  const prefix = leadingSign ? rawPrefix.trimStart() : rawPrefix

  return { prefix, isNegative, hasExplicitPlus, numBody, suffix: rawSuffix }
}

function parseNumericString(str: string, options: ParseOptions = {}): ParsedNumericSpec {
  const split = splitPrefixNumberSuffix(str.trim())
  if (!split) {
    return { isNumeric: false, target: 0, prefix: '', suffix: '', decimals: 0,
      thousandsSeparator: '', decimalSeparator: '.', raw: str }
  }

  const { prefix: rawPrefix, isNegative, hasExplicitPlus, numBody, suffix: rawSuffix } = split
  const info = parseSeparators(numBody)
  const parsedFloat = parseFloat(info.cleaned)

  if (Number.isNaN(parsedFloat) || !Number.isFinite(parsedFloat)) {
    return { isNumeric: false, target: 0, prefix: '', suffix: '', decimals: 0,
      thousandsSeparator: '', decimalSeparator: '.', raw: str }
  }

  const target = isNegative ? -parsedFloat : parsedFloat

  return {
    isNumeric: true,
    target,
    prefix: options.prefix ?? rawPrefix,
    suffix: options.suffix ?? rawSuffix,
    decimals: options.decimals ?? info.decimals,
    thousandsSeparator: options.thousandsSeparator ?? info.thousandsSeparator,
    decimalSeparator: options.decimalSeparator ?? info.decimalSeparator,
    hasExplicitPlus: options.hasExplicitPlus ?? hasExplicitPlus,
    raw: str,
  }
}

export function parseNumericValue(raw: unknown, options: ParseOptions = {}): ParsedNumericSpec {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) {
      return { isNumeric: false, target: 0, prefix: '', suffix: '', decimals: 0,
        thousandsSeparator: '', decimalSeparator: '.', raw }
    }
    const str = raw.toString()
    const inferredDecimals = str.includes('.') ? (str.split('.')[1]?.length ?? 0) : 0
    return {
      isNumeric: true,
      target: raw,
      prefix: options.prefix ?? '',
      suffix: options.suffix ?? '',
      decimals: options.decimals ?? inferredDecimals,
      thousandsSeparator: options.thousandsSeparator ?? '',
      decimalSeparator: options.decimalSeparator ?? '.',
      hasExplicitPlus: options.hasExplicitPlus,
      raw,
    }
  }

  if (typeof raw === 'string') {
    return parseNumericString(raw, options)
  }

  return {
    isNumeric: false,
    target: 0,
    prefix: '',
    suffix: '',
    decimals: 0,
    thousandsSeparator: '',
    decimalSeparator: '.',
    raw,
  }
}

export function formatAnimatedValue(value: number, spec: ParsedNumericSpec): string {
  if (!spec.isNumeric) return String(spec.raw ?? '')

  const absValue = Math.abs(value)
  const decimals = Math.max(0, spec.decimals)
  const factor = Math.pow(10, decimals)
  const rounded = Math.round(absValue * factor) / factor
  const fixedStr = rounded.toFixed(decimals)
  const [intStr, fracStr] = fixedStr.split('.')

  const formattedInt = spec.thousandsSeparator
    ? intStr.replace(/\B(?=(\d{3})+(?!\d))/g, spec.thousandsSeparator)
    : intStr

  const numBody = decimals > 0 && fracStr
    ? `${formattedInt}${spec.decimalSeparator}${fracStr}`
    : formattedInt

  const isNeg = value < 0 && rounded > 0
  const showPlus = !isNeg && Boolean(spec.hasExplicitPlus) && rounded > 0
  const sign = isNeg ? '-' : showPlus ? '+' : ''

  return `${sign}${spec.prefix}${numBody}${spec.suffix}`
}
