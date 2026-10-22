import { PDFDocument, StandardFonts, type PDFImage } from 'pdf-lib'
import type { ProjectContract, ProjectContractAmendment } from '@/features/collab/model'
import { loadBrandPdfAssets } from './contract-pdf-assets'
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  drawBackgroundTexture,
  drawMembrete,
} from './contract-pdf-layout'
import {
  drawContractBody,
  drawDualSignatures,
  drawSinglePageFooter,
} from './contract-pdf-sections'

export { PAGE_WIDTH, PAGE_HEIGHT }

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const encoded = dataUrl.split(',', 2)[1]
  if (!encoded) throw new Error('La firma no contiene datos PNG válidos.')
  return Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0))
}

function triggerBrowserDownload(pdfBytes: Uint8Array, filename: string): void {
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

async function embedBrandImages(
  doc: PDFDocument
): Promise<{ texture: PDFImage | null; logo: PDFImage | null }> {
  try {
    const { textureBytes, logoBytes } = await loadBrandPdfAssets()
    const [texture, logo] = await Promise.all([
      textureBytes ? doc.embedJpg(textureBytes).catch(() => null) : null,
      logoBytes ? doc.embedPng(logoBytes).catch(() => null) : null,
    ])
    return { texture, logo }
  } catch {
    return { texture: null, logo: null }
  }
}

export async function generateSignedContractPdfDoc(
  contract: ProjectContract,
  projectName: string
): Promise<PDFDocument> {
  if (!contract.contentSnapshot || !contract.signatureDataUrl || !contract.signedAt) {
    throw new Error('El contrato debe estar firmado antes de generar el PDF.')
  }

  const document = await PDFDocument.create()
  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const signature = await document.embedPng(dataUrlToBytes(contract.signatureDataUrl))
  const { texture, logo } = await embedBrandImages(document)

  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  drawBackgroundTexture(page, texture)
  const startY = drawMembrete(page, { bold, regular }, {
    logo,
    subtitle: `CONTRATO OFICIAL · PROYECTO: ${projectName.toUpperCase()}`,
  })

  const paragraphs = contract.contentSnapshot.split('\n')
  const endY = drawContractBody(page, paragraphs, startY, { regular, bold })

  const signaturesStartY = Math.max(endY - 18, 114)
  drawDualSignatures(page, {
    signature,
    client: {
      name: contract.signerName ?? contract.clientName,
      email: contract.clientEmail,
    },
    provider: {
      name: contract.providerName,
      representative: contract.providerRepresentative,
      taxId: contract.providerTaxId,
    },
    startY: signaturesStartY,
    fonts: { regular, bold },
  })

  drawSinglePageFooter(page, {
    signedAt: contract.signedAt,
    hash: contract.contentHash ?? 'N/D',
    docType: 'Contrato Principal',
    font: regular,
  })

  return document
}

export async function generateSignedAmendmentPdfDoc(
  amendment: ProjectContractAmendment,
  contract: ProjectContract,
  projectName: string
): Promise<PDFDocument> {
  if (!amendment.contentSnapshot || !amendment.signatureDataUrl || !amendment.signedAt) {
    throw new Error('El Otrosí debe estar firmado antes de generar el PDF.')
  }

  const document = await PDFDocument.create()
  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const signature = await document.embedPng(dataUrlToBytes(amendment.signatureDataUrl))
  const { texture, logo } = await embedBrandImages(document)

  const numStr = amendment.amendmentNumber.toString().padStart(2, '0')
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  drawBackgroundTexture(page, texture)
  const startY = drawMembrete(page, { bold, regular }, {
    logo,
    subtitle: `OTROSÍ N° ${numStr} AL CONTRATO · PROYECTO: ${projectName.toUpperCase()}`,
  })

  const paragraphs = amendment.contentSnapshot.split('\n')
  const endY = drawContractBody(page, paragraphs, startY, { regular, bold })

  const signaturesStartY = Math.max(endY - 18, 114)
  drawDualSignatures(page, {
    signature,
    client: {
      name: amendment.signerName ?? contract.clientName,
      email: contract.clientEmail,
    },
    provider: {
      name: contract.providerName,
      representative: contract.providerRepresentative,
      taxId: contract.providerTaxId,
    },
    startY: signaturesStartY,
    fonts: { regular, bold },
  })

  drawSinglePageFooter(page, {
    signedAt: amendment.signedAt,
    hash: amendment.contentHash ?? 'N/D',
    docType: `Otrosí N° ${numStr}`,
    font: regular,
  })

  return document
}

export async function downloadSignedContractPdf(
  contract: ProjectContract,
  projectName: string
): Promise<void> {
  const doc = await generateSignedContractPdfDoc(contract, projectName)
  const pdfBytes = await doc.save()
  const cleanProject = projectName.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
  triggerBrowserDownload(pdfBytes, `contrato_${cleanProject}_${contract.id.slice(0, 8)}.pdf`)
}

export async function downloadSignedAmendmentPdf(
  amendment: ProjectContractAmendment,
  contract: ProjectContract,
  projectName: string
): Promise<void> {
  const doc = await generateSignedAmendmentPdfDoc(amendment, contract, projectName)
  const pdfBytes = await doc.save()
  const numStr = amendment.amendmentNumber.toString().padStart(2, '0')
  const cleanProject = projectName.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
  triggerBrowserDownload(
    pdfBytes,
    `otrosi_${numStr}_${cleanProject}_${amendment.id.slice(0, 8)}.pdf`
  )
}
