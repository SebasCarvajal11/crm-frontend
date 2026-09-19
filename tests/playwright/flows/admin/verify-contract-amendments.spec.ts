import { test, expect, type Page } from '@playwright/test'
import { USERS } from '../../fixtures/auth.fixture'
import { LoginPage } from '../../page-objects/login.page'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/eb94f670-8c42-40f0-94f1-5d3670e9372d/screenshots'

async function loginAndGoToContract(page: Page, email: string, pass: string) {
  await page.goto('/login')
  await page.getByLabel('Correo').fill(email)
  await page.locator('input#password').fill(pass)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15_000 })

  const collabBtn = page.getByRole('button', { name: 'Colaboración' })
  await collabBtn.waitFor({ state: 'visible', timeout: 10_000 })
  await collabBtn.click()

  const card = page.locator('[aria-label*="Repositorio externo"]').first()
  await card.waitFor({ state: 'visible', timeout: 15_000 })
  await card.click()

  const contractTab = page.getByRole('tab', { name: 'Contrato' })
  await contractTab.waitFor({ state: 'visible', timeout: 10_000 })
  await contractTab.click()
  await page.waitForTimeout(1000)
}

async function drawOnCanvas(page: Page) {
  const canvas = page.locator('canvas')
  await canvas.waitFor({ state: 'visible', timeout: 5000 })
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.move(box.x + 30, box.y + 30)
    await page.mouse.down()
    await page.mouse.move(box.x + 90, box.y + 60)
    await page.mouse.move(box.x + 150, box.y + 35)
    await page.mouse.up()
  }
}

test('flujo completo de otrosies y balanceo de contrato digital', async ({ browser, baseURL }) => {
  test.setTimeout(60_000)
  const url = baseURL || 'http://localhost:5173'
  // 1. Admin visualiza contrato balanceado sin firmas huérfanas
  const adminContext = await browser.newContext({ baseURL: url, viewport: { width: 1440, height: 900 } })
  const adminPage = await adminContext.newPage()
  adminPage.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()))
  adminPage.on('pageerror', err => console.log('BROWSER ERROR:', err))
  adminPage.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText))
  adminPage.on('response', res => {
    if (res.status() >= 400) console.log('HTTP ERROR:', res.status(), res.url())
  })
  await loginAndGoToContract(adminPage, USERS.admin.email, USERS.admin.password)

  await expect(adminPage.getByText('Contrato del proyecto')).toBeVisible()
  await expect(adminPage.getByText('Firmado', { exact: true }).first()).toBeVisible()
  await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-main-balanced-desktop.png` })

  // 2. Admin navega a la pestaña de Otrosíes y Adiciones
  await adminPage.getByRole('button', { name: /Otrosíes y Adiciones/i }).click()
  await adminPage.waitForTimeout(500)
  await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-amendments-empty-desktop.png` })

  // 3. Admin abre modal y crea un nuevo Otrosí (Adición de 2 videos publicitarios)
  await adminPage.locator('[data-testid="open-amendment-modal-btn"]').click()
  await adminPage.waitForTimeout(500)

  const titleInput = adminPage.locator('[data-testid="amendment-title-input"]')
  await titleInput.fill('Adición de 2 videos promocionales para Facebook Ads')

  const feeInput = adminPage.locator('[data-testid="amendment-fee-input"]')
  await feeInput.fill('450000')

  const scopeInput = adminPage.locator('[data-testid="amendment-scope-input"]')
  await scopeInput.fill(
    'Producción, edición y entrega de 2 videos de 30 segundos en formato 16:9 con locución y subtítulos.',
  )

  await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-amendment-modal-draft-desktop.png` })
  await adminPage.locator('[data-testid="save-amendment-draft-btn"]').click()
  await adminPage.waitForTimeout(1500)

  // 4. Verificar Otrosí en estado Borrador
  await expect(adminPage.getByText(/Otrosí N°/i).first()).toBeVisible({ timeout: 10_000 })
  await expect(
    adminPage.getByRole('heading', { name: 'Adición de 2 videos promocionales para Facebook Ads' }).first(),
  ).toBeVisible()
  await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-amendments-draft-created-desktop.png` })

  // 5. Admin habilita firma para el cliente
  const requestSignBtn = adminPage.locator('button:has-text("Habilitar para firma")').first()
  await requestSignBtn.click()
  await adminPage.waitForTimeout(1500)

  await expect(adminPage.getByText('Pendiente de firma').first()).toBeVisible({ timeout: 10_000 })
  await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-amendments-pending-signature-desktop.png` })

  // 6. Cliente ingresa, revisa y firma electrónicamente el Otrosí
  const clientContext = await browser.newContext({ baseURL: url, viewport: { width: 1440, height: 900 } })
  const clientPage = await clientContext.newPage()
  await loginAndGoToContract(clientPage, USERS.client.email, USERS.client.password)

  await clientPage.getByRole('button', { name: /Otrosíes y Adiciones/i }).click()
  await clientPage.waitForTimeout(500)

  const reviewAndSignBtn = clientPage.locator('button:has-text("Revisar y firmar")').first()
  await reviewAndSignBtn.click()
  await clientPage.waitForTimeout(800)

  await expect(clientPage.getByText(/Revisar y Firmar Otrosí/i)).toBeVisible()
  await clientPage.locator('[data-testid="amendment-signer-name-input"]').fill('Representante Moda Bella')
  await drawOnCanvas(clientPage)
  await clientPage.locator('[data-testid="amendment-accept-checkbox"]').click()

  await clientPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-amendment-sign-dialog-client-desktop.png` })
  await clientPage.locator('[data-testid="submit-amendment-sign-btn"]').click()
  await clientPage.waitForTimeout(2000)

  // 7. Verificar que el Otrosí pasa a Firmado y se habilita Descargar PDF
  await expect(clientPage.getByText('Firmado', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  const downloadPdfBtn = clientPage.locator('button:has-text("Descargar PDF")').first()
  await expect(downloadPdfBtn).toBeVisible()
  await clientPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-amendments-signed-desktop.png` })

  // 8. Captura responsive en Mobile
  await clientPage.setViewportSize({ width: 390, height: 844 })
  await clientPage.waitForTimeout(500)
  await clientPage.screenshot({ path: `${SCREENSHOT_DIR}/contract-amendments-mobile.png` })

  await adminContext.close()
  await clientContext.close()
})
