import { test, expect } from '@playwright/test'
import { loginViaUI } from '../../helpers/auth-helper'

test.describe('Módulo de Colaboración — Tours Guiados y Centro de Asistencia', () => {
  test('ejecuta tour del tablero general kanban con rol administrador', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
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
    await expect(popover.locator('.driver-popover-title')).toContainText('Buscador de Proyectos')

    const nextBtn = popover.locator('.driver-popover-next-btn')
    for (let i = 0; i < 4; i++) {
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(300)
        await expect(popover).toBeVisible()
      }
    }

    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('ejecuta transicion continua de kanban a espacio de trabajo al avanzar en la tarjeta', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await startTourBtn.click()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    const nextBtn = popover.locator('.driver-popover-next-btn')
    // Avanzar hasta el paso de la tarjeta (paso 5)
    for (let i = 0; i < 4; i++) {
      await nextBtn.click()
      await page.waitForTimeout(300)
    }

    // Al hacer clic en siguiente en la tarjeta, abre automáticamente el espacio de trabajo
    await expect(popover.locator('.driver-popover-title')).toContainText('Abrir Espacio de Trabajo')
    await nextBtn.click()

    // Debe transicionar al encabezado del espacio de trabajo
    const workspaceHeader = page.locator('[data-tour="workspace-project-header"]')
    await expect(workspaceHeader).toBeVisible({ timeout: 8000 })
    await expect(popover.locator('.driver-popover-title')).toContainText('Informacion del Proyecto')

    await page.keyboard.press('Escape')
  })

  test('ejecuta tour completo en el espacio de trabajo conmutando subpestañas', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('[data-tour="collab-card-first"]').first()
    if (await firstCard.isVisible({ timeout: 4000 })) {
      await firstCard.click()
    } else {
      const searchInput = page.getByPlaceholder(/Buscar por proyecto/i)
      if (await searchInput.isVisible()) {
        await searchInput.fill('CIMA')
        await page.waitForTimeout(600)
      }
    }

    const backBtn = page.locator('[data-tour="workspace-back-btn"]')
    await expect(backBtn).toBeVisible({ timeout: 10000 })

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await expect(startTourBtn).toBeVisible()
    await startTourBtn.click()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    const nextBtn = popover.locator('.driver-popover-next-btn')
    for (let step = 0; step < 8; step++) {
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(400)
        await expect(popover).toBeVisible()
      }
    }

    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('conmuta entre preguntas de la seccion y todas las guias en el centro de ayuda', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const sectionBtn = page.getByRole('button', { name: /De esta sección/i })
    const allGuidesBtn = page.getByRole('button', { name: /Todas las guías/i })
    await expect(sectionBtn).toBeVisible()
    await expect(allGuidesBtn).toBeVisible()

    // Cambiar a todas las guías
    await allGuidesBtn.click()
    await page.waitForTimeout(200)

    // Debe mostrar preguntas de otras secciones
    const searchInput = page.locator('#cima-help-search')
    await searchInput.fill('contrato')
    await expect(page.getByText(/Donde reviso y firmo el contrato/i)).toBeVisible()

    await page.keyboard.press('Escape')
  })

  test('verifica que el rol cliente tiene tour adaptado sin acciones de administracion', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'marketing@cafesierraalta.com', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const createBtn = page.locator('[data-tour="collab-create-btn"]')
    await expect(createBtn).not.toBeVisible()

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()
    await helpTrigger.click()

    const createQuestion = page.getByText(/Como creo un nuevo proyecto/i)
    await expect(createQuestion).not.toBeVisible()

    await page.keyboard.press('Escape')
  })

  test('adaptabilidad y cero desbordamiento horizontal en espacio de trabajo movil iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(hasOverflow).toBe(false)

    const firstCard = page.locator('[data-tour="collab-card-first"]').first()
    if (await firstCard.isVisible({ timeout: 4000 })) {
      await firstCard.click()
      await page.waitForTimeout(600)

      hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      expect(hasOverflow).toBe(false)
    }
  })

  test('auto-scroll centra pestañas desbordadas en movil durante el tour sin desborde ni cursor recortado', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('[data-tour="collab-card-first"]').first()
    if (await firstCard.isVisible({ timeout: 4000 })) {
      await firstCard.click()
    }
    await page.waitForSelector('[data-tour="workspace-back-btn"]', { timeout: 10000 })

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await startTourBtn.click()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    const nextBtn = popover.locator('.driver-popover-next-btn')

    // Avanzar hasta la pestaña de Contratos (que en móvil originalmente quedaba a la derecha fuera de pantalla)
    for (let step = 0; step < 13; step++) {
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(400)
      }
    }

    // Verificar que el botón de la pestaña activa del paso actual está dentro del viewport horizontal
    const activeTab = page.locator('[data-tour="workspace-tab-change-requests"]')
    await expect(activeTab).toBeVisible()
    const box = await activeTab.boundingBox()
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(390)
    }

    // Verificar que el cursor (si existe) esté dentro del viewport
    const cursor = page.locator('#cima-tour-cursor')
    if (await cursor.isVisible()) {
      const cursorBox = await cursor.boundingBox()
      if (cursorBox) {
        expect(cursorBox.x).toBeGreaterThanOrEqual(0)
        expect(cursorBox.x + cursorBox.width).toBeLessThanOrEqual(390)
      }
    }

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(hasOverflow).toBe(false)

    await page.keyboard.press('Escape')
  })
})
