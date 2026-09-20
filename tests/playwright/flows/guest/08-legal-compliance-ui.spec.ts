import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { ConsoleLogger } from '../../helpers/console-logger'

const SCREENSHOT_DIR = path.resolve(
  'C:/Users/27seb/.gemini/antigravity/brain/03046ff1-479c-4bea-8455-5c5363517ca4/screenshots'
)

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

test.describe('Legal Compliance & Brand Design Integrity', () => {
  test('login footer renders legal triggers and modal adheres to CIMA visual identity', async ({ page }) => {
    const logger = new ConsoleLogger('legal-ui-login')
    logger.attachToPage(page)

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // 1. Validate corporate Montserrat font family and layout
    const fontFamily = await page.evaluate(() => window.getComputedStyle(document.body).fontFamily)
    expect(fontFamily.toLowerCase()).toContain('montserrat')

    // 2. Validate legal links in footer
    const termsLink = page.getByRole('button', { name: /términos y condiciones/i })
    const privacyLink = page.getByRole('button', { name: /política de privacidad/i })
    const securityLink = page.getByRole('button', { name: /seguridad oci/i })

    await expect(termsLink).toBeVisible()
    await expect(privacyLink).toBeVisible()
    await expect(securityLink).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-login-page-legal-footer.png'),
      fullPage: true,
    })

    // 3. Open Modal via Terms Link
    await termsLink.click()
    const modalTitle = page.getByRole('heading', { name: /marco normativo y legal cima crm/i })
    await expect(modalTitle).toBeVisible()

    // 4. Validate Terms Tab content & screenshot
    await expect(page.getByText('1. Objeto y Alcance de la Plataforma')).toBeVisible()
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-modal-tab-terms.png'),
    })

    // 5. Switch to Privacy tab & screenshot
    const privacyTabBtn = page.getByRole('button', { name: /tratamiento de datos/i })
    await privacyTabBtn.click()
    await expect(page.getByRole('heading', { name: /datos recolectados/i })).toBeVisible()
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-modal-tab-privacy.png'),
    })

    // 6. Switch to OCI Cloud Security tab & screenshot
    const securityTabBtn = page.getByRole('button', { name: /seguridad en nube/i })
    await securityTabBtn.click()
    await expect(securityTabBtn).toHaveClass(/border-primary/)
    await expect(page.getByRole('heading', { name: /almacenamiento en la nube/i })).toBeVisible()
    await expect(page.getByText('Oracle Cloud Infrastructure')).toBeVisible()
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-modal-tab-security.png'),
    })

    // 7. Close dialog
    const closeBtn = page.getByRole('button', { name: /entendido y cerrar/i })
    await closeBtn.click()
    await expect(modalTitle).not.toBeVisible()

    await logger.persist(false)
  })

  test('accept invite view requires explicit consent and follows responsive styling', async ({ page }) => {
    const logger = new ConsoleLogger('legal-ui-accept-invite')
    logger.attachToPage(page)

    // Mock invitation preview for realistic client rendering
    await page.route('**/api/v1/auth/accept-invite/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            email: 'mateo.creativo@cima.com',
            first_name: 'Mateo',
            last_name: 'Morales',
            company_name: 'CIMA Multimedia',
            role: 'worker',
          },
        }),
      })
    })

    await page.goto('/accept-invite/preview-token-123')
    await page.waitForLoadState('networkidle')

    // Validate page elements and user identity badge
    const pageHeading = page.getByRole('heading', { name: /aceptar invitación/i })
    await expect(pageHeading).toBeVisible()
    await expect(page.getByText('Mateo Morales')).toBeVisible()
    await expect(page.getByText('mateo.creativo@cima.com')).toBeVisible()

    const checkbox = page.getByLabel(/aceptar términos y política de datos/i)
    await expect(checkbox).toBeVisible()
    await expect(checkbox).not.toBeChecked()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-accept-invite-initial.png'),
      fullPage: true,
    })

    // Attempt submit without checkbox
    const submitBtn = page.getByRole('button', { name: /activar cuenta y acceder/i })
    await submitBtn.click()

    // Check validation error message
    const errorMsg = page.getByText(/debes aceptar los términos y la política/i)
    await expect(errorMsg).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-accept-invite-validation-error.png'),
      fullPage: true,
    })

    // Check clicking modal link opens terms dialog
    const termsTrigger = page.getByRole('button', { name: /términos y condiciones de uso/i })
    await termsTrigger.click()
    const modalTitle = page.getByRole('heading', { name: /marco normativo y legal cima crm/i })
    await expect(modalTitle).toBeVisible()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-accept-invite-opened-modal.png'),
    })

    await page.getByRole('button', { name: /entendido y cerrar/i }).click()

    // Check the legal consent box
    await checkbox.check()
    await expect(checkbox).toBeChecked()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '08-accept-invite-checked-consent.png'),
      fullPage: true,
    })

    await logger.persist(false)
  })
})
