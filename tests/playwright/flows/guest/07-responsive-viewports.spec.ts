import { test, expect } from '@playwright/test'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Responsive Viewports - Layout Integrity & Zero Overflow', () => {
  test('landing page no genera scroll horizontal ni recortes', async ({ page }) => {
    const logger = new ConsoleLogger('responsive-landing-overflow')
    logger.attachToPage(page)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hasHorizontalOverflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth > window.innerWidth
    })

    expect(hasHorizontalOverflow).toBe(false)

    const mainHeading = page.getByRole('heading', { name: /CRM CIMA/i })
    await expect(mainHeading).toBeVisible()

    await logger.persist(false)
  })

  test('pagina de login ajusta correctamente y mantiene inputs accesibles', async ({ page }) => {
    const logger = new ConsoleLogger('responsive-login-layout')
    logger.attachToPage(page)

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const hasHorizontalOverflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth > window.innerWidth
    })

    expect(hasHorizontalOverflow).toBe(false)

    const emailInput = page.getByLabel(/correo electrónico/i)
    await expect(emailInput).toBeVisible()

    const submitBtn = page.getByRole('button', { name: /iniciar sesión/i })
    await expect(submitBtn).toBeVisible()

    await logger.persist(false)
  })

  test('la tipografia base respeta la linea corporativa Montserrat', async ({ page }) => {
    const logger = new ConsoleLogger('responsive-font-family')
    logger.attachToPage(page)

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily
    })

    expect(fontFamily.toLowerCase()).toContain('montserrat')

    await logger.persist(false)
  })
})
