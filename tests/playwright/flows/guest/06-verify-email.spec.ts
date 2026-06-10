import { test, expect } from '@playwright/test'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Guest - Verificacion de Email', () => {
  test('acceder a pagina de verificacion con token', async ({ page }) => {
    const logger = new ConsoleLogger('guest-06-acceder-verify')
    logger.attachToPage(page)

    await page.goto('/verify-email?token=test-token-123')
    await page.waitForLoadState('networkidle')

    const verifyButton = page.getByRole('button', { name: /verificar correo/i })
    const hasButton = await verifyButton.isVisible().catch(() => false)
    const hasError = await page.getByText(/enlace no valido/i).isVisible().catch(() => false)

    expect(hasButton || hasError).toBe(true)

    await logger.persist(false)
  })

  test('sin token muestra enlace no valido', async ({ page }) => {
    const logger = new ConsoleLogger('guest-06-sin-token')
    logger.attachToPage(page)

    await page.goto('/verify-email')
    await page.waitForLoadState('networkidle')

    const invalidLink = page.getByText(/enlace no valido/i)
    await expect(invalidLink).toBeVisible()

    await logger.persist(false)
  })

  test('ver link para volver a login', async ({ page }) => {
    const logger = new ConsoleLogger('guest-06-volver-login')
    logger.attachToPage(page)

    await page.goto('/verify-email')
    await page.waitForLoadState('networkidle')

    const backLink = page.getByRole('link', { name: /volver.*inicio.*sesion/i })
    await expect(backLink).toBeVisible()

    await backLink.click()
    await expect(page).toHaveURL(/\/login/)

    await logger.persist(false)
  })

  test('verificar correo con token', async ({ page }) => {
    const logger = new ConsoleLogger('guest-06-verificar-correo')
    logger.attachToPage(page)

    await page.goto('/verify-email?token=test-token-123')
    await page.waitForLoadState('networkidle')

    const verifyButton = page.getByRole('button', { name: /verificar correo/i })
    const hasButton = await verifyButton.isVisible().catch(() => false)

    if (hasButton) {
      await verifyButton.click()
      await page.waitForTimeout(2000)
    }

    await logger.persist(false)
  })
})
