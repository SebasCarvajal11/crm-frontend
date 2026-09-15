import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { ProjectContract } from '@/features/collab/model'

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 48
const BODY_SIZE = 9.5
const LINE_HEIGHT = 14

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

function drawSignatureSection(
  page: PDFPage,
  signature: Awaited<ReturnType<PDFDocument['embedPng']>>,
  contract: ProjectContract,
  y: number,
  regular: PDFFont,
  bold: PDFFont,
) {
  page.drawText('FIRMAS Y CONSTANCIA ELECTRÓNICA', {
    x: MARGIN,
    y: y - 5,
    size: 9,
    font: bold,
    color: rgb(0.53, 0.04, 0.05),
  })

  // Firma del Cliente
  page.drawImage(signature, { x: MARGIN, y: y - 50, width: 160, height: 40 })
  page.drawLine({
    start: { x: MARGIN, y: y - 54 },
    end: { x: MARGIN + 190, y: y - 54 },
    thickness: 0.7,
    color: rgb(0, 0, 0),
  })
  page.drawText(`Firma: ${contract.signerName}`, {
    x: MARGIN,
    y: y - 66,
    size: 8,
    font: regular,
    maxWidth: 190,
  })
  page.drawText(`Cliente · ${contract.clientEmail}`, {
    x: MARGIN,
    y: y - 78,
    size: 8,
    font: regular,
    maxWidth: 190,
  })

  // Firma del Prestador
  const providerX = PAGE_WIDTH - MARGIN - 190
  page.drawLine({
    start: { x: providerX, y: y - 54 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 54 },
    thickness: 0.7,
    color: rgb(0, 0, 0),
  })
  page.drawText(contract.providerRepresentative || contract.providerName, {
    x: providerX,
    y: y - 66,
    size: 8,
    font: regular,
    maxWidth: 190,
  })
  page.drawText(contract.providerName, {
    x: providerX,
    y: y - 78,
    size: 7.5,
    font: regular,
    maxWidth: 190,
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
  let page!: PDFPage
  let y = 0

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    y = PAGE_HEIGHT - MARGIN
    page.drawText('CIMA · CONTRATO DIGITAL', {
      x: MARGIN,
      y,
      size: 10,
      font: bold,
      color: rgb(0.53, 0.04, 0.05),
    })
    page.drawLine({
      start: { x: MARGIN, y: y - 8 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - 8 },
      thickness: 1,
      color: rgb(0.65, 0.12, 0.1),
    })
    y -= 28
  }

  const ensure = (height: number) => {
    if (y - height < MARGIN + 38) addPage()
  }

  const drawLines = (text: string, isHeading = false) => {
    const font = isHeading ? bold : regular
    const size = isHeading ? 10 : BODY_SIZE
    const lines = wrap(text, font, size, PAGE_WIDTH - MARGIN * 2)
    ensure(Math.max(lines.length, 1) * LINE_HEIGHT + 6)
    for (const line of lines) {
      page.drawText(line, { x: MARGIN, y, size, font, color: rgb(0.06, 0.06, 0.06) })
      y -= LINE_HEIGHT
    }
    y -= 4
  }

  addPage()

  const paragraphs = contract.contentSnapshot.split('\n')
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim()
    if (!paragraph) {
      y -= 4
      continue
    }

    if (i === 0 && paragraph.startsWith('CONTRATO ')) {
      page.drawText(paragraph, {
        x: MARGIN,
        y,
        size: 12,
        font: bold,
        color: rgb(0.06, 0.06, 0.06),
        maxWidth: PAGE_WIDTH - MARGIN * 2,
      })
      y -= 18
      continue
    }

    const isHeading =
      paragraph.startsWith('Proyecto:') ||
      paragraph.startsWith('CLÁUSULA ') ||
      paragraph.startsWith('PARÁGRAFO ') ||
      paragraph.startsWith('Condiciones adicionales')

    drawLines(paragraph, isHeading)
  }

  ensure(130)
  drawSignatureSection(page, signature, contract, y, regular, bold)

  const pages = document.getPages()
  pages.forEach((pdfPage, index) => {
    const footerText = `Contrato firmado el ${new Date(contract.signedAt!).toLocaleString('es-CO')} · SHA-256 ${contract.contentHash ?? 'N/D'} · Página ${index + 1}/${pages.length}`
    pdfPage.drawText(footerText, {
      x: MARGIN,
      y: 20,
      size: 6.5,
      font: regular,
      color: rgb(0.35, 0.35, 0.35),
      maxWidth: PAGE_WIDTH - MARGIN * 2,
    })
  })

  const pdfBytes = await document.save()
  const cleanProject = projectName.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
  triggerBrowserDownload(pdfBytes, `contrato_${cleanProject}_${contract.id.slice(0, 8)}.pdf`)
}
