import { describe, expect, it, vi } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import type { ProjectContract, ProjectContractAmendment } from '@/features/collab/model'
import {
  generateSignedContractPdfDoc,
  generateSignedAmendmentPdfDoc,
  downloadSignedContractPdf,
  downloadSignedAmendmentPdf,
  PAGE_WIDTH,
  PAGE_HEIGHT,
} from './contract-pdf'

const samplePngDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const sampleContractSnapshot = [
  'CONTRATO DE PRESTACIÓN DE SERVICIOS DE GESTIÓN DE REDES SOCIALES',
  'Proyecto: Alpha Brand Growth',
  '',
  'Entre CIMA DIGITAL SAS, NIT 901234567, en adelante EL PRESTADOR, y Acme Corp, NIT 800123456, en adelante EL CLIENTE, se celebra el presente contrato.',
  '',
  'CLÁUSULA PRIMERA. OBJETO.',
  'EL PRESTADOR se compromete a proporcionar servicios profesionales de administración de redes sociales para el proyecto Alpha Brand Growth. El servicio corresponde al plan Growth Pro e incluye: Gestión integral de 3 canales, parrilla de contenidos semanal y reporte mensual.',
  'PARÁGRAFO PRIMERO. EL CLIENTE proporcionará oportunamente los medios, insumos y aprobaciones.',
  '',
  'CLÁUSULA SEGUNDA. CONTRAPRESTACIÓN Y FORMA DE PAGO.',
  'EL CLIENTE pagará a EL PRESTADOR la suma mensual de $2.500.000 COP por los servicios del plan Growth Pro. El pago se realiza por mes anticipado.',
  'EL PRESTADOR emitirá facturas detalladas por los servicios prestados.',
  '',
  'CLÁUSULA TERCERA. DURACIÓN.',
  'El contrato tendrá una duración de 6 meses, contada desde la fecha de su firma electrónica.',
  '',
  'CLÁUSULA CUARTA. CONTENIDO Y COLABORACIÓN.',
  'EL CLIENTE se compromete a proporcionar acceso oportuno a las cuentas.',
  '',
  'CLÁUSULA QUINTA. PROPIEDAD INTELECTUAL.',
  'Los derechos de propiedad intelectual pertenecerán a EL CLIENTE.',
  '',
  'CLÁUSULA SEXTA. CONFIDENCIALIDAD.',
  'Las partes se obligan a conservar la confidencialidad de la información comercial sensible.',
  '',
  'CLÁUSULA SÉPTIMA. TERMINACIÓN.',
  'Cualquiera de las partes podrá terminar el contrato mediante preaviso de 20 días.',
  '',
  'En aceptación de lo anterior, firma del cliente: John Doe. El contrato se firma electrónicamente en Medellín.',
  'Al firmar electrónicamente, EL CLIENTE declara que leyó y acepta íntegramente este documento.',
].join('\n')

const sampleContract: ProjectContract = {
  id: 'contract-12345678-abcd',
  projectId: 'proj-001',
  status: 'signed',
  providerKind: 'cima',
  providerName: 'CIMA DIGITAL S.A.S.',
  providerTaxId: '901.234.567-8',
  providerRepresentative: 'Carlos Mendoza',
  providerRepresentativeDocument: '1020304050',
  clientKind: 'natural',
  clientName: 'John Doe',
  clientDocument: '1122334455',
  clientCompanyName: 'Acme Corp',
  clientTaxId: '800.123.456-7',
  clientRepresentative: 'John Doe',
  clientRepresentativeDocument: '1122334455',
  clientEmail: 'john@acme.com',
  clientPhone: '+57 300 123 4567',
  planName: 'Growth Pro',
  monthlyFee: 2500000,
  currency: 'COP',
  taxIncluded: true,
  termMonths: 6,
  serviceScope: 'Gestión integral de 3 canales, parrilla de contenidos semanal y reporte mensual.',
  additionalTerms: null,
  contentSnapshot: sampleContractSnapshot,
  contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  preparedBySub: 'admin-1',
  requestedSignatureAt: '2026-03-01T10:00:00Z',
  signedAt: '2026-03-01T14:30:00Z',
  signedBySub: 'client-1',
  signerName: 'John Doe',
  signatureDataUrl: samplePngDataUrl,
  consentAcceptedAt: '2026-03-01T14:30:00Z',
  signatureCity: 'Medellín',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T14:30:00Z',
}

