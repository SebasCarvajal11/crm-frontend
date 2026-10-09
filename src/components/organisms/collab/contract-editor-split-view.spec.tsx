import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ContractLiveSheet } from './contract-live-sheet'
import { ContractEditorSummary } from './contract-editor-summary'
import type { ProjectContractDraftInput } from '@/features/collab/api'

describe('ContractEditor Split-View (TDD)', () => {
  const mockDraft: ProjectContractDraftInput = {
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
    additional_terms: 'Revisión quincenal de métricas.',
    signature_city: 'Bucaramanga',
    tax_included: true,
  }

  it('ContractLiveSheet renderiza la hoja de contrato formal en vivo con membrete, partes y cláusulas', () => {
    const markup = renderToStaticMarkup(
      <ContractLiveSheet
        projectName="Lanzamiento Petal Restore"
        values={mockDraft}
        hasContract={false}
      />
    )

    expect(markup).toContain('HOJA DE CONTRATO')
    expect(markup).toContain('Borrador en tiempo real')
    expect(markup).toContain('Petal Cosmetics S.A.S.')
    expect(markup).toContain('CLÁUSULA PRIMERA')
    expect(markup).toContain('CLÁUSULA SEGUNDA')
    expect(markup).toContain('12 publicaciones mensuales')
    expect(markup).toContain('Bucaramanga')
  })

  it('ContractEditorSummary calcula el valor total proyectado del contrato y el checklist de preparación', () => {
    const markup = renderToStaticMarkup(
      <ContractEditorSummary
        projectName="Lanzamiento Petal Restore"
        values={mockDraft}
        hasContract={false}
        busy={false}
        isSaving={false}
        isSending={false}
        onSave={() => {}}
        onSend={() => {}}
      />
    )

    // Total estimado: 1.547.000 * 6 = 9.282.000
    expect(markup).toContain('Total estimado')
    expect(markup).toContain('9.282.000')
    expect(markup).toContain('6 meses')
    expect(markup).toContain('Guardar borrador')
    expect(markup).toContain('Habilitar firma')
    expect(markup).toContain('Requisitos de firma')
  })
})
