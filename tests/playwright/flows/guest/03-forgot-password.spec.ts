import { test, expect } from '@playwright/test'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Guest - Recuperacion de Contrasena', () => {
  test('acceder a pagina de recuperacion', async ({ page }) => {
    const logger = new ConsoleLogger('guest-03-acceder-forgot')
    logger.attachToPage(page)

    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    const emailInput = page.getByLabel('Correo')
    const submitButton = page.getByRole('button', { name: /enviar enlace/i })

    await expect(emailInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    await logger.persist(false)
  })

  test('solicitar reset de contrasena', async ({ page }) => {
    const logger = new ConsoleLogger('guest-03-solicitar-reset')
    logger.attachToPage(page)

    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    const emailInput = page.getByLabel('Correo')
    await emailInput.fill('admin@cima.dev')

    const submitButton = page.getByRole('button', { name: /enviar enlace/i })
    await submitButton.click()

    await page.waitForTimeout(2000)

    const successAlert = page.getByText(/solicitud registrada/i)
    await expect(successAlert).toBeVisible()

    await logger.persist(false)
  })

  test('email invalido muestra error de validacion', async ({ page }) => {
    const logger = new ConsoleLogger('guest-03-email-invalido')
    logger.attachToPage(page)

    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    const emailInput = page.getByLabel('Correo')
    await emailInput.fill('email-invalido')

    const submitButton = page.getByRole('button', { name: /enviar enlace/i })
    await submitButton.click()

    await page.waitForTimeout(1000)

    const isValid = await emailInput.evaluate((el) => (el as HTMLInputElement).validity.valid)
    expect(isValid).toBe(false)

    await logger.persist(false)
  })

  test('ver link para volver a login', async ({ page }) => {
    const logger = new ConsoleLogger('guest-03-volver-login')
    logger.attachToPage(page)

    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    const backLink = page.getByRole('link', { name: /volver.*inicio.*sesi(?:o|ó)n/i }).first()
    await expect(backLink).toBeVisible()

    await backLink.click()
    await expect(page).toHaveURL(/\/login/)

    await logger.persist(false)
  })
})
