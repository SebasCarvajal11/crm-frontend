import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/7716f2ab-0cd2-4f33-8081-7796e156df34/screenshots')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test.describe('Admin - Gestor y Explorador de Archivos por Cliente (Gobernanza de Almacenamiento)', () => {
  test('1. Debe visualizarse el Gestor de Archivos en la consola de Administración con métricas de cuota', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForLoadState('networkidle')

    // Navegar a la pestaña Administración
    const adminTab = page.locator('aside button').filter({ hasText: 'Administración' }).first()
    await expect(adminTab).toBeVisible()
    await adminTab.click()
    await page.waitForTimeout(1500)

    // Validar título y descripción del Gestor de Archivos
    const title = page.getByText('Gestor y Explorador de Archivos por Cliente')
    await expect(title).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Estructura jerárquica (Cliente → Proyectos → Categorías)')).toBeVisible()

    // Validar tarjetas de métricas del gestor
    await expect(page.getByText('Clientes con Archivos')).toBeVisible()
    await expect(page.getByText('Proyectos Registrados')).toBeVisible()
    await expect(page.getByText('Espacio Activo en Nube')).toBeVisible()

    // Scroll al gestor de archivos
    await title.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Screenshot inicial del gestor de archivos
    await page.screenshot({ path: path.join(outputDir, '13-admin-file-manager-overview.png'), fullPage: false })
  })

  test('2. Debe permitir seleccionar cliente, explorar proyectos y visualizar categorías de archivos', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForLoadState('networkidle')

    // Ir a pestaña Administración
    await page.locator('aside button').filter({ hasText: 'Administración' }).first().click()
    await page.waitForTimeout(1500)

    // Esperar carga de clientes en el panel lateral izquierdo
    const clientItems = page.getByTestId('storage-client-item')
    await expect(clientItems.first()).toBeVisible({ timeout: 15_000 })
    
    // Seleccionar cliente con archivos (ej. GreenLoop Logistics o el primero con archivos)
    const clientWithFiles = page.getByTestId('storage-client-item').filter({ hasText: 'GreenLoop Logistics' })
    if (await clientWithFiles.count() > 0) {
      await clientWithFiles.first().scrollIntoViewIfNeeded()
      await clientWithFiles.first().click()
    } else {
      await clientItems.first().scrollIntoViewIfNeeded()
      await clientItems.first().click()
    }
    await page.waitForTimeout(1000)

    // Validar que la tabla de archivos y filtros de categoría están presentes
    await expect(page.getByRole('button', { name: /Todos \(/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Contratos y Adendas/i })).toBeVisible()

    // Screenshot detallado de archivos del proyecto con tabla poblada
    await page.screenshot({ path: path.join(outputDir, '14-admin-file-manager-project-files.png'), fullPage: false })

    // Si existen archivos con botón de depurar, validar apertura del modal de confirmación
    const purgeButtons = page.locator('button[title="Depurar para liberar espacio"]')
    const count = await purgeButtons.count()
    if (count > 0) {
      await purgeButtons.first().click()
      await expect(page.getByText('Depurar Archivo para Liberar Espacio')).toBeVisible()
      await expect(page.getByText('Espacio que se liberará:')).toBeVisible()
      await page.screenshot({ path: path.join(outputDir, '15-admin-file-manager-purge-dialog.png'), fullPage: false })
      await page.getByRole('button', { name: 'Cancelar' }).click()
    }
  })
})
