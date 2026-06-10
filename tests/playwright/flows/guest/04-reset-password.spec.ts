import { test, expect } from '@playwright/test'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Guest - Reset de Contrasena', () => {
  test('acceder a pagina de reset con token', async ({ page }) => {
    const logger = new ConsoleLogger('guest-04-acceder-reset')
    logger.attachToPage(page)

    await page.goto('/reset-password?token=test-token-123')
    await page.waitForLoadState('networkidle')

    const passwordInput = page.getByLabel('Nueva contrasena')
    const confirmInput = page.getByLabel('Confirmar')
    const submitButton = page.getByRole('button', { name: /establecer contrasena/i })

    await expect(passwordInput).toBeVisible()
    await expect(confirmInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    await logger.persist(false)
  })

  test('reset con contrasena debil muestra error', async ({ page }) => {
    const logger = new ConsoleLogger('guest-04-contrasena-debil')
    logger.attachToPage(page)

    await page.goto('/reset-password?token=test-token-123')
    await page.waitForLoadState('networkidle')

    const passwordInput = page.getByLabel('Nueva contrasena')
    await passwordInput.fill('debil')

    const confirmInput = page.getByLabel('Confirmar')
    await confirmInput.fill('debil')

    const submitButton = page.getByRole('button', { name: /establecer contrasena/i })
    await submitButton.click()

    await page.waitForTimeout(1000)

    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()

    await logger.persist(false)
  })

  test('reset con contrasenas no coincidentes', async ({ page }) => {
    const logger = new ConsoleLogger('guest-04-no-coincidentes')
    logger.attachToPage(page)

    await page.goto('/reset-password?token=test-token-123')
    await page.waitForLoadState('networkidle')

    const passwordInput = page.getByLabel('Nueva contrasena')
    await passwordInput.fill('NuevaPass123!')

    const confirmInput = page.getByLabel('Confirmar')
    await confirmInput.fill('OtraPass456!')

    const submitButton = page.getByRole('button', { name: /establecer contrasena/i })
    await submitButton.click()

    await page.waitForTimeout(1000)

    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()

    await logger.persist(false)
  })

  test('sin token muestra enlace no valido', async ({ page }) => {
    const logger = new ConsoleLogger('guest-04-sin-token')
    logger.attachToPage(page)

    await page.goto('/reset-password')
    await page.waitForLoadState('networkidle')

    const invalidLink = page.getByText(/enlace no valido/i)
    await expect(invalidLink).toBeVisible()

    await logger.persist(false)
  })

  test('ver link para solicitar otro enlace', async ({ page }) => {
    const logger = new ConsoleLogger('guest-04-otro-enlace')
    logger.attachToPage(page)

    await page.goto('/reset-password')
    await page.waitForLoadState('networkidle')

    const requestLink = page.getByRole('link', { name: /solicitar otro enlace/i })
    await expect(requestLink).toBeVisible()

    await requestLink.click()
    await expect(page).toHaveURL(/\/forgot-password/)

    await logger.persist(false)
  })
})
