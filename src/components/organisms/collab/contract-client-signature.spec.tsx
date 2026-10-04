import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ProjectContract } from '@/features/collab/model'
import { ContractLegalStampSeal } from './contract-legal-stamp-seal'
import { ContractClientSignature } from './contract-client-signature'

const mockPendingContract: ProjectContract = {
  id: 'contract-test-1',
  projectId: 'proj-101',
  providerKind: 'cima',
  providerName: 'CIMA S.A.S.',
  providerTaxId: '901234567-1',
  providerRepresentative: 'Carlos CIMA',
  providerRepresentativeDocument: '1020304050',
  clientKind: 'juridical',
  clientName: 'Corporación Alfa',
  clientDocument: null,
  clientCompanyName: 'Corporación Alfa S.A.S.',
  clientTaxId: '900987654-2',
  clientRepresentative: 'Elena Restrepo',
  clientRepresentativeDocument: '52987654',
  clientEmail: 'elena@alfa.co',
  clientPhone: '+57 300 123 4567',
  planName: 'Plan Diamante',
  monthlyFee: 4500000,
  currency: 'COP',
  taxIncluded: true,
  termMonths: 12,
  serviceScope: 'Gestión integral de marca y pauta digital.',
  additionalTerms: null,
  contentSnapshot: null,
  contentHash: null,
  preparedBySub: 'admin-1',
  requestedSignatureAt: '2026-04-10T10:00:00Z',
  signedAt: null,
  signedBySub: null,
  signerName: null,
  signatureDataUrl: null,
  consentAcceptedAt: null,
  signatureCity: 'Medellín',
  status: 'pending_signature',
  createdAt: '2026-04-09T08:00:00Z',
  updatedAt: '2026-04-10T10:00:00Z',
}

const mockSignedContract: ProjectContract = {
  ...mockPendingContract,
  status: 'signed',
  signerName: 'Elena Restrepo',
  signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  signedAt: '2026-04-10T15:30:00Z',
  contentHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
}

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('ContractLegalStampSeal', () => {
  it('renderiza sello institucional con clase animate-legal-stamp cuando es recién firmado', () => {
    const markup = renderToStaticMarkup(
      <ContractLegalStampSeal
        contract={mockSignedContract}
        projectName="Alfa Marketing"
        isFreshlySealed={true}
        onDismiss={vi.fn()}
      />
    )

    expect(markup).toContain('data-testid="contract-legal-stamp"')
    expect(markup).toContain('animate-legal-stamp')
    expect(markup).toContain('Sello Digital Inmutable CIMA')
    expect(markup).toContain('Ley 527 de 1999')
    expect(markup).toContain('Verificado')
    expect(markup).toContain('Elena Restrepo')
    expect(markup).toContain('data-testid="sealed-signature-image"')
    expect(markup).toContain('data-testid="sealed-sha256-hash"')
    expect(markup).toContain('a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3')
    expect(markup).toContain('Descargar PDF firmado con sello')
    expect(markup).toContain('Ver trazabilidad completa')
  })

  it('no inyecta animación de estampado cuando isFreshlySealed es false', () => {
    const markup = renderToStaticMarkup(
      <ContractLegalStampSeal
        contract={mockSignedContract}
        projectName="Alfa Marketing"
        isFreshlySealed={false}
      />
    )

    expect(markup).toContain('data-testid="contract-legal-stamp"')
    expect(markup).not.toContain('animate-legal-stamp')
  })
})

describe('ContractClientSignature', () => {
  it('renderiza formulario de firma en estado inicial con botón de envío deshabilitado', () => {
    const markup = renderWithQueryClient(
      <ContractClientSignature
        accessToken="test-token"
        projectId="proj-101"
        projectName="Alfa Marketing"
        contract={mockPendingContract}
        onError={vi.fn()}
      />
    )

    expect(markup).toContain('Firma electrónica del cliente')
    expect(markup).toContain('Nombre de quien firma')
    expect(markup).toContain('value="Elena Restrepo"')
    expect(markup).toContain('data-testid="signature-canvas"')
    expect(markup).toContain('Acepto los términos del contrato')
    expect(markup).toContain('huella criptográfica SHA-256')
    expect(markup).toContain('data-testid="contract-sign-submit-btn"')
    expect(markup).toContain('disabled=""')
  })
})
