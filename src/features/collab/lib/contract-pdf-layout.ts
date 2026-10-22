import {
  degrees,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from 'pdf-lib'

// Estándar internacional A4 (210 x 297 mm = 595.28 x 841.89 pt)
export const PAGE_WIDTH = 595
export const PAGE_HEIGHT = 842
export const MARGIN_X = 34
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2 // 527 pt

export const CIMA_RED = rgb(0.525, 0.027, 0.047) // #86070c
export const CIMA_GOLD = rgb(0.83, 0.64, 0.45) // #d4a373
export const TEXT_DARK = rgb(0.12, 0.14, 0.18) // #1f2937
export const TEXT_MUTED = rgb(0.42, 0.45, 0.50) // #6b7280
export const LINE_GRAY = rgb(0.82, 0.84, 0.88)

export type MembreteOptions = {
  logo?: PDFImage | null
  subtitle?: string
}

export function drawBackgroundTexture(page: PDFPage, texture: PDFImage | null): void {
  if (!texture) return
  page.drawImage(texture, {
    x: PAGE_WIDTH,
    y: 0,
    width: PAGE_HEIGHT,
    height: PAGE_WIDTH,
    rotate: degrees(90),
    opacity: 0.065,
  })
}

export function drawMembrete(
  page: PDFPage,
  fonts: { bold: PDFFont; regular: PDFFont },
  options: MembreteOptions = {}
): number {
  const topY = PAGE_HEIGHT - 28
  const { logo = null, subtitle = 'CONTRATO OFICIAL DE PRESTACIÓN DE SERVICIOS' } = options

  if (logo) {
    page.drawImage(logo, {
      x: MARGIN_X,
      y: topY - 28,
      width: 27,
      height: 28,
    })
  }

  const textStartX = logo ? MARGIN_X + 34 : MARGIN_X

  page.drawText('CIMA DIGITAL WORKSPACE', {
    x: textStartX,
    y: topY - 10,
    size: 10.5,
    font: fonts.bold,
    color: CIMA_RED,
  })

  page.drawText(subtitle, {
    x: textStartX,
    y: topY - 20,
    size: 6.8,
    font: fonts.regular,
    color: TEXT_MUTED,
  })

  // Sello legal superior derecho
  const badgeText = 'VALIDEZ ELECTRÓNICA · LEY 527 DE 1999'
  const badgeWidth = fonts.regular.widthOfTextAtSize(badgeText, 6.2) + 10
  const badgeX = PAGE_WIDTH - MARGIN_X - badgeWidth
  page.drawRectangle({
    x: badgeX,
    y: topY - 19,
    width: badgeWidth,
    height: 13,
    borderColor: CIMA_RED,
    borderWidth: 0.6,
    color: rgb(0.98, 0.95, 0.95),
  })
  page.drawText(badgeText, {
    x: badgeX + 5,
    y: topY - 14.5,
    size: 6.2,
    font: fonts.bold,
    color: CIMA_RED,
  })

  // Filete divisor doble institucional
  const lineY = topY - 33
  page.drawLine({
    start: { x: MARGIN_X, y: lineY },
    end: { x: PAGE_WIDTH - MARGIN_X, y: lineY },
    thickness: 1.1,
    color: CIMA_RED,
  })
  page.drawLine({
    start: { x: MARGIN_X, y: lineY - 2 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: lineY - 2 },
    thickness: 0.5,
    color: CIMA_GOLD,
  })

  return lineY - 10
}

export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate
      continue
    }
    if (line) lines.push(line)
    line = word
  }
  if (line) lines.push(line)
  return lines
}
