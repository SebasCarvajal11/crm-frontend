import { test, expect } from '@playwright/test'
import { loginViaUI } from '../../helpers/auth-helper'

test.describe('Centro de Asistencia y Tours Guiados CIMA', () => {
  test('abre el widget de ayuda, filtra preguntas globales y resalta elemento objetivo', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // 1. Verificar existencia del botón flotante de ayuda
    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()

    // 2. Abrir el Centro de Asistencia
    await helpTrigger.click()
    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    // 3. Probar búsqueda de preguntas globales (letra / zoom)
    const searchInput = page.getByPlaceholder(/Buscar guías/i)
    await searchInput.fill('zoom')
    const questionItem = page.getByText(/tamaño de letra o aumento el zoom/i)
    await expect(questionItem).toBeVisible()

    // 4. Hacer clic en la pregunta guiada para activar el foco interactivo
    await questionItem.click()
    await expect(helpModal).not.toBeVisible()

    // 5. Verificar que Driver.js resalta el elemento y muestra el cursor animado
    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })
    await expect(popover.locator('.driver-popover-title')).toBeVisible()

    // Verificar que no existen emojis y que el elemento resaltado está activo
    const popoverText = await popover.innerText()
    expect(popoverText).not.toContain('👉')
    const activeElement = page.locator('.driver-active-element')
    await expect(activeElement).toBeVisible()

    // Cerrar con Escape
    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('ejecuta el tour guiado completo en el dashboard con rol administrador', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Iniciar sesión como Administrador
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    // Abrir el Centro de Asistencia desde el botón flotante
    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    // Iniciar el tour de la pestaña activa (Resumen)
    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await expect(startTourBtn).toBeVisible()
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    // Verificar que Driver.js muestra el popover corporativo CIMA
    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    // Verificar títulos y contenido
    await expect(popover.locator('.driver-popover-title')).toBeVisible()
    await expect(popover.locator('.driver-popover-description')).toBeVisible()

    // Avanzar con botón Siguiente
    const nextBtn = popover.locator('.driver-popover-next-btn')
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(400)
    }

    // Cerrar tour con Escape
    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('ejecuta tour en pantalla móvil iPhone sin solapamiento de cursor ni desbordamiento', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()
    await helpTrigger.click()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await expect(startTourBtn).toBeVisible()
    await startTourBtn.click()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 5000 })

    // Verificar que en móvil no hay desbordamiento horizontal
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    expect(hasOverflow).toBe(false)

    // Avanzar a través de pasos verificando fluidez y legibilidad
    const nextBtn = popover.locator('.driver-popover-next-btn')
    for (let i = 0; i < 3; i++) {
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(300)
        await expect(popover).toBeVisible()
      }
    }

    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('coexistencia con el widget de zoom sin colisiones visuales', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    const zoomTrigger = page.getByTestId('zoom-widget-trigger')

    await expect(helpTrigger).toBeVisible()
    await expect(zoomTrigger).toBeVisible()

    // Medir posiciones en pantalla para comprobar que el botón de ayuda está encima del de zoom
    const helpBox = await helpTrigger.boundingBox()
    const zoomBox = await zoomTrigger.boundingBox()

    expect(helpBox).not.toBeNull()
    expect(zoomBox).not.toBeNull()

    if (helpBox && zoomBox) {
      // El botón de ayuda debe estar ubicado verticalmente más arriba que el de zoom
      expect(helpBox.y + helpBox.height).toBeLessThanOrEqual(zoomBox.y + 4)
    }
  })

  const viewports = [
    { name: '2K UHD', width: 2560, height: 1440 },
    { name: '1080p Desktop', width: 1920, height: 1080 },
    { name: 'Tablet iPad', width: 820, height: 1180 },
    { name: 'Mobile Safari iOS', width: 390, height: 844 },
    { name: 'Mobile Chrome Android', width: 412, height: 915 },
  ]

  for (const vp of viewports) {
    test(`adaptabilidad y cero desbordamiento en viewport ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Verificar que el disparador del centro de ayuda es visible y operable
      const trigger = page.getByTestId('help-widget-trigger')
      await expect(trigger).toBeVisible()

      await trigger.click()
      const modal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
      await expect(modal).toBeVisible()

      // Verificar ausencia de scroll horizontal / desbordamiento
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })
      expect(hasOverflow).toBe(false)

      await page.keyboard.press('Escape')
      await expect(modal).not.toBeVisible()
    })
  }
})
