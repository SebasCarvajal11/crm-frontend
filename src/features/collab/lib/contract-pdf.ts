import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { ProjectContract, ProjectContractAmendment } from '@/features/collab/model'

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 48
const BODY_SIZE = 9
const LINE_HEIGHT = 13.5

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const encoded = dataUrl.split(',', 2)[1]
  if (!encoded) throw new Error('La firma no contiene datos PNG válidos.')
  return Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0))
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

function triggerBrowserDownload(pdfBytes: Uint8Array, filename: string) {
  const browserBytes = new Uint8Array(pdfBytes.length)
  browserBytes.set(pdfBytes)
  const blob = new Blob([browserBytes.buffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.style.display = 'none'
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  setTimeout(() => {
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, 1000)
}

function drawHeader(page: PDFPage, bold: PDFFont, subtitle = 'CONTRATO DIGITAL') {
  page.drawText(`CIMA · ${subtitle}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - MARGIN,
    size: 10,
    font: bold,
    color: rgb(0.53, 0.04, 0.05),
  })
  page.drawLine({
    start: { x: MARGIN, y: PAGE_HEIGHT - MARGIN - 8 },
    end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - MARGIN - 8 },
    thickness: 1,
    color: rgb(0.65, 0.12, 0.1),
  })
}

function drawParagraphsOnPage(
  page: PDFPage,
  paragraphs: string[],
  startY: number,
  regular: PDFFont,
  bold: PDFFont,
): number {
  let y = startY
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim()
    if (!paragraph) {
      y -= 4
      continue
    }

    const isTitle = paragraph.startsWith('CONTRATO ') || paragraph.startsWith('OTROSÍ ')
    if (isTitle) {
      page.drawText(paragraph, {
        x: MARGIN,
        y,
        size: 11,
        font: bold,
        color: rgb(0.06, 0.06, 0.06),
        maxWidth: PAGE_WIDTH - MARGIN * 2,
      })
      y -= 16
      continue
    }

    const isHeading =
      paragraph.startsWith('Proyecto:') ||
      paragraph.startsWith('Vinculado al') ||
      paragraph.startsWith('CLÁUSULA ') ||
      paragraph.startsWith('PARÁGRAFO ') ||
      paragraph.startsWith('Condiciones ')

    const font = isHeading ? bold : regular
    const size = isHeading ? 9.5 : BODY_SIZE
    const lines = wrap(paragraph, font, size, PAGE_WIDTH - MARGIN * 2)
    for (const line of lines) {
      page.drawText(line, { x: MARGIN, y, size, font, color: rgb(0.06, 0.06, 0.06) })
      y -= LINE_HEIGHT
    }
    y -= 4
  }
  return y
}

function drawSignatureSection(
  page: PDFPage,
  signature: Awaited<ReturnType<PDFDocument['embedPng']>>,
  signerName: string,
  clientSubtext: string,
  providerName: string,
  providerRepresentative: string,
  y: number,
  regular: PDFFont,
  bold: PDFFont,
) {
  page.drawText('FIRMAS Y CONSTANCIA ELECTRÓNICA (LEY 527 DE 1999)', {
    x: MARGIN,
    y: y - 2,
    size: 8.5,
    font: bold,
    color: rgb(0.53, 0.04, 0.05),
  })

  // Firma del Cliente
  page.drawImage(signature, { x: MARGIN, y: y - 46, width: 150, height: 36 })
  page.drawLine({
    start: { x: MARGIN, y: y - 50 },
    end: { x: MARGIN + 190, y: y - 50 },
    thickness: 0.7,
    color: rgb(0, 0, 0),
  })
  page.drawText(`Firma: ${signerName}`, {
    x: MARGIN,
    y: y - 62,
    size: 8,
    font: regular,
    maxWidth: 190,
  })
  page.drawText(`Cliente · ${clientSubtext}`, {
    x: MARGIN,
    y: y - 73,
    size: 7.5,
    font: regular,
    maxWidth: 190,
  })

  // Firma del Prestador
  const providerX = PAGE_WIDTH - MARGIN - 190
  page.drawLine({
    start: { x: providerX, y: y - 50 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 50 },
    thickness: 0.7,
    color: rgb(0, 0, 0),
  })
  page.drawText(providerRepresentative || providerName, {
    x: providerX,
    y: y - 62,
    size: 8,
    font: regular,
    maxWidth: 190,
  })
  page.drawText(providerName, {
    x: providerX,
    y: y - 73,
    size: 7.5,
    font: regular,
    maxWidth: 190,
  })
}

function drawFooters(
  pages: PDFPage[],
  signedAt: string,
  hash: string,
  docType: string,
  regular: PDFFont,
) {
  pages.forEach((pdfPage, index) => {
    const formattedDate = new Date(signedAt).toLocaleString('es-CO')
    const footer = `${docType} firmado electrónicamente el ${formattedDate} · SHA-256 ${hash} · Página ${index + 1}/${pages.length}`
    pdfPage.drawText(footer, {
      x: MARGIN,
      y: 20,
      size: 6.5,
      font: regular,
      color: rgb(0.35, 0.35, 0.35),
      maxWidth: PAGE_WIDTH - MARGIN * 2,
    })
  })
}

export async function downloadSignedContractPdf(contract: ProjectContract, projectName: string) {
  if (!contract.contentSnapshot || !contract.signatureDataUrl || !contract.signedAt) {
    throw new Error('El contrato debe estar firmado antes de generar el PDF.')
  }

  const document = await PDFDocument.create()
  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const signature = await document.embedPng(dataUrlToBytes(contract.signatureDataUrl))

  const allParagraphs = contract.contentSnapshot.split('\n')
  const cuartaIndex = allParagraphs.findIndex((p) => p.trim().startsWith('CLÁUSULA CUARTA'))

  const p1List = cuartaIndex !== -1 ? allParagraphs.slice(0, cuartaIndex) : allParagraphs
  const p2List = cuartaIndex !== -1 ? allParagraphs.slice(cuartaIndex) : []

  // Página 1: Cláusulas 1 a 3
  const page1 = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  drawHeader(page1, bold, 'CONTRATO DIGITAL')
  drawParagraphsOnPage(page1, p1List, PAGE_HEIGHT - MARGIN - 28, regular, bold)

  // Página 2: Cláusulas 4 a 7 + Aceptación + Firmas
  const page2 = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  drawHeader(page2, bold, 'CONTRATO DIGITAL (CONTINUACIÓN)')
  const endY2 = drawParagraphsOnPage(page2, p2List, PAGE_HEIGHT - MARGIN - 28, regular, bold)

  drawSignatureSection(
    page2,
    signature,
    contract.signerName ?? contract.clientName,
    contract.clientEmail,
    contract.providerName,
    contract.providerRepresentative ?? '',
    endY2 - 14,
    regular,
    bold,
  )

  drawFooters(document.getPages(), contract.signedAt, contract.contentHash ?? 'N/D', 'Contrato', regular)

  const pdfBytes = await document.save()
  const cleanProject = projectName.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
  triggerBrowserDownload(pdfBytes, `contrato_${cleanProject}_${contract.id.slice(0, 8)}.pdf`)
}

export async function downloadSignedAmendmentPdf(
  amendment: ProjectContractAmendment,
  contract: ProjectContract,
  projectName: string,
) {
  if (!amendment.contentSnapshot || !amendment.signatureDataUrl || !amendment.signedAt) {
    throw new Error('El Otrosí debe estar firmado antes de generar el PDF.')
  }

  const document = await PDFDocument.create()
  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const signature = await document.embedPng(dataUrlToBytes(amendment.signatureDataUrl))

  const allParagraphs = amendment.contentSnapshot.split('\n')
  const numStr = amendment.amendmentNumber.toString().padStart(2, '0')

  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  drawHeader(page, bold, `OTROSÍ N° ${numStr} AL CONTRATO`)
  const endY = drawParagraphsOnPage(page, allParagraphs, PAGE_HEIGHT - MARGIN - 28, regular, bold)

  drawSignatureSection(
    page,
    signature,
    amendment.signerName ?? contract.clientName,
    contract.clientEmail,
    contract.providerName,
    contract.providerRepresentative ?? '',
    endY - 14,
    regular,
    bold,
  )

  drawFooters(
    document.getPages(),
    amendment.signedAt,
    amendment.contentHash ?? 'N/D',
    `Otrosí N° ${numStr}`,
    regular,
  )

  const pdfBytes = await document.save()
  const cleanProject = projectName.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
  triggerBrowserDownload(pdfBytes, `otrosi_${numStr}_${cleanProject}_${amendment.id.slice(0, 8)}.pdf`)
}
