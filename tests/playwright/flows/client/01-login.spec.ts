import { test, expect } from '../../fixtures/auth.fixture'
import { USERS } from '../../fixtures/auth.fixture'
import { LoginPage } from '../../page-objects/login.page'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Client - Login y Navegacion', () => {
  test('login exitoso y redireccion a dashboard', async ({ page }) => {
    const logger = new ConsoleLogger('client-01-login-exitoso')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(USERS.client.email, USERS.client.password)

    await expect(page).toHaveURL(/\/dashboard/)
    const dashboard = new DashboardPage(page)
    await expect(dashboard.overviewTab).toBeVisible()
    await expect(dashboard.collabTab).toBeVisible()

    await logger.persist(false)
  })

  test('sidebar NO muestra tab Admin para client', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-01-no-admin-tab')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.expectDashboardLoaded()

    const adminVisible = await dashboard.isTabVisible('Administracion')
    expect(adminVisible).toBe(false)

    await logger.persist(false)
  })

  test('sesion persiste entre recargas', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-01-sesion-persiste')
    logger.attachToPage(clientPage)

    await clientPage.reload()
    await clientPage.waitForLoadState('networkidle')

    await expect(clientPage).toHaveURL(/\/dashboard/)

    await logger.persist(false)
  })
})
