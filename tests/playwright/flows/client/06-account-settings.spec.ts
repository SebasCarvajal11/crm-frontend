import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { AccountPage } from '../../page-objects/account.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Client - Configuracion de Cuenta', () => {
  test.beforeEach(async ({ clientPage }) => {
    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToAccount()
  })

  test('ver perfil con datos correctos', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-06-ver-perfil')
    logger.attachToPage(clientPage)

    const account = new AccountPage(clientPage)
    await account.expectLoaded()

    const emailField = clientPage.getByRole('main').getByText('contacto@restauranteelbuensabor.com')
    await expect(emailField).toBeVisible()

    await logger.persist(false)
  })

  test('ver rol como cliente', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-06-rol-cliente')
    logger.attachToPage(clientPage)

    const clientRole = clientPage.getByRole('main').getByText('Cliente', { exact: true })
    await expect(clientRole).toBeVisible()

    await logger.persist(false)
  })

  test('ver seccion de sesiones', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-06-sesiones')
    logger.attachToPage(clientPage)

    const sessionsSection = clientPage.getByText('Sesiones activas')
    await expect(sessionsSection).toBeVisible()

    await logger.persist(false)
  })

  test('ver campos especificos de client', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-06-campos-client')
    logger.attachToPage(clientPage)

    const empresaField = clientPage.getByText('Empresa')
    const tipoField = clientPage.getByText('Tipo de cliente')

    const empresaVisible = await empresaField.isVisible().catch(() => false)
    const tipoVisible = await tipoField.isVisible().catch(() => false)

    expect(empresaVisible || tipoVisible).toBe(true)

    await logger.persist(false)
  })

  test('ver opciones de avatar', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-06-opciones-avatar')
    logger.attachToPage(clientPage)

    const avatarMenu = clientPage.getByLabel('Opciones de foto de perfil')
    await expect(avatarMenu).toBeVisible()

    await logger.persist(false)
  })
})
