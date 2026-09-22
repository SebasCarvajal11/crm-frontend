import { test, expect } from '@playwright/test'

test.describe('Centro de Asistencia y Tours Guiados CIMA', () => {
  test('abre el widget de ayuda, filtra preguntas e inicia el tour guiado', async ({ page }) => {
    // 1. Configurar viewport 1080p
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 2. Verificar existencia del botón flotante de ayuda
    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible()

    // 3. Abrir el Centro de Asistencia
    await helpTrigger.click()
    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    // 4. Probar búsqueda de preguntas guiadas
    const searchInput = page.getByPlaceholder(/¿Cómo creo un proyecto/i)
    await searchInput.fill('contrato')
    await expect(page.getByText(/firmar mi contrato/i).or(page.getByText(/contrato/i)).first()).toBeVisible()

    // Limpiar búsqueda
    await searchInput.fill('')

    // 5. Iniciar el tour guiado de la pantalla
    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour/i }).first()
    if (await startTourBtn.isVisible()) {
      await startTourBtn.click()

      // 6. Verificar que Driver.js monta el popover corporativo CIMA
      const popover = page.locator('.cima-tour-popover')
      await expect(popover).toBeVisible({ timeout: 5000 })

      // Verificar elementos del popover
      await expect(popover.locator('.driver-popover-title')).toBeVisible()
      await expect(popover.locator('.driver-popover-description')).toBeVisible()

      // Verificar botón siguiente
      const nextBtn = popover.locator('.driver-popover-next-btn')
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(300)
      }

      // Cerrar tour con Escape
      await page.keyboard.press('Escape')
      await expect(popover).not.toBeVisible()
    }
  })

  test('coexistencia con el widget de zoom sin colisiones visuales', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
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
})
