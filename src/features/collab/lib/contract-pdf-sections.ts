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

export function drawContractBody(
  page: PDFPage,
  paragraphs: string[],
  startY: number,
  fonts: { regular: PDFFont; bold: PDFFont }
): number {
  let y = startY
  for (const rawParagraph of paragraphs) {
    const paragraph = rawParagraph.trim()
    if (!paragraph) {
      y -= 4
      continue
    }

    if (paragraph.startsWith('CONTRATO ') || paragraph.startsWith('OTROSÍ ')) {
      page.drawText(paragraph, {
        x: MARGIN_X,
        y,
        size: 9.2,
        font: fonts.bold,
        color: TEXT_DARK,
        maxWidth: CONTENT_WIDTH,
      })
      y -= 14
      continue
    }

    if (paragraph.startsWith('Proyecto:')) {
      page.drawText(paragraph.toUpperCase(), {
        x: MARGIN_X,
        y,
        size: 7.6,
        font: fonts.bold,
        color: CIMA_RED,
      })
      y -= 11
      continue
    }

    const isHeading =
      paragraph.startsWith('CLÁUSULA ') ||
      paragraph.startsWith('PARÁGRAFO ') ||
      paragraph.startsWith('Condiciones ')

    const font = isHeading ? fonts.bold : fonts.regular
    const size = isHeading ? 7.8 : 7.3
    const color = isHeading ? CIMA_RED : TEXT_DARK
    const lineHeight = isHeading ? 10.2 : 9.6

    const lines = wrapText(paragraph, font, size, CONTENT_WIDTH)
    for (const line of lines) {
      page.drawText(line, { x: MARGIN_X, y, size, font, color })
      y -= lineHeight
    }
    y -= isHeading ? 2 : 4
  }
  return y
}

export function drawDualSignatures(
  page: PDFPage,
  options: DualSignaturesOptions
): void {
  const { signature, client, provider, startY, fonts } = options
  const boxHeight = 74
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
    y: startY - 10,
    size: 6.6,
    font: fonts.bold,
    color: CIMA_RED,
  })

  // Firma Cliente (Izquierda)
  const clientX = MARGIN_X + 12
  page.drawImage(signature, { x: clientX, y: startY - 42, width: 100, height: 26 })
  page.drawLine({
    start: { x: clientX, y: startY - 45 },
    end: { x: clientX + 200, y: startY - 45 },
    thickness: 0.6,
    color: TEXT_DARK,
  })
  page.drawText(`Firma: ${client.name}`, {
    x: clientX,
    y: startY - 54,
    size: 6.8,
    font: fonts.bold,
    maxWidth: 200,
  })
  page.drawText(`Cliente · ${client.email}`, {
    x: clientX,
    y: startY - 63,
    size: 6.2,
    font: fonts.regular,
    color: TEXT_MUTED,
    maxWidth: 200,
  })

  // Firma Prestador (Derecha)
  const providerX = PAGE_WIDTH - MARGIN_X - 212
  page.drawText('CERTIFICACIÓN ELECTRÓNICA DE PRESTADOR', {
    x: providerX,
    y: startY - 32,
    size: 6,
    font: fonts.bold,
    color: CIMA_GOLD,
  })
  page.drawLine({
    start: { x: providerX, y: startY - 45 },
    end: { x: providerX + 200, y: startY - 45 },
    thickness: 0.6,
    color: TEXT_DARK,
  })
  page.drawText(provider.representative || provider.name, {
    x: providerX,
    y: startY - 54,
    size: 6.8,
    font: fonts.bold,
    maxWidth: 200,
  })
  const provDetails = [provider.name, provider.taxId ? `NIT ${provider.taxId}` : null]
    .filter(Boolean)
    .join(' · ')
  page.drawText(provDetails, {
    x: providerX,
    y: startY - 63,
    size: 6.2,
    font: fonts.regular,
    color: TEXT_MUTED,
    maxWidth: 200,
  })
}

export function drawSinglePageFooter(
  page: PDFPage,
  options: SinglePageFooterOptions
): void {
  const { signedAt, hash, docType, font } = options
  page.drawLine({
    start: { x: MARGIN_X, y: 26 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: 26 },
    thickness: 0.5,
    color: LINE_GRAY,
  })

  const formattedDate = new Date(signedAt).toLocaleString('es-CO')
  const footerText =
    `${docType} firmado electrónicamente el ${formattedDate} · ` +
    `SHA-256: ${hash} · Página 1 de 1 (Hoja Oficial CIMA)`

  page.drawText(footerText, {
    x: MARGIN_X,
    y: 16,
    size: 5.6,
    font,
    color: TEXT_MUTED,
    maxWidth: CONTENT_WIDTH,
  })
}
