import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/7716f2ab-0cd2-4f33-8081-7796e156df34/screenshots')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test.describe('Verificación de Carga Instantánea de Texturas y Eliminación de Pop-in', () => {
  test('1. Validar preloads en <head> y carga de textura en Login', async ({ page }) => {
    const failedRequests: string[] = []
    page.on('requestfailed', request => {
      failedRequests.push(request.url())
    })

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Verificar preload links en DOM
    const appPreload = page.locator('link[rel="preload"][href="/backgrounds/app-texture.webp"]')
    const sidebarPreload = page.locator('link[rel="preload"][href="/backgrounds/sidebar-texture.webp"]')
    await expect(appPreload).toHaveCount(1)
    await expect(sidebarPreload).toHaveCount(1)

    // Verificar que no hubo fallos en peticiones de imágenes
    expect(failedRequests.filter(url => url.includes('.webp'))).toHaveLength(0)

    // Capturar screenshot de Login con textura
    await page.screenshot({ path: path.join(outputDir, '11-login-texture-smooth.png'), fullPage: false })
  })

  test('2. Validar Dashboard y Sidebar con textura renderizada sin pop-in', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForLoadState('networkidle')

    // Validar presencia y opacidad del layer de fondo en AppShell
    const appBgLayer = page.locator('div.min-h-screen > div[aria-hidden="true"]').first()
    await expect(appBgLayer).toBeAttached()
    await expect(appBgLayer).toHaveCSS('opacity', '1')

    // Validar presencia y opacidad del layer de textura en Sidebar
    const sidebarBgLayer = page.locator('aside[aria-label="Barra de navegacion lateral"] > div[aria-hidden="true"]')
    await expect(sidebarBgLayer).toBeAttached()
    await expect(sidebarBgLayer).toHaveCSS('opacity', '1')

    // Screenshot del dashboard
    await page.screenshot({ path: path.join(outputDir, '12-dashboard-texture-smooth.png'), fullPage: false })
  })
})
