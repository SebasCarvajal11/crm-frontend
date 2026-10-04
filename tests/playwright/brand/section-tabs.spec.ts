import { expect, test } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

test.describe('SectionTabs - Píldora Deslizante Fluida (Sliding Pill)', () => {
  test('Píldora activa acompaña navegación y anima fluidamente con GPU transform', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')

    // Cargar panel de marketing donde SectionTabs gestiona 6 subsecciones
    await page.goto('/dashboard?tab=marketing')
    await page.waitForLoadState('networkidle')

    const tabsContainer = page.locator('[data-tour="marketing-tabs"] div[role="toolbar"]')
    await expect(tabsContainer).toBeVisible()

    // 1. Verificar existencia de la píldora indicadora deslizante
    const pill = tabsContainer.locator('div[aria-hidden="true"]').first()
    await expect(pill).toBeVisible()

    // Leer posición inicial de la píldora en Clientes
    const initialTransform = await pill.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })
    expect(initialTransform).not.toBe('none')

    // 2. Transición a pestaña Campañas
    const campaignsTab = page.locator('[data-tour="marketing-tab-campaigns"]')
    await expect(campaignsTab).toBeVisible()
    await campaignsTab.click()

    // Verificar estado activo
    await expect(campaignsTab).toHaveAttribute('data-state', 'active')
    await expect(campaignsTab).toHaveAttribute('aria-pressed', 'true')

    // Verificar que la píldora se desplazó a la nueva coordenada (esperando interpolación)
    await expect
      .poll(async () => {
        return await pill.evaluate((el) => window.getComputedStyle(el).transform)
      }, { timeout: 3000 })
      .not.toBe(initialTransform)

    // 3. Transición a Automatizaciones (workflows)
    const automationsTab = page.locator('[data-tour="marketing-tab-workflows"]')
    await expect(automationsTab).toBeVisible()
    await automationsTab.click()
    await expect(automationsTab).toHaveAttribute('data-state', 'active')

    // 4. Cero desbordamiento global en la ventana
    const noWindowOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth + 1
    })
    expect(noWindowOverflow).toBe(true)

    // 5. Cero errores en consola
    expect(errors).toEqual([])
  })

  test('Respeta strictly prefers-reduced-motion desactivando animaciones', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')

    await page.goto('/dashboard?tab=marketing')
    await page.waitForLoadState('networkidle')

    const tabsContainer = page.locator('[data-tour="marketing-tabs"] div[role="toolbar"]')
    const pill = tabsContainer.locator('div[aria-hidden="true"]').first()
    await expect(pill).toBeVisible()

    const hasTransitionNone = await pill.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return (
        style.transitionDuration === '0s' ||
        style.transitionDuration === '0.00001s' ||
        parseFloat(style.transitionDuration) < 0.01
      )
    })
    expect(hasTransitionNone).toBe(true)
    expect(errors).toEqual([])
  })
})
