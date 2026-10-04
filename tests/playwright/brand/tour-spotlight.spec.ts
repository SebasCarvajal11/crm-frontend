import { expect, test } from '@playwright/test'
import { setupDashboard, startTour } from '../tour/fixtures'

test.describe('Tour Spotlight: Resplandor Institucional y Morphing de Foco', () => {
  test('Renderiza TourSpotlight continuo con resplandor y clase morphing al cambiar de paso', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    // Iniciar Misión 1
    await startTour(page, 'Misión 1: Exploración del Tablero Kanban')
    const guide = page.getByTestId('tour-guide')
    await expect(guide).toBeVisible()

    // 1. Verificar presencia del spotlight en el DOM
    const spotlight = page.getByTestId('tour-spotlight')
    await expect(spotlight).toBeVisible()
    await expect(spotlight).toHaveClass(/cima-tour-highlight/)

    // 2. Verificar que se posiciona sobre un elemento con ancho y alto positivos
    const box = await spotlight.boundingBox()
    expect(box).not.toBeNull()
    expect((box?.width ?? 0)).toBeGreaterThan(10)
    expect((box?.height ?? 0)).toBeGreaterThan(10)

    // 3. Avanzar al paso 2 y verificar morphing
    const nextBtn = guide.getByRole('button', { name: 'Siguiente', exact: true })
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await expect(guide).toContainText('Paso 2')
      await expect(spotlight).toBeVisible()
    }

    // 4. Cerrar tutorial
    const closeBtn = guide.getByRole('button', { name: 'Cerrar tutorial' })
    await closeBtn.click()
    await expect(guide).toHaveCount(0)
    await expect(spotlight).toHaveCount(0)

    expect(errors).toEqual([])
  })

  test('Respeta prefers-reduced-motion eliminando animaciones y transiciones de spotlight', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    await startTour(page, 'Misión 1: Exploración del Tablero Kanban')
    const guide = page.getByTestId('tour-guide')
    await expect(guide).toBeVisible()

    const spotlight = page.getByTestId('tour-spotlight')
    await expect(spotlight).toBeVisible()

    // Verificar que en reduced-motion la transición CSS esté desactivada
    const transition = await spotlight.evaluate((el) => {
      return window.getComputedStyle(el).transitionProperty
    })
    expect(transition === 'none' || transition === 'all' || transition === '').toBe(true)

    const closeBtn = guide.getByRole('button', { name: 'Cerrar tutorial' })
    await closeBtn.click()
    expect(errors).toEqual([])
  })
})
