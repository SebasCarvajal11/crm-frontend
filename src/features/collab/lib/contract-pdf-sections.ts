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

function resolveScale(totalChars: number): {
  headingSize: number
  headingLineHeight: number
  bodySize: number
  bodyLineHeight: number
  gap: number
} {
  if (totalChars > 2600) {
    return {
      headingSize: 7.0,
      headingLineHeight: 8.8,
      bodySize: 6.4,
      bodyLineHeight: 8.0,
      gap: 2.2,
    }
  }
  if (totalChars > 1800) {
    return {
      headingSize: 7.3,
      headingLineHeight: 9.2,
      bodySize: 6.7,
      bodyLineHeight: 8.6,
      gap: 3.2,
    }
  }
  return {
    headingSize: 7.6,
    headingLineHeight: 9.8,
    bodySize: 7.0,
    bodyLineHeight: 9.2,
    gap: 4.0,
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
        size: scale.headingSize + 1.2,
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
        size: scale.headingSize,
        font: fonts.bold,
        color: CIMA_RED,
      })
      y -= scale.headingLineHeight + 1
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
    size: 6.2,
    font: fonts.bold,
    color: CIMA_RED,
  })

  // Firma Cliente (Izquierda)
  const clientX = MARGIN_X + 12
  page.drawImage(signature, { x: clientX, y: startY - 38, width: 90, height: 24 })
  page.drawLine({
    start: { x: clientX, y: startY - 41 },
    end: { x: clientX + 190, y: startY - 41 },
    thickness: 0.6,
    color: TEXT_DARK,
  })
  page.drawText(`Firma: ${client.name}`, {
    x: clientX,
    y: startY - 49,
    size: 6.5,
    font: fonts.bold,
    maxWidth: 190,
  })
  page.drawText(`Cliente · ${client.email}`, {
    x: clientX,
    y: startY - 58,
    size: 5.8,
    font: fonts.regular,
    color: TEXT_MUTED,
    maxWidth: 190,
  })

  // Firma Prestador (Derecha)
  const providerX = PAGE_WIDTH - MARGIN_X - 202
  page.drawText('CERTIFICACIÓN ELECTRÓNICA DE PRESTADOR', {
    x: providerX,
    y: startY - 29,
    size: 5.8,
    font: fonts.bold,
    color: CIMA_GOLD,
  })
  page.drawLine({
    start: { x: providerX, y: startY - 41 },
    end: { x: providerX + 190, y: startY - 41 },
    thickness: 0.6,
    color: TEXT_DARK,
  })
  page.drawText(provider.representative || provider.name, {
    x: providerX,
    y: startY - 49,
    size: 6.5,
    font: fonts.bold,
    maxWidth: 190,
  })
  const provDetails = [provider.name, provider.taxId ? `NIT ${provider.taxId}` : null]
    .filter(Boolean)
    .join(' · ')
  page.drawText(provDetails, {
    x: providerX,
    y: startY - 58,
    size: 5.8,
    font: fonts.regular,
    color: TEXT_MUTED,
    maxWidth: 190,
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
    size: 5.4,
    font,
    color: TEXT_MUTED,
    maxWidth: CONTENT_WIDTH,
  })
}
