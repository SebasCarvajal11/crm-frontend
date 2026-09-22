import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/08be4eea-124e-46c0-9b97-1def1d528678/screenshots')
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

    const adminTab = page.locator('aside button').filter({ hasText: 'Administración' }).first()
    await expect(adminTab).toBeVisible()
    await adminTab.click()
    await page.waitForTimeout(1500)

    const title = page.getByText('Gestor y Explorador de Archivos por Cliente')
    await expect(title).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Estructura jerárquica (Cliente → Proyectos → Categorías)')).toBeVisible()

    await expect(page.getByText('Clientes con Archivos')).toBeVisible()
    await expect(page.getByText('Proyectos Registrados')).toBeVisible()
    await expect(page.getByText('Espacio Activo en Nube')).toBeVisible()

    await title.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

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

    await page.locator('aside button').filter({ hasText: 'Administración' }).first().click()
    await page.waitForTimeout(1500)

    const clientItems = page.getByTestId('storage-client-item')
    await expect(clientItems.first()).toBeVisible({ timeout: 15_000 })

    const clientWithFiles = page.getByTestId('storage-client-item').filter({ hasText: 'GreenLoop Logistics' })
    if ((await clientWithFiles.count()) > 0) {
      await clientWithFiles.first().scrollIntoViewIfNeeded()
      await clientWithFiles.first().click()
    } else {
      await clientItems.first().scrollIntoViewIfNeeded()
      await clientItems.first().click()
    }
    await page.waitForTimeout(1000)

    await expect(page.getByRole('button', { name: /Todos \(/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Contratos y Adendas/i })).toBeVisible()

    await page.screenshot({ path: path.join(outputDir, '14-admin-file-manager-project-files.png'), fullPage: false })

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

  test('3. Debe ofrecer descarga masiva (.zip), selección múltiple y recomendación preventiva al vaciar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForLoadState('networkidle')

    await page.locator('aside button').filter({ hasText: 'Administración' }).first().click()
    await page.waitForTimeout(1500)

    const clientItems = page.getByTestId('storage-client-item')
    await expect(clientItems.first()).toBeVisible({ timeout: 15_000 })
    const clientWithFiles = page.getByTestId('storage-client-item').filter({ hasText: 'GreenLoop Logistics' })
    if ((await clientWithFiles.count()) > 0) {
      await clientWithFiles.first().click()
    } else {
      await clientItems.first().click()
    }
    await page.waitForTimeout(1000)

    const downloadProjectBtn = page.getByRole('button', { name: /Descargar Proyecto \(\.zip\)/i })
    await expect(downloadProjectBtn).toBeVisible()

    const headerCheckbox = page.getByRole('checkbox', { name: /Seleccionar todos/i })
    if (await headerCheckbox.isVisible()) {
      await headerCheckbox.click()
      await page.waitForTimeout(400)
      await expect(page.getByText(/seleccionado/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /Descargar lote \(\.zip\)/i })).toBeVisible()

      await page.screenshot({ path: path.join(outputDir, '16-admin-file-manager-multi-selection.png'), fullPage: false })

      await page.getByRole('button', { name: 'Limpiar selección' }).click()
      await page.waitForTimeout(300)
    }

    const emptyBtn = page.getByRole('button', { name: /Vaciar archivos/i })
    if (await emptyBtn.isVisible()) {
      await emptyBtn.click()
      await expect(page.getByText('Vaciar Archivos del Proyecto')).toBeVisible()
      await expect(page.getByText(/Recomendación de seguridad \(Google Drive\)/i)).toBeVisible()
      await expect(page.getByText(/Te sugerimos descargar un respaldo comprimido \(\.zip\)/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /Solo Descargar \(\.zip\)/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Descargar y Vaciar/i })).toBeVisible()

      await page.screenshot({ path: path.join(outputDir, '17-admin-file-manager-preventive-purge-dialog.png'), fullPage: false })

      await page.getByRole('button', { name: 'Cancelar' }).click()
    }
  })
})
