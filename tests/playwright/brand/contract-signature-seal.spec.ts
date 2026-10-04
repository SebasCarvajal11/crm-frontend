import { expect, test, type Page } from '@playwright/test'
import { projectId, setupDashboard } from '../tour/fixtures'

const mockPendingContract = {
  id: 'contract-brand-1',
  projectId,
  providerKind: 'cima',
  providerName: 'CIMA S.A.S.',
  providerTaxId: '901234567-1',
  providerRepresentative: 'Carlos CIMA',
  providerRepresentativeDocument: '1020304050',
  clientKind: 'juridical',
  clientName: 'Cliente CIMA',
  clientDocument: null,
  clientCompanyName: 'Cliente CIMA S.A.S.',
  clientTaxId: '900123456-7',
  clientRepresentative: 'Representante Autorizado',
  clientRepresentativeDocument: '1098765432',
  clientEmail: 'cliente@cima.co',
  clientPhone: '+57 300 987 6543',
  planName: 'Plan Diamante Estratégico',
  monthlyFee: 5400000,
  currency: 'COP',
  taxIncluded: true,
  termMonths: 12,
  serviceScope: 'Transformación digital integral y gestión de pauta.',
  additionalTerms: null,
  contentSnapshot: 'Términos contractuales oficiales CIMA CRM.',
  contentHash: null,
  preparedBySub: 'admin-sub',
  requestedSignatureAt: '2026-04-01T10:00:00Z',
  signedAt: null,
  signedBySub: null,
  signerName: null,
  signatureDataUrl: null,
  consentAcceptedAt: null,
  signatureCity: 'Medellín',
  status: 'pending_signature',
  createdAt: '2026-04-01T08:00:00Z',
  updatedAt: '2026-04-01T10:00:00Z',
}

const mockSignedContract = {
  ...mockPendingContract,
  status: 'signed',
  signerName: 'Representante Autorizado',
  signatureDataUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABkCAYAAADD8z' +
    'AAAAAUUlEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAwB9wEwAB1kLqegAAAABJRU5ErkJggg==',
  signedAt: '2026-04-02T14:30:00Z',
  contentHash:
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
}

async function mockContractEndpoints(page: Page, initialContract = mockPendingContract) {
  let currentContract = { ...initialContract }

  await page.route('**/collab/projects/*/contract', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { data: currentContract },
      })
      return
    }
    await route.fallback()
  })

  await page.route('**/collab/projects/*/contract/sign', async (route) => {
    currentContract = { ...mockSignedContract }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { data: currentContract },
    })
  })
}

test.describe('Formalización Contractual: Tinta Dinámica y Sello Legal Digital', () => {
  test('Canvas dinámico captura firma y transiciona solemnemente al sello digital CIMA', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'client')
    await mockContractEndpoints(page)

    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=contract`)
    await page.waitForLoadState('networkidle')

    // 1. Verificar presencia de canvas de firma con directiva touch-none
    const canvas = page.locator('[data-testid="signature-canvas"]')
    await canvas.scrollIntoViewIfNeeded()
    await expect(canvas).toBeVisible()
    await expect(canvas).toHaveClass(/touch-none/)

    // 2. Simular interacción con velocidad modulada en el canvas
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      await canvas.dispatchEvent('pointerdown', {
        clientX: box.x + 30,
        clientY: box.y + 40,
        pointerId: 1,
        pressure: 0.6,
      })
      await canvas.dispatchEvent('pointermove', {
        clientX: box.x + 100,
        clientY: box.y + 60,
        pointerId: 1,
        pressure: 0.8,
      })
      await canvas.dispatchEvent('pointermove', {
        clientX: box.x + 220,
        clientY: box.y + 45,
        pointerId: 1,
        pressure: 0.3,
      })
      await canvas.dispatchEvent('pointerup', {
        clientX: box.x + 220,
        clientY: box.y + 45,
        pointerId: 1,
      })
    }

    // 3. Aceptar términos y habilitar botón de firma
    const checkbox = page.locator('#contract-consent')
    await checkbox.scrollIntoViewIfNeeded()
    await checkbox.check()

    const submitBtn = page.locator('[data-testid="contract-sign-submit-btn"]')
    await submitBtn.scrollIntoViewIfNeeded()
    await expect(submitBtn).toBeEnabled()

    // 4. Firmar y verificar transición hacia el Sello Legal Digital
    await submitBtn.click()

    const stamp = page.locator('[data-testid="contract-legal-stamp"]')
    await stamp.scrollIntoViewIfNeeded()
    await expect(stamp).toBeVisible()
    await expect(stamp).toHaveClass(/animate-legal-stamp/)

    // 5. Validar asentamiento institucional de hash y certificación
    await expect(stamp).toContainText('Sello Digital Inmutable CIMA')
    await expect(stamp).toContainText('Ley 527 de 1999')
    await expect(stamp).toContainText('Representante Autorizado')

    const hashBox = page.locator('[data-testid="sealed-sha256-hash"]')
    await expect(hashBox).toBeVisible()
    await expect(hashBox).toContainText('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')

    // 6. Cero desbordamiento global
    const noWindowOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noWindowOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('Respeta strictly prefers-reduced-motion suprimiendo escala y destello en el sello', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'client')
    await mockContractEndpoints(page, mockSignedContract)

    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=contract`)
    await page.waitForLoadState('networkidle')

    const stamp = page.locator('[data-testid="contract-legal-stamp"]')
    await expect(stamp).toBeVisible()

    // 1. Verificar anulación de keyframes en reduced-motion
    const animationName = await stamp.evaluate((el) => window.getComputedStyle(el).animationName)
    expect(['none', ''].includes(animationName) || animationName.length === 0).toBe(true)

    // 2. Verificar transform a plano sin escala
    const transform = await stamp.evaluate((el) => window.getComputedStyle(el).transform)
    expect(transform).toBe('none')

    expect(errors).toEqual([])
  })
})
