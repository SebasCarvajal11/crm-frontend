import { test, expect } from '@playwright/test'
import { loginViaUI } from '../../helpers/auth-helper'

test.describe('Módulo de Administración — Tour Guiado y Centro de Asistencia', () => {
  test('ejecuta tour completo de administracion en desktop con 17 pasos', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await expect(startTourBtn).toBeVisible()
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })
    await expect(popover.locator('.driver-popover-title')).toContainText('Consola de Administracion')

    const nextBtn = popover.locator('.driver-popover-next-btn')

    // Recorrer los 17 pasos completos de la consola de administración
    for (let i = 0; i < 16; i++) {
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(300)
        await expect(popover).toBeVisible()
      }
    }

    // Verificar que alcanzamos el paso final de invitar administrador
    await expect(popover.locator('.driver-popover-title')).toContainText('Otorgar Privilegios de Administrador')

    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('conmuta y busca preguntas contextuales de administracion en el centro de ayuda', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    // Verificar preguntas especializadas de administración
    await expect(page.getByText(/Como invito a un nuevo cliente/i)).toBeVisible()
    await expect(page.getByText(/Como registro un nuevo colaborador/i)).toBeVisible()

    // Búsqueda específica
    const searchInput = page.locator('#cima-help-search')
    await searchInput.fill('cuota')
    await expect(page.getByText(/Como superviso el consumo de almacenamiento/i)).toBeVisible()

    // Hacer clic en una pregunta para resaltar el objetivo
    await page.getByText(/Como superviso el consumo de almacenamiento/i).click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })
    await expect(popover.locator('.driver-popover-title')).toContainText(
      'Como superviso el consumo de almacenamiento'
    )

    await page.keyboard.press('Escape')
  })

  test('responsividad móvil iPhone sin desbordamiento horizontal durante el tour de administracion', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    // Verificar ancho de documento en móvil
    let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(hasOverflow).toBe(false)

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await startTourBtn.click()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    const nextBtn = popover.locator('.driver-popover-next-btn')

    // Avanzar a través de varias secciones en móvil (KPIs, almacenamiento, archivos, tabla de usuarios)
    for (let step = 0; step < 12; step++) {
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(350)
      }
    }

    // Verificar que el cursor (si se muestra) no queda fuera de la pantalla
    const cursor = page.locator('#cima-tour-cursor')
    if (await cursor.isVisible()) {
      const cursorBox = await cursor.boundingBox()
      if (cursorBox) {
        expect(cursorBox.x).toBeGreaterThanOrEqual(0)
        expect(cursorBox.x + cursorBox.width).toBeLessThanOrEqual(390)
      }
    }

    hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(hasOverflow).toBe(false)

    await page.keyboard.press('Escape')
  })

  test('restringe el acceso a la consola de administracion para rol cliente', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'marketing@cafesierraalta.com', 'Demo123!')

    // El cliente no debe tener la pestaña Administración en el menú lateral
    const adminNavBtn = page.getByRole('button', { name: /^Administración$/i })
    await expect(adminNavBtn).not.toBeVisible()

    // Abrir el centro de ayuda y verificar que no hay preguntas de administración en su contexto
    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    await expect(page.getByText(/Como invito a un nuevo cliente/i)).not.toBeVisible()
    await expect(page.getByText(/Otorgar privilegios de administrador/i)).not.toBeVisible()

    await page.keyboard.press('Escape')
  })
})
