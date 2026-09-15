import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/44ea48bf-982d-4b61-8139-950a86d14ae2/screenshots')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test.describe('Verificación de Pestañas, Roles y Sidebar Colapsado', () => {
  test('1. Admin - Orden de pestañas y colapso/despliegue en Desktop Grande (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('admin@cima.dev')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Admin123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    // Validar orden de pestañas
    const navButtons = await page.locator('aside:visible nav[aria-label="Navegacion principal"] button').allInnerTexts()
    const cleanedTabs = navButtons.map(t => t.trim())
    console.log('Tabs Admin:', cleanedTabs)
    expect(cleanedTabs).toEqual(['Resumen', 'Colaboración', 'Marketing', 'Analítica', 'Administración'])

    // Screenshot expandido
    await page.screenshot({ path: path.join(outputDir, 'admin-desktop-large-expanded.png'), fullPage: false })

    // Colapsar sidebar
    const collapseBtn = page.getByRole('button', { name: 'Colapsar barra lateral' })
    await expect(collapseBtn).toBeVisible()
    await collapseBtn.click()
    await page.waitForTimeout(600)

    // Screenshot colapsado
    await page.screenshot({ path: path.join(outputDir, 'admin-desktop-large-collapsed.png'), fullPage: false })

    // Desplegar nuevamente
    const expandBtn = page.getByRole('button', { name: 'Expandir barra lateral' })
    await expect(expandBtn).toBeVisible()
    await expandBtn.click()
    await page.waitForTimeout(600)
    await expect(page.getByRole('button', { name: 'Colapsar barra lateral' })).toBeVisible()
  })

  test('2. Admin - Desktop Pequeño (1024x768)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('admin@cima.dev')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Admin123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    await page.screenshot({ path: path.join(outputDir, 'admin-desktop-small-expanded.png'), fullPage: false })

    const collapseBtn = page.getByRole('button', { name: 'Colapsar barra lateral' })
    await collapseBtn.click()
    await page.waitForTimeout(600)

    await page.screenshot({ path: path.join(outputDir, 'admin-desktop-small-collapsed.png'), fullPage: false })
  })

  test('3. Admin - Tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('admin@cima.dev')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Admin123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    await page.screenshot({ path: path.join(outputDir, 'admin-tablet-expanded.png'), fullPage: false })

    const collapseBtn = page.getByRole('button', { name: 'Colapsar barra lateral' })
    await collapseBtn.click()
    await page.waitForTimeout(600)

    await page.screenshot({ path: path.join(outputDir, 'admin-tablet-collapsed.png'), fullPage: false })
  })

  test('4. Worker - Resumen presente y Administración oculta', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('ana.martinez@cima.dev')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    const navButtons = await page.locator('aside:visible nav[aria-label="Navegacion principal"] button').allInnerTexts()
    const cleanedTabs = navButtons.map(t => t.trim())
    console.log('Tabs Worker:', cleanedTabs)
    expect(cleanedTabs).toEqual(['Resumen', 'Colaboración', 'Marketing', 'Analítica'])
    expect(cleanedTabs).not.toContain('Administración')
  })

  test('5. Client - Resumen oculto, predeterminada Colaboración, vista Desktop y Móvil', async ({ page }) => {
    // Desktop 1440x900
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('contacto@restauranteelbuensabor.com')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    // Verificar que Resumen NO exista
    const navButtons = await page.locator('aside:visible nav[aria-label="Navegacion principal"] button').allInnerTexts()
    const cleanedTabs = navButtons.map(t => t.trim())
    console.log('Tabs Client:', cleanedTabs)
    expect(cleanedTabs).toEqual(['Colaboración'])
    expect(cleanedTabs).not.toContain('Resumen')
    expect(cleanedTabs).not.toContain('Administración')

    // Verificar que la pestaña activa sea Colaboración
    const collabBtn = page.getByRole('button', { name: 'Colaboración' })
    await expect(collabBtn).toBeVisible()
    await expect(collabBtn).toHaveAttribute('aria-current', 'page')

    // Captura Desktop Cliente
    await page.screenshot({ path: path.join(outputDir, 'client-desktop-large.png'), fullPage: false })

    // Intentar acceder a overview directamente por URL
    await page.goto('/dashboard?tab=overview')
    await page.waitForTimeout(1000)
    // Debe haber redirigido a tab=collab
    expect(page.url()).toContain('tab=collab')

    // Probar vista Móvil (375x812)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(outputDir, 'client-mobile-view.png'), fullPage: false })

    // Abrir menú móvil
    const menuBtn = page.getByRole('button', { name: 'Abrir menu' })
    await expect(menuBtn).toBeVisible()
    await menuBtn.click()
    await page.waitForTimeout(500)

    await page.screenshot({ path: path.join(outputDir, 'client-mobile-drawer.png'), fullPage: false })
  })
})
