import { test, expect } from '@playwright/test'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Guest - Landing Page', () => {
  test('ver pagina de inicio', async ({ page }) => {
    const logger = new ConsoleLogger('guest-01-landing')
    logger.attachToPage(page)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const heading = page.getByRole('heading', { name: /CRM CIMA/i })
    await expect(heading).toBeVisible()

    await logger.persist(false)
  })

  test('ver link a login', async ({ page }) => {
    const logger = new ConsoleLogger('guest-01-link-login')
    logger.attachToPage(page)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loginLink = page.getByRole('link', { name: /iniciar sesi(?:o|ó)n/i })
    await expect(loginLink).toBeVisible()

    await logger.persist(false)
  })

  test('ver link a recuperar contrasena', async ({ page }) => {
    const logger = new ConsoleLogger('guest-01-link-forgot')
    logger.attachToPage(page)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const forgotLink = page.getByRole('link', { name: /olvidaste.*contrase(?:n|ñ)a/i })
    await expect(forgotLink).toBeVisible()

    await logger.persist(false)
  })

  test('navegar a login desde landing', async ({ page }) => {
    const logger = new ConsoleLogger('guest-01-navegar-login')
    logger.attachToPage(page)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loginLink = page.getByRole('link', { name: /iniciar sesi(?:o|ó)n/i })
    await loginLink.click()

    await expect(page).toHaveURL(/\/login/)

    await logger.persist(false)
  })
})
