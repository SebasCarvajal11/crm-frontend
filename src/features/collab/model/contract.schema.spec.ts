import { describe, expect, it } from 'vitest'
import {
  parseProjectContractResponse,
  parseProjectAmendmentsResponse,
  projectContractSchema,
} from './contract.schema'

describe('contract.schema', () => {
  const validContractMock = {
    id: 'contract-123',
    projectId: 'project-456',
    status: 'draft' as const,
    providerKind: 'cima' as const,
    providerName: 'CIMA S.A.S.',
    providerTaxId: '901.763.191-0',
    providerRepresentative: 'Annyul Vianney',
    providerRepresentativeDocument: '1032413946',
    clientKind: 'juridical' as const,
    clientName: 'Cliente Demo',
    clientDocument: null,
    clientCompanyName: 'Cliente S.A.S.',
    clientTaxId: '900.123.456-7',
    clientRepresentative: 'Representante',
    clientRepresentativeDocument: '12345678',
    clientEmail: 'cliente@cima.com',
    clientPhone: null,
    planName: 'Oro',
    monthlyFee: 1800000,
    currency: 'COP' as const,
    taxIncluded: true,
    termMonths: 12,
    serviceScope: 'Gestión mensual',
    additionalTerms: null,
    contentSnapshot: null,
    contentHash: null,
    preparedBySub: 'user-sub-1',
    requestedSignatureAt: null,
    signedAt: null,
    signedBySub: null,
    signerName: null,
    signatureDataUrl: null,
    consentAcceptedAt: null,
    signatureCity: 'Bogotá',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  }

  it('valida exitosamente un contrato completo', () => {
    const result = projectContractSchema.safeParse(validContractMock)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('contract-123')
      expect(result.data.currency).toBe('COP')
      expect(result.data.monthlyFee).toBe(1800000)
    }
  })

  it('normaliza campos nulos y opcionales a null', () => {
    const partialContract = {
      ...validContractMock,
      providerTaxId: undefined,
      clientPhone: undefined,
    }
    const result = projectContractSchema.safeParse(partialContract)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.providerTaxId).toBeNull()
      expect(result.data.clientPhone).toBeNull()
    }
  })

  it('parseProjectContractResponse retorna null ante inputs vacíos', () => {
    expect(parseProjectContractResponse(null)).toEqual({ data: null })
    expect(parseProjectContractResponse(undefined)).toEqual({ data: null })
    expect(parseProjectContractResponse({})).toEqual({ data: null })
    expect(parseProjectContractResponse({ data: null })).toEqual({ data: null })
  })

  it('parseProjectContractResponse valida payload envuelto en data', () => {
    const response = parseProjectContractResponse({ data: validContractMock })
    expect(response.data).not.toBeNull()
    expect(response.data?.id).toBe('contract-123')
    expect(response.data?.status).toBe('draft')
  })

  it('parseProjectAmendmentsResponse maneja arrays y fallbacks', () => {
    expect(parseProjectAmendmentsResponse(null)).toEqual({ data: [] })
    expect(parseProjectAmendmentsResponse({})).toEqual({ data: [] })
    expect(parseProjectAmendmentsResponse({ data: [] })).toEqual({ data: [] })
  })
})