const sampleAmendment: ProjectContractAmendment = {
  id: 'amend-001',
  contractId: sampleContract.id,
  projectId: sampleContract.projectId,
  amendmentNumber: 1,
  title: 'Adición de Canal TikTok',
  amendmentType: 'services',
  status: 'signed',
  serviceScope: 'Inclusión de producción audiovisual para TikTok.',
  additionalFee: 500000,
  feePaymentType: 'monthly_recurring',
  termMonthsExtension: 0,
  additionalTerms: null,
  clientRequestNotes: null,
  contentSnapshot: [
    'OTROSÍ N° 01 AL CONTRATO DE PRESTACIÓN DE SERVICIOS',
    'Proyecto: Alpha Brand Growth',
    '',
    'CLÁUSULA PRIMERA. OBJETO DE LA MODIFICACIÓN.',
    'Se adiciona la producción de 8 videos mensuales para TikTok.',
    '',
    'En aceptación de lo anterior, firma del cliente: John Doe.',
  ].join('\n'),
  contentHash: 'a1b2c3d4e5f6',
  preparedBySub: 'admin-1',
  requestedSignatureAt: '2026-03-14T10:00:00Z',
  signedAt: '2026-03-15T10:00:00Z',
  signedBySub: 'client-1',
  signerName: 'John Doe',
  signatureDataUrl: samplePngDataUrl,
  consentAcceptedAt: '2026-03-15T10:00:00Z',
  signedIpAddress: '127.0.0.1',
  signedUserAgent: 'Mozilla/5.0',
  signatureCity: 'Medellín',
  createdAt: '2026-03-14T10:00:00Z',
  updatedAt: '2026-03-15T10:00:00Z',
}

describe('Contract PDF Single Page & Branding', () => {
  it('defines page dimensions as Legal/Oficio (612 x 1008 pt)', () => {
    expect(PAGE_WIDTH).toBe(612)
    expect(PAGE_HEIGHT).toBe(1008)
  })

  it('generates a signed contract PDF with EXACTLY 1 single page', async () => {
    const doc = await generateSignedContractPdfDoc(sampleContract, 'Alpha Brand Growth')

    expect(doc).toBeInstanceOf(PDFDocument)
    expect(doc.getPageCount()).toBe(1)

    const [page] = doc.getPages()
    expect(page.getWidth()).toBe(612)
    expect(page.getHeight()).toBe(1008)
  })

  it('generates a signed amendment PDF with EXACTLY 1 single page in Legal size', async () => {
    const doc = await generateSignedAmendmentPdfDoc(sampleAmendment, sampleContract, 'Alpha Brand Growth')

    expect(doc).toBeInstanceOf(PDFDocument)
    expect(doc.getPageCount()).toBe(1)

    const [page] = doc.getPages()
    expect(page.getWidth()).toBe(612)
    expect(page.getHeight()).toBe(1008)
  })

  it('fails fast if contract is missing signature or snapshot', async () => {
    const unsignedContract = { ...sampleContract, signatureDataUrl: null }
    await expect(
      generateSignedContractPdfDoc(unsignedContract, 'Alpha Brand Growth')
    ).rejects.toThrow('El contrato debe estar firmado antes de generar el PDF.')
  })

  it('keeps single page even with extensive additional terms and juridical client', async () => {
    const extensiveSnapshot = [
      sampleContractSnapshot,
      'Condiciones adicionales',
      '1. Entregables semanales los días martes antes de las 18:00.',
      '2. Acceso a plataforma publicitaria con permisos de anunciante.',
      '3. Ajustes de pauta quincenales según métricas de conversión.',
    ].join('\n')

    const juridicalContract: ProjectContract = {
      ...sampleContract,
      clientKind: 'juridical',
      clientCompanyName: 'Empresas Unidas de Colombia S.A.',
      clientTaxId: '900.876.543-1',
      clientRepresentative: 'María Patricia Gómez',
      clientRepresentativeDocument: '52.987.654',
      additionalTerms: 'Condiciones de pauta quincenal.',
      contentSnapshot: extensiveSnapshot,
    }

    const doc = await generateSignedContractPdfDoc(juridicalContract, 'Alpha Brand Growth')
    expect(doc.getPageCount()).toBe(1)
  })

  it('downloads signed contract PDF without throwing in browser environment', async () => {
    const clickMock = vi.fn()
    const appendChildMock = vi.fn()
    const removeChildMock = vi.fn()

    const mockAnchor = {
      style: {},
      href: '',
      download: '',
      click: clickMock,
    }

    vi.stubGlobal('window', {
      document: {
        createElement: vi.fn(() => mockAnchor),
      },
    })
    vi.stubGlobal('document', {
      body: {
        appendChild: appendChildMock,
        removeChild: removeChildMock,
      },
    })
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })

    await expect(
      downloadSignedContractPdf(sampleContract, 'Alpha Brand Growth')
    ).resolves.toBeUndefined()

    expect(clickMock).toHaveBeenCalled()
    expect(mockAnchor.download).toContain('contrato_alpha_brand_growth_')

    await expect(
      downloadSignedAmendmentPdf(sampleAmendment, sampleContract, 'Alpha Brand Growth')
    ).resolves.toBeUndefined()

    expect(mockAnchor.download).toContain('otrosi_01_alpha_brand_growth_')

    vi.unstubAllGlobals()
  })

  it('outputs valid PDF binary bytes with %PDF magic header', async () => {
    const doc = await generateSignedContractPdfDoc(sampleContract, 'Alpha Brand Growth')
    const bytes = await doc.save()

    expect(bytes.length).toBeGreaterThan(1000)
    const header = String.fromCharCode(...bytes.subarray(0, 5))
    expect(header).toBe('%PDF-')
  })
})
