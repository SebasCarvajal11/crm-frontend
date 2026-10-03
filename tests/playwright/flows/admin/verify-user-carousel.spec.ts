import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { AdminPage } from '../../page-objects/admin.page'

test.describe('Admin - Carrusel Interactivo de Directorio de Usuarios', () => {
  test.beforeEach(async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToAdmin()
  })

  test('renderiza carrusel de tarjetas por defecto con badges y acciones', async ({ adminPage }) => {
    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const carouselRegion = adminPage.getByRole('region', { name: /directorio de usuarios interactivo/i })
    await expect(carouselRegion).toBeVisible({ timeout: 10_000 })

    const userCards = adminPage.locator('[data-testid="admin-user-card"]')
    const cardCount = await userCards.count()
    expect(cardCount).toBeGreaterThan(0)

    const firstCard = userCards.first()
    await expect(firstCard.getByRole('heading', { level: 4 })).toBeVisible()
    await expect(firstCard.getByText(/activo|inactivo|archivado/i).first()).toBeVisible()
    await expect(firstCard.getByRole('button', { name: /desactivar|activar|restaurar/i })).toBeVisible()
  })

  test('navega horizontalmente en el carrusel con botones previo y siguiente', async ({ adminPage }) => {
    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const nextBtn = adminPage.getByRole('button', { name: /desplazar carrusel hacia la derecha/i })
    const prevBtn = adminPage.getByRole('button', { name: /desplazar carrusel hacia la izquierda/i })

    await expect(nextBtn).toBeVisible()
    await expect(prevBtn).toBeVisible()

    if (await nextBtn.isEnabled()) {
      await nextBtn.click()
      await adminPage.waitForTimeout(600)
      await expect(prevBtn).toBeEnabled()
      await prevBtn.click()
      await adminPage.waitForTimeout(600)
    }
  })

  test('permite alternar entre vista carrusel y vista tabla detallada', async ({ adminPage }) => {
    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const tableViewBtn = adminPage.getByRole('button', { name: /vista tabla detallada/i })
    const carouselViewBtn = adminPage.getByRole('button', { name: /vista carrusel interactivo/i })

    await expect(tableViewBtn).toBeVisible()
    await tableViewBtn.click()
    await adminPage.waitForTimeout(500)

    const table = adminPage.getByRole('table')
    await expect(table).toBeVisible()

    await carouselViewBtn.click()
    await adminPage.waitForTimeout(500)

    const carouselRegion = adminPage.getByRole('region', { name: /directorio de usuarios interactivo/i })
    await expect(carouselRegion).toBeVisible()
  })

  test('pausa el movimiento automático al pasar el cursor (hover) y lo reanuda al salir', async ({ adminPage }) => {
    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const carouselRegion = adminPage.getByRole('region', { name: /directorio de usuarios interactivo/i })
    await expect(carouselRegion).toBeVisible()

    // En estado inicial sin hover muestra badge Auto
    await expect(carouselRegion.getByText(/auto/i)).toBeVisible({ timeout: 5_000 })
    await carouselRegion.scrollIntoViewIfNeeded()

    const scrollContainer = carouselRegion.locator('.overflow-x-auto')
    const initialPos = await scrollContainer.evaluate((el) => el.scrollLeft)
    await adminPage.waitForTimeout(1500)
    const movingPos = await scrollContainer.evaluate((el) => el.scrollLeft)
    expect(movingPos).toBeGreaterThanOrEqual(initialPos + 15)

    // Al hacer hover se pausa inmediatamente
    await carouselRegion.hover()
    await expect(carouselRegion.getByText(/en pausa/i)).toBeVisible({ timeout: 5_000 })
    const hoverPos1 = await scrollContainer.evaluate((el) => el.scrollLeft)
    await adminPage.waitForTimeout(1000)
    const hoverPos2 = await scrollContainer.evaluate((el) => el.scrollLeft)
    expect(hoverPos2).toBe(hoverPos1)

    // Al mover el cursor fuera del carrusel se reanuda
    await adminPage.mouse.move(0, 0)
    await expect(carouselRegion.getByText(/auto/i)).toBeVisible({ timeout: 5_000 })
    await adminPage.waitForTimeout(1500)
    const resumedPos = await scrollContainer.evaluate((el) => el.scrollLeft)
    expect(resumedPos).toBeGreaterThan(hoverPos2)
  })
})
