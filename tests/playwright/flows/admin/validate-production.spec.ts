import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const PROD_URL = 'http://155.248.207.47'
const outputDir = path.resolve(
  'C:/Users/27seb/.gemini/antigravity/brain/d918f262-f0a5-475e-92f6-f97f5def471c/screenshots/production'
)

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test.describe('Validación visual y de negocio en Producción', () => {
  test.use({ baseURL: PROD_URL })

  test('Recorrido integral de usuario por todos los módulos en Producción', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 1. Inicio de sesión en producción
    await page.goto(`${PROD_URL}/login`)
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('**/dashboard**', { timeout: 20_000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 2. Módulo Resumen
    await page.screenshot({
      path: path.join(outputDir, '01-prod-resumen.png'),
      fullPage: true,
    })

    // 3. Módulo Colaboración - Tablero principal
    await page.locator('nav').getByRole('button', { name: /Colaboración/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '02-prod-collab-board.png'),
      fullPage: true,
    })

    // Abrir primer proyecto disponible
    const projectCard = page.locator('button[aria-label*="completado"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
    } else {
      await page.locator('[aria-label*="Abrir proyecto"]').first().click({ force: true })
    }
    await page.waitForTimeout(1500)

    // Subpestaña Tablero
    await page.screenshot({
      path: path.join(outputDir, '03-prod-collab-subtab-board.png'),
      fullPage: true,
    })

    // Subpestaña Conversación
    await page.getByRole('tab', { name: /Conversación/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '04-prod-collab-subtab-chat.png'),
      fullPage: true,
    })

    // Captura móvil para validar burbujas en viewport de smartphone
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: path.join(outputDir, '04b-prod-collab-chat-mobile.png'),
      fullPage: true,
    })
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(1000)

    // Subpestaña Brief
    await page.getByRole('tab', { name: /Brief/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '05-prod-collab-subtab-brief.png'),
      fullPage: true,
    })

    // Subpestaña Contrato
    await page.getByRole('tab', { name: /Contrato/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '06-prod-collab-subtab-contract.png'),
      fullPage: true,
    })

    // Subpestaña Solicitud de cambios
    await page.getByRole('tab', { name: /Solicitud de cambios/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '07-prod-collab-subtab-changes.png'),
      fullPage: true,
    })

    // Subpestaña Integrantes
    await page.getByRole('tab', { name: /Integrantes/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '08-prod-collab-subtab-members.png'),
      fullPage: true,
    })

    // Volver al listado de proyectos
    await page.getByRole('button', { name: /Proyectos/i }).click()
    await page.waitForTimeout(1000)

    // 4. Módulo Marketing
    await page.locator('nav').getByRole('button', { name: /Marketing/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '09-prod-marketing.png'),
      fullPage: true,
    })

    // 5. Módulo Analítica
    await page.locator('nav').getByRole('button', { name: /Analítica/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '10-prod-analytics.png'),
      fullPage: true,
    })

    // 6. Módulo Administración y Carrusel de Usuarios
    await page.locator('nav').getByRole('button', { name: /Administración/i }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outputDir, '11-prod-admin-full.png'),
      fullPage: true,
    })

    // Inspección enfocada del carrusel de usuarios
    const carouselSection = page.locator('[data-tour="admin-users-carousel"]')
    if (await carouselSection.isVisible()) {
      await carouselSection.screenshot({
        path: path.join(outputDir, '12-prod-admin-carousel.png'),
      })
    }
  })
})
