import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/login.page'
import { USERS } from '../../fixtures/auth.fixture'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Guest - Login', () => {
  test('acceder a pagina de login', async ({ page }) => {
    const logger = new ConsoleLogger('guest-02-acceder-login')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()

    await logger.persist(false)
  })

  test('ver link de olvidaste contrasena', async ({ page }) => {
    const logger = new ConsoleLogger('guest-02-link-forgot')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.forgotPasswordLink).toBeVisible()

    await logger.persist(false)
  })

  test('login con credenciales invalidas muestra error', async ({ page }) => {
    const logger = new ConsoleLogger('guest-02-login-invalido')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    const errorMsg = await loginPage.loginExpectingError(
      'invalido@cima.dev',
      'ContrasenaInvalida1!'
    )
    expect(errorMsg).toBeTruthy()

    await logger.persist(false)
  })

  test('login exitoso redirige a dashboard', async ({ page }) => {
    const logger = new ConsoleLogger('guest-02-login-exitoso')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(USERS.admin.email, USERS.admin.password)

    await expect(page).toHaveURL(/\/dashboard/)

    await logger.persist(false)
  })

  test('redireccion a dashboard si ya autenticado', async ({ page }) => {
    const logger = new ConsoleLogger('guest-02-redireccion-auth')
    logger.attachToPage(page)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(USERS.admin.email, USERS.admin.password)

    await expect(page).toHaveURL(/\/dashboard/)

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard/)

    await logger.persist(false)
  })
})
