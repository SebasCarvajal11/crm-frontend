import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Admin - Marketing', () => {
  test('abrir campañas de marketing desde la navegación principal', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-09-marketing-campaigns')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await dashboard.expectDashboardLoaded()

    await adminPage.getByRole('button', { name: 'Marketing' }).click()
    await expect(adminPage.getByRole('heading', { name: /marketing.*analítica cima/i })).toBeVisible()

    await adminPage.getByRole('button', { name: 'Campañas' }).click()
    await expect(adminPage.getByRole('heading', { name: /campañas de marketing/i })).toBeVisible()
    await expect(adminPage.getByRole('button', { name: /nueva campaña/i })).toBeVisible()

    await logger.persist(false)
  })

  test('sincronizar cartera y crear una campaña para un cliente real', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-09-marketing-create-campaign')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await dashboard.expectDashboardLoaded()

    await adminPage.getByRole('button', { name: 'Marketing' }).click()
    await adminPage.getByRole('button', { name: 'Sincronizar con el CRM' }).first().click()
    await expect(adminPage.getByText(/Sincronización completada:/)).toBeVisible()

    await adminPage.getByRole('button', { name: 'Campañas' }).click()
    await adminPage.getByRole('button', { name: /nueva campaña/i }).click()

    const clientSelector = adminPage.locator('#campaignClient')
    await expect
      .poll(() => clientSelector.locator('option').count(), { timeout: 15_000 })
      .toBeGreaterThan(1)
    await clientSelector.selectOption({ index: 1 })

    const campaignName = `E2E Integración Marketing ${Date.now()}`
    await adminPage.locator('#campaignName').fill(campaignName)
    await adminPage.getByRole('button', { name: 'Crear Campaña' }).click()
    await expect(adminPage.getByText(campaignName)).toBeVisible()

    await logger.persist(false)
  })
})
