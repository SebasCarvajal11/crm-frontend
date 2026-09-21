import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/7716f2ab-0cd2-4f33-8081-7796e156df34/screenshots'
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const VIEWPORTS = [
  { name: '2k-uhd', width: 2560, height: 1440, isMobile: false },
  { name: '1080p-fhd', width: 1920, height: 1080, isMobile: false },
  { name: 'tablet', width: 768, height: 1024, isMobile: false },
  { name: 'mobile', width: 375, height: 667, isMobile: true },
]

test.describe('Verificación de coherencia gráfica y responsividad en 4 viewports', () => {
  for (const vp of VIEWPORTS) {
    test(`Visual y responsividad en ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })

      await page.goto('/login')
      await page.getByLabel('Correo').fill('gerente@cima.dev')
      await page.locator('input#password').fill('Demo123!')
      await page.getByRole('button', { name: 'Entrar' }).click()
      await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
      await page.waitForLoadState('networkidle')

      // Verificar que no haya overflow horizontal en body
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBe(false)

      // Screenshot inicial del dashboard
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `dashboard-${vp.name}.png`),
        fullPage: false,
      })

      // En desktop/tablet validar navegación de pestañas
      if (!vp.isMobile) {
        const collabBtn = page.locator('aside:visible nav[aria-label="Navegacion principal"] button:has-text("Colaboración")')
        await collabBtn.click()
        await page.locator('button:has-text("Nuevo Proyecto"), button:has-text("Nuevo proyecto")').first().waitFor({ state: 'visible', timeout: 10_000 })

        // Screenshot de colaboración retenida
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `collab-${vp.name}.png`),
          fullPage: false,
        })
      }
    })
  }
})
