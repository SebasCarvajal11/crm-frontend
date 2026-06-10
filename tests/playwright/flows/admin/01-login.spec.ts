import { test, expect } from '../../fixtures/auth.fixture'
import { USERS } from '../../fixtures/auth.fixture'
import { LoginPage } from '../../page-objects/login.page'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Admin - Login y Navegacion', () => {
  test('login exitoso y redireccion a dashboard', async ({ page }) => {
    const logger = new ConsoleLogger('admin-01-login-exitoso')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(USERS.admin.email, USERS.admin.password)

    await expect(page).toHaveURL(/\/dashboard/)
    const dashboard = new DashboardPage(page)
    await expect(dashboard.overviewTab).toBeVisible()
    await expect(dashboard.collabTab).toBeVisible()
    await expect(dashboard.adminTab).toBeVisible()

    await logger.persist(false)
  })

  test('login fallido muestra error', async ({ page }) => {
    const logger = new ConsoleLogger('admin-01-login-fallido')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    const errorMsg = await loginPage.loginExpectingError(
      'admin@cima.dev',
      'ContrasenaIncorrecta1!'
    )
    expect(errorMsg).toBeTruthy()

    await logger.persist(false)
  })

  test('sesion persiste entre recargas', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-01-sesion-persiste')
    logger.attachToPage(adminPage)

    await adminPage.reload()
    await adminPage.waitForLoadState('networkidle')

    await expect(adminPage).toHaveURL(/\/dashboard/)
    const dashboard = new DashboardPage(adminPage)
    await expect(dashboard.overviewTab).toBeVisible()

    await logger.persist(false)
  })

  test('sidebar muestra tabs correctos para admin', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-01-sidebar-tabs')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await expect(dashboard.overviewTab).toBeVisible()
    await expect(dashboard.collabTab).toBeVisible()
    await expect(dashboard.adminTab).toBeVisible()

    await logger.persist(false)
  })
})
