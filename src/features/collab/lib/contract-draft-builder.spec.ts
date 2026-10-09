import { describe, expect, it } from 'vitest'
import {
  buildDraftContractSnapshot,
  getContractDraftChecklist,
} from './contract-draft-builder'
import type { ProjectContractDraftInput } from '@/features/collab/api'

describe('contract-draft-builder (TDD)', () => {
  const baseDraft: ProjectContractDraftInput = {
    provider_kind: 'cima',
    provider_name: 'CIMA S.A.S.',
    provider_tax_id: '901234567-8',
    provider_representative: 'Roberto Jiménez',
    provider_representative_document: '1098765432',
    client_kind: 'juridical',
    client_name: '',
    client_company_name: 'Petal Cosmetics S.A.S.',
    client_tax_id: '900987654-3',
    client_document: null,
    client_representative: 'Carolina Herrera',
    client_representative_document: '52345678',
    client_email: 'carolina@petalcosmetics.co',
    client_phone: '+57 300 123 4567',
    plan_name: 'Platinum',
    monthly_fee: 1547000,
    currency: 'COP',
    term_months: 6,
    service_scope: '12 publicaciones mensuales y 1 video profesional.',
    additional_terms: 'Revisión quincenal de métricas comerciales.',
    signature_city: 'Bucaramanga',
    tax_included: true,
  }

  it('construye el snapshot oficial del contrato para persona jurídica con prestador CIMA', () => {
    const text = buildDraftContractSnapshot(baseDraft, 'Lanzamiento Petal Restore')

    expect(text).toContain('CONTRATO DE PRESTACIÓN DE SERVICIOS')
    expect(text).toContain('Proyecto: Lanzamiento Petal Restore')
    expect(text).toContain('CIMA S.A.S.')
    expect(text).toContain('Petal Cosmetics S.A.S.')
    expect(text).toContain('NIT 900987654-3')
    expect(text).toContain('Carolina Herrera')
    expect(text).toContain('CLÁUSULA PRIMERA. OBJETO.')
    expect(text).toContain('CLÁUSULA SEGUNDA. CONTRAPRESTACIÓN Y FORMA DE PAGO.')
    expect(text).toContain('CLÁUSULA TERCERA. DURACIÓN.')
    expect(text).toContain('6 meses')
    expect(text).toContain('Condiciones adicionales')
    expect(text).toContain('Revisión quincenal de métricas comerciales.')
    expect(text).toContain('Bucaramanga')
  })

  it('construye el snapshot oficial para persona natural y prestador independiente', () => {
    const naturalDraft: ProjectContractDraftInput = {
      ...baseDraft,
      provider_kind: 'independent',
      provider_name: 'Anderson Gremoto',
      provider_tax_id: '1098765432',
      client_kind: 'natural',
      client_name: 'Juan Pérez',
      client_company_name: null,
      client_tax_id: null,
      client_document: '71234567',
      client_representative: null,
      client_representative_document: null,
      tax_included: false,
    }

    const text = buildDraftContractSnapshot(naturalDraft, 'Campaña Personal')

    expect(text).toContain('Anderson Gremoto')
    expect(text).toContain('Juan Pérez, documento 71234567')
    expect(text).toContain('El valor no incluye IVA')
  })

  it('proporciona placeholders legibles cuando los datos están vacíos o incompletos', () => {
    const emptyDraft: ProjectContractDraftInput = {
      ...baseDraft,
      client_company_name: '',
      client_tax_id: '',
      client_representative: '',
      client_representative_document: '',
      signature_city: '',
    }

    const text = buildDraftContractSnapshot(emptyDraft, 'Proyecto Test')

    expect(text).toContain('[Razón social pendiente]')
    expect(text).toContain('[Ciudad pendiente]')
  })

  it('calcula la lista de verificación (checklist) con estados de completitud precisos', () => {
    const checklist = getContractDraftChecklist(baseDraft)

    expect(checklist).toEqual([
      { id: 'provider', label: 'Prestador identificado', done: true },
      { id: 'client', label: 'Datos fiscales y representante', done: true },
      { id: 'plan', label: 'Plan y condiciones económicas', done: true },
      { id: 'delivery', label: 'Alcance del servicio y ciudad', done: true },
    ])

    const incompleteDraft: ProjectContractDraftInput = {
      ...baseDraft,
      client_representative: '',
      signature_city: '',
    }
    const incompleteChecklist = getContractDraftChecklist(incompleteDraft)

    expect(incompleteChecklist.find((item) => item.id === 'client')?.done).toBe(false)
    expect(incompleteChecklist.find((item) => item.id === 'delivery')?.done).toBe(false)
  })
})
