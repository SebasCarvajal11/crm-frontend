import {
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from 'pdf-lib'
import {
  MARGIN_X,
  PAGE_WIDTH,
  CONTENT_WIDTH,
  CIMA_RED,
  CIMA_GOLD,
  TEXT_DARK,
  TEXT_MUTED,
  LINE_GRAY,
  wrapText,
} from './contract-pdf-layout'

export type DualSignaturesOptions = {
  signature: PDFImage
  client: { name: string; email: string }
  provider: { name: string; representative?: string | null; taxId?: string | null }
  startY: number
  fonts: { regular: PDFFont; bold: PDFFont }
}

export type SinglePageFooterOptions = {
  signedAt: string
  hash: string
  docType: string
  font: PDFFont
}

/**
 * Calibra la escala tipográfica según estándares legales internacionales
 * (Typography for Lawyers: base 9.5 - 10.5 pt con leading 1.2x - 1.25x),
 * adaptando suavemente en contratos extensos para garantizar 1 sola página.
 */
function resolveScale(totalChars: number): {
  titleSize: number
  headingSize: number
  headingLineHeight: number
  bodySize: number
  bodyLineHeight: number
  gap: number
} {
  if (totalChars > 2600) {
    // Caso límite ultra-extenso
    return {
      titleSize: 9.5,
      headingSize: 8.2,
      headingLineHeight: 10.2,
      bodySize: 7.5,
      bodyLineHeight: 9.4,
      gap: 2.5,
    }
  }
  if (totalChars > 1900) {
    // Contrato medio extenso
    return {
      titleSize: 10.5,
      headingSize: 9.0,
      headingLineHeight: 11.4,
      bodySize: 8.5,
      bodyLineHeight: 10.8,
      gap: 3.5,
    }
  }
  // Estándar óptimo de legibilidad legal (base 9.5 - 10 pt)
  return {
    titleSize: 11.2,
    headingSize: 9.8,
    headingLineHeight: 12.6,
    bodySize: 9.2,
    bodyLineHeight: 11.8,
    gap: 4.5,
  }
}

export function drawContractBody(
  page: PDFPage,
  paragraphs: string[],
  startY: number,
  fonts: { regular: PDFFont; bold: PDFFont }
): number {
  const totalChars = paragraphs.reduce((acc, p) => acc + p.length, 0)
  const scale = resolveScale(totalChars)
  let y = startY

  for (const rawParagraph of paragraphs) {
    const paragraph = rawParagraph.trim()
    if (!paragraph) {
      y -= scale.gap
      continue
    }

    if (paragraph.startsWith('CONTRATO ') || paragraph.startsWith('OTROSÍ ')) {
      page.drawText(paragraph, {
        x: MARGIN_X,
        y,
        size: scale.titleSize,
        font: fonts.bold,
        color: TEXT_DARK,
        maxWidth: CONTENT_WIDTH,
      })
      y -= scale.headingLineHeight + 3
      continue
    }

    if (paragraph.startsWith('Proyecto:')) {
      page.drawText(paragraph.toUpperCase(), {
        x: MARGIN_X,
        y,
        size: scale.headingSize - 0.5,
        font: fonts.bold,
        color: CIMA_RED,
      })
      y -= scale.headingLineHeight
      continue
    }

    const isHeading =
      paragraph.startsWith('CLÁUSULA ') ||
      paragraph.startsWith('PARÁGRAFO ') ||
      paragraph.startsWith('Condiciones ')

    const font = isHeading ? fonts.bold : fonts.regular
    const size = isHeading ? scale.headingSize : scale.bodySize
    const color = isHeading ? CIMA_RED : TEXT_DARK
    const lineHeight = isHeading ? scale.headingLineHeight : scale.bodyLineHeight

    const lines = wrapText(paragraph, font, size, CONTENT_WIDTH)
    for (const line of lines) {
      page.drawText(line, { x: MARGIN_X, y, size, font, color })
      y -= lineHeight
    }
    y -= scale.gap
  }
  return y
}

export function drawDualSignatures(
  page: PDFPage,
  options: DualSignaturesOptions
): void {
  const { signature, client, provider, startY, fonts } = options
  const boxHeight = 68
  const boxY = startY - boxHeight

  page.drawRectangle({
    x: MARGIN_X,
    y: boxY,
    width: CONTENT_WIDTH,
    height: boxHeight,
    borderColor: LINE_GRAY,
    borderWidth: 0.6,
    color: rgb(0.99, 0.99, 0.99),
  })

  page.drawText('FIRMAS Y CONSTANCIA DE CONSENTIMIENTO DIGITAL (LEY 527 DE 1999)', {
    x: MARGIN_X + 10,
    y: startY - 9,
    size: 6.5,
    font: fonts.bold,
    color: CIMA_RED,
  })

  // Firma Cliente (Izquierda)
  const clientX = MARGIN_X + 12
  page.drawImage(signature, { x: clientX, y: startY - 38, width: 95, height: 25 })
  page.drawLine({
    start: { x: clientX, y: startY - 41 },
    end: { x: clientX + 195, y: startY - 41 },
    thickness: 0.6,
    color: TEXT_DARK,
  })
  page.drawText(`Firma: ${client.name}`, {
    x: clientX,
    y: startY - 50,
    size: 7.2,
    font: fonts.bold,
    maxWidth: 195,
  })
  page.drawText(`Cliente · ${client.email}`, {
    x: clientX,
    y: startY - 59,
    size: 6.4,
    font: fonts.regular,
    color: TEXT_MUTED,
    maxWidth: 195,
  })

  // Firma Prestador (Derecha)
  const providerX = PAGE_WIDTH - MARGIN_X - 208
  page.drawText('CERTIFICACIÓN ELECTRÓNICA DE PRESTADOR', {
    x: providerX,
    y: startY - 29,
    size: 6.2,
    font: fonts.bold,
    color: CIMA_GOLD,
  })
  page.drawLine({
    start: { x: providerX, y: startY - 41 },
    end: { x: providerX + 195, y: startY - 41 },
    thickness: 0.6,
    color: TEXT_DARK,
  })
  page.drawText(provider.representative || provider.name, {
    x: providerX,
    y: startY - 50,
    size: 7.2,
    font: fonts.bold,
    maxWidth: 195,
  })
  const provDetails = [provider.name, provider.taxId ? `NIT ${provider.taxId}` : null]
    .filter(Boolean)
    .join(' · ')
  page.drawText(provDetails, {
    x: providerX,
    y: startY - 59,
    size: 6.4,
    font: fonts.regular,
    color: TEXT_MUTED,
    maxWidth: 195,
  })
}

export function drawSinglePageFooter(
  page: PDFPage,
  options: SinglePageFooterOptions
): void {
  const { signedAt, hash, docType, font } = options
  page.drawLine({
    start: { x: MARGIN_X, y: 24 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: 24 },
    thickness: 0.5,
    color: LINE_GRAY,
  })

  const formattedDate = new Date(signedAt).toLocaleString('es-CO')
  const footerText =
    `${docType} firmado electrónicamente el ${formattedDate} · ` +
    `SHA-256: ${hash} · Página 1 de 1 (Hoja Oficial CIMA)`

  page.drawText(footerText, {
    x: MARGIN_X,
    y: 15,
    size: 5.6,
    font,
    color: TEXT_MUTED,
    maxWidth: CONTENT_WIDTH,
  })
}
