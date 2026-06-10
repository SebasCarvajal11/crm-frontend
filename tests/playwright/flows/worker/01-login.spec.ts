import { test, expect } from '../../fixtures/auth.fixture'
import { USERS } from '../../fixtures/auth.fixture'
import { LoginPage } from '../../page-objects/login.page'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Worker - Login y Navegacion', () => {
  test('login exitoso y redireccion a dashboard', async ({ page }) => {
    const logger = new ConsoleLogger('worker-01-login-exitoso')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(USERS.worker.email, USERS.worker.password)

    await expect(page).toHaveURL(/\/dashboard/)
    const dashboard = new DashboardPage(page)
    await expect(dashboard.overviewTab).toBeVisible()
    await expect(dashboard.collabTab).toBeVisible()

    await logger.persist(false)
  })

  test('sidebar NO muestra tab Admin para worker', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-01-no-admin-tab')
    logger.attachToPage(workerPage)

    const dashboard = new DashboardPage(workerPage)
    await dashboard.expectDashboardLoaded()

    const adminVisible = await dashboard.isTabVisible('Administracion')
    expect(adminVisible).toBe(false)

    await logger.persist(false)
  })

  test('sesion persiste entre recargas', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-01-sesion-persiste')
    logger.attachToPage(workerPage)

    await workerPage.reload()
    await workerPage.waitForLoadState('networkidle')

    await expect(workerPage).toHaveURL(/\/dashboard/)

    await logger.persist(false)
  })
})
