import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { AccountPage } from '../../page-objects/account.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Admin - Configuracion de Cuenta', () => {
  test.beforeEach(async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToAccount()
  })

  test('ver perfil con datos correctos', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-08-ver-perfil')
    logger.attachToPage(adminPage)

    const account = new AccountPage(adminPage)
    await account.expectLoaded()

    await expect(account.emailDisplay).toContainText('admin@cima.dev')

    await logger.persist(false)
  })

  test('ver seccion de sesiones activas', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-08-sesiones')
    logger.attachToPage(adminPage)

    const sessionsSection = adminPage.getByText('Sesiones activas')
    await expect(sessionsSection).toBeVisible()

    await logger.persist(false)
  })

  test('ver seccion de cambio de contrasena', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-08-cambio-contrasena')
    logger.attachToPage(adminPage)

    const passwordSection = adminPage.getByText('Contrasena actual')
    await expect(passwordSection).toBeVisible()

    await logger.persist(false)
  })

  test('verificar que el rol se muestra como admin', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-08-rol-admin')
    logger.attachToPage(adminPage)

    const account = new AccountPage(adminPage)
    await expect(account.roleDisplay).toContainText(/admin|administrador/i)

    await logger.persist(false)
  })

  test('ver opciones de avatar', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-08-opciones-avatar')
    logger.attachToPage(adminPage)

    const avatarMenu = adminPage.getByLabel('Opciones de foto de perfil')
    await expect(avatarMenu).toBeVisible()

    await avatarMenu.click()
    await adminPage.waitForTimeout(500)

    const viewPhoto = adminPage.getByText('Ver foto')
    const changePhoto = adminPage.getByText('Cambiar foto de perfil')
    await expect(viewPhoto).toBeVisible()
    await expect(changePhoto).toBeVisible()

    await logger.persist(false)
  })

  test('verificar badge de verificacion', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-08-badge-verificacion')
    logger.attachToPage(adminPage)

    const verified = adminPage.getByText('Verificado')
    const pending = adminPage.getByText('Pendiente de verificacion')

    const isVerified = await verified.isVisible().catch(() => false)
    const isPending = await pending.isVisible().catch(() => false)

    expect(isVerified || isPending).toBe(true)

    await logger.persist(false)
  })
})
