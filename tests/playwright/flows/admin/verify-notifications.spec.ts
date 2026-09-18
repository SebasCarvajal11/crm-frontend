import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/eb94f670-8c42-40f0-94f1-5d3670e9372d/screenshots')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test.describe('Estandarización y Visualización del Sistema de Notificaciones CIMA', () => {
  test('1. Admin - Bandeja de Notificaciones y navegación profunda en Desktop (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('admin@cima.dev')
    await page.locator('input#password').fill('Admin123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    // Navegar a la pestaña de notificaciones
    await page.goto('/dashboard?tab=notifications')
    await page.waitForTimeout(1000)

    const header = page.getByRole('heading', { name: /Notificaciones/i })
    await expect(header).toBeVisible()

    await page.screenshot({
      path: path.join(outputDir, 'notifications-desktop-1080p.png'),
      fullPage: false,
    })
  })

  test('2. Admin - Renderizado en Pantalla Grande 2K (2560x1440)', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('admin@cima.dev')
    await page.locator('input#password').fill('Admin123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    await page.goto('/dashboard?tab=notifications')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: path.join(outputDir, 'notifications-desktop-2k.png'),
      fullPage: false,
    })
  })

  test('3. Worker - Tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('ana.martinez@cima.dev')
    await page.locator('input#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    // Abrir menú lateral y navegar a notificaciones
    const menuBtn = page.getByRole('button', { name: 'Abrir menu' })
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
      await page.waitForTimeout(400)
    }

    const notifBtn = page.getByRole('button', { name: /Notificaciones/i })
    if (await notifBtn.isVisible()) {
      await notifBtn.click()
      await page.waitForTimeout(1000)
    }

    await page.screenshot({
      path: path.join(outputDir, 'notifications-tablet.png'),
      fullPage: false,
    })
  })

  test('4. Client - Dispositivo Móvil (390x844 - Safari iOS / Chrome Android)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('contacto@restauranteelbuensabor.com')
    await page.locator('input#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    // Abrir menú lateral móvil
    const menuBtn = page.getByRole('button', { name: 'Abrir menu' })
    await expect(menuBtn).toBeVisible()
    await menuBtn.click()
    await page.waitForTimeout(500)

    // Abrir dropdown del perfil / pie de barra lateral móvil
    const profileBtn = page.locator('aside:visible button').filter({ hasText: /contacto@restauranteelbuensabor\.com/i })
    if (await profileBtn.isVisible()) {
      await profileBtn.click()
      await page.waitForTimeout(400)
    }

    await page.screenshot({
      path: path.join(outputDir, 'notifications-mobile-drawer.png'),
      fullPage: false,
    })
  })
})
