import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve(
  'C:/Users/27seb/.gemini/antigravity/brain/44ea48bf-982d-4b61-8139-950a86d14ae2/screenshots'
)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test.describe('Verificación de Pestaña Resumen por Rol', () => {
  test('1. Admin - Resumen completo con todas las secciones de administración', async ({
    page,
  }) => {
    // 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('admin@cima.dev')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Admin123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(2000)

    // Sección Tu cuenta
    await expect(page.getByText('Tu cuenta')).toBeVisible()
    await expect(page.getByRole('main').getByText('admin@cima.dev')).toBeVisible()

    // Documentación Swagger DEBE HABER SIDO ELIMINADA
    await expect(page.getByText('Documentación')).not.toBeVisible()
    await expect(page.getByText('Swagger UI')).not.toBeVisible()

    // Últimas notificaciones
    await expect(page.getByText('Últimas notificaciones')).toBeVisible()

    // Métricas Clave de Clientes y Marketing
    await expect(page.getByText('Métricas Clave de Clientes y Marketing')).toBeVisible()
    await expect(page.getByText('Clientes Totales')).toBeVisible()
    await expect(page.getByText('Campañas Activas')).toBeVisible()

    // Secciones exclusivas Admin
    await expect(page.getByText('Tareas bloqueadas (Cuellos de botella)')).toBeVisible()
    await expect(page.getByText('Últimos proyectos')).toBeVisible()
    await expect(page.getByText('Últimos clientes')).toBeVisible()
    await expect(page.getByText('Carga de trabajo por trabajador')).toBeVisible()
    await expect(page.getByText('Ranking de Clientes por Proyectos')).toBeVisible()

    // Sección exclusiva de Worker NO debe verse en Admin
    await expect(page.getByText('Mis tareas pendientes')).not.toBeVisible()

    // Captura Desktop 1920x1080
    await page.screenshot({
      path: path.join(outputDir, 'overview-admin-desktop-1920.png'),
      fullPage: true,
    })

    // Probar Desktop Pequeño (1024x768)
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(outputDir, 'overview-admin-desktop-1024.png'),
      fullPage: true,
    })

    // Probar Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(outputDir, 'overview-admin-tablet-768.png'),
      fullPage: true,
    })

    // Probar Móvil (375x812)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(outputDir, 'overview-admin-mobile-375.png'),
      fullPage: true,
    })
  })

  test('2. Worker - Resumen con Mis tareas pendientes y sin secciones exclusivas de Admin', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('ana.martinez@cima.dev')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(2000)

    // Sección Tu cuenta
    await expect(page.getByText('Tu cuenta')).toBeVisible()
    await expect(page.getByRole('main').getByText('ana.martinez@cima.dev')).toBeVisible()

    // Documentación no debe existir
    await expect(page.getByText('Swagger UI')).not.toBeVisible()

    // Notificaciones y Métricas presentes
    await expect(page.getByText('Últimas notificaciones')).toBeVisible()
    await expect(page.getByText('Métricas Clave de Clientes y Marketing')).toBeVisible()

    // Mis tareas pendientes DEBE estar presente
    await expect(page.getByText('Mis tareas pendientes')).toBeVisible()

    // Secciones exclusivas de Admin NO deben estar presentes
    await expect(page.getByText('Tareas bloqueadas (Cuellos de botella)')).not.toBeVisible()
    await expect(page.getByText('Últimos clientes')).not.toBeVisible()
    await expect(page.getByText('Carga de trabajo por trabajador')).not.toBeVisible()
    await expect(page.getByText('Ranking de Clientes por Proyectos')).not.toBeVisible()

    // Captura Worker Desktop
    await page.screenshot({
      path: path.join(outputDir, 'overview-worker-desktop-1440.png'),
      fullPage: true,
    })

    // Captura Worker Mobile
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(outputDir, 'overview-worker-mobile-375.png'),
      fullPage: true,
    })
  })

  test('3. Client - Pestaña Resumen oculta y redirige a Colaboración', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('contacto@restauranteelbuensabor.com')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(1500)

    // En el sidebar no existe Resumen
    const navButtons = await page
      .locator('aside:visible nav[aria-label="Navegacion principal"] button')
      .allInnerTexts()
    const cleanedTabs = navButtons.map((t) => t.trim())
    expect(cleanedTabs).not.toContain('Resumen')

    // Intento de navegación forzada a ?tab=overview
    await page.goto('/dashboard?tab=overview')
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('tab=collab')
  })
})
