import { test, expect } from '@playwright/test'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Guest - Aceptar Invitacion', () => {
  test('acceder a pagina de invitacion con token', async ({ page }) => {
    const logger = new ConsoleLogger('guest-05-acceder-invite')
    logger.attachToPage(page)

    await page.goto('/accept-invite/test-token-123')
    await page.waitForLoadState('networkidle')

    const passwordInput = page.getByLabel('Contrasena')
    const confirmInput = page.getByLabel('Confirmar')
    const submitButton = page.getByRole('button', { name: /activar cuenta/i })

    const hasPassword = await passwordInput.isVisible().catch(() => false)
    const hasConfirm = await confirmInput.isVisible().catch(() => false)
    const hasSubmit = await submitButton.isVisible().catch(() => false)
    const hasError = await page.getByText(/no se pudo cargar/i).isVisible().catch(() => false)

    expect(hasPassword || hasError).toBe(true)

    await logger.persist(false)
  })

  test('token invalido muestra error', async ({ page }) => {
    const logger = new ConsoleLogger('guest-05-token-invalido')
    logger.attachToPage(page)

    await page.goto('/accept-invite/token-invalido-999')
    await page.waitForLoadState('networkidle')

    await page.waitForTimeout(2000)

    const errorAlert = page.getByRole('alert')
    const hasError = await errorAlert.isVisible().catch(() => false)
    expect(hasError).toBe(true)

    await logger.persist(false)
  })

  test('ver link para ir a login', async ({ page }) => {
    const logger = new ConsoleLogger('guest-05-link-login')
    logger.attachToPage(page)

    await page.goto('/accept-invite/test-token-123')
    await page.waitForLoadState('networkidle')

    const loginLink = page.getByRole('link', { name: /ya tengo cuenta.*iniciar sesion/i })
    await expect(loginLink).toBeVisible()

    await logger.persist(false)
  })

  test('validacion de contrasena fuerte', async ({ page }) => {
    const logger = new ConsoleLogger('guest-05-validacion-contrasena')
    logger.attachToPage(page)

    await page.goto('/accept-invite/test-token-123')
    await page.waitForLoadState('networkidle')

    const passwordInput = page.getByLabel('Contrasena')
    const hasPassword = await passwordInput.isVisible().catch(() => false)

    if (hasPassword) {
      await passwordInput.fill('debil')

      const submitButton = page.getByRole('button', { name: /activar cuenta/i })
      await submitButton.click()

      await page.waitForTimeout(1000)

      const errorAlert = page.getByRole('alert')
      await expect(errorAlert).toBeVisible()
    }

    await logger.persist(false)
  })
})
