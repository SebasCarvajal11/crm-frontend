import { test, expect } from '@playwright/test'
import { loginViaUI } from '../../helpers/auth-helper'

test.describe('Módulo de Colaboración — Tours Guiados y Centro de Asistencia', () => {
  test('ejecuta tour del tablero general kanban con rol administrador', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    // Navegar a Colaboración
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    // Abrir widget de ayuda
    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    // Iniciar tour del tablero de proyectos
    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await expect(startTourBtn).toBeVisible()
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    // Verificar que el primer paso es el buscador de proyectos
    await expect(popover.locator('.driver-popover-title')).toContainText('Buscador de Proyectos')

    // Avanzar por los pasos del tablero principal
    const nextBtn = popover.locator('.driver-popover-next-btn')
    for (let i = 0; i < 4; i++) {
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(300)
        await expect(popover).toBeVisible()
      }
    }

    // Cerrar tour con Escape
    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('ejecuta tour completo en el espacio de trabajo conmutando subpestañas', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    // Ir a Colaboración y abrir la primera tarjeta de proyecto
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    // Localizar la primera tarjeta o buscar proyecto
    const firstCard = page.locator('[data-tour="collab-card-first"]').first()
    if (await firstCard.isVisible({ timeout: 4000 })) {
      await firstCard.click()
    } else {
      // Si no hay tarjeta visible inmediata, buscar y seleccionar uno
      const searchInput = page.getByPlaceholder(/Buscar por proyecto/i)
      if (await searchInput.isVisible()) {
        await searchInput.fill('CIMA')
        await page.waitForTimeout(600)
      }
    }

    // Esperar a que el espacio de trabajo esté presente
    const backBtn = page.locator('[data-tour="workspace-back-btn"]')
    await expect(backBtn).toBeVisible({ timeout: 10000 })

    // Abrir widget de ayuda dentro del proyecto
    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    // Iniciar el tour del espacio de trabajo
    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await expect(startTourBtn).toBeVisible()
    await startTourBtn.click()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    // Avanzar a través de las subpestañas del espacio de trabajo
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

  test('verifica que el rol cliente tiene tour adaptado sin acciones de administracion', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginViaUI(page, 'marketing@cafesierraalta.com', 'Demo123!')

    // Cliente es redirigido o entra a Colaboración
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    // El cliente NO debe ver el botón de crear proyecto
    const createBtn = page.locator('[data-tour="collab-create-btn"]')
    await expect(createBtn).not.toBeVisible()

    // Abrir ayuda y verificar preguntas de cliente
    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()
    await helpTrigger.click()

    // Pregunta de crear proyecto NO debe aparecer para el cliente
    const createQuestion = page.getByText(/Como creo un nuevo proyecto/i)
    await expect(createQuestion).not.toBeVisible()

    await page.keyboard.press('Escape')
  })

  test('adaptabilidad y cero desbordamiento horizontal en espacio de trabajo movil iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    // Verificar ausencia de desbordamiento horizontal en la pantalla principal
    let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(hasOverflow).toBe(false)

    // Abrir un proyecto para validar el espacio de trabajo en móvil
    const firstCard = page.locator('[data-tour="collab-card-first"]').first()
    if (await firstCard.isVisible({ timeout: 4000 })) {
      await firstCard.click()
      await page.waitForTimeout(600)

      hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      expect(hasOverflow).toBe(false)
    }
  })
})
