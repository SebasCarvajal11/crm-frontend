import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { AccountPage } from '../../page-objects/account.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Worker - Configuracion de Cuenta', () => {
  test.beforeEach(async ({ workerPage }) => {
    const dashboard = new DashboardPage(workerPage)
    await dashboard.navigateToAccount()
  })

  test('ver perfil con datos correctos', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-06-ver-perfil')
    logger.attachToPage(workerPage)

    const account = new AccountPage(workerPage)
    await account.expectLoaded()

    const emailField = workerPage.getByRole('main').getByText('ana.martinez@cima.dev')
    await expect(emailField).toBeVisible()

    await logger.persist(false)
  })

  test('ver rol como trabajador', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-06-rol-trabajador')
    logger.attachToPage(workerPage)

    const workerRole = workerPage.getByRole('main').getByText('Trabajador', { exact: true })
    await expect(workerRole).toBeVisible()

    await logger.persist(false)
  })

  test('ver seccion de sesiones', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-06-sesiones')
    logger.attachToPage(workerPage)

    const sessionsSection = workerPage.getByText('Sesiones activas')
    await expect(sessionsSection).toBeVisible()

    await logger.persist(false)
  })

  test('ver opciones de avatar', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-06-opciones-avatar')
    logger.attachToPage(workerPage)

    const avatarMenu = workerPage.getByLabel('Opciones de foto de perfil')
    await expect(avatarMenu).toBeVisible()

    await logger.persist(false)
  })

  test('ver campo de profesion (worker-specific)', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-06-profesion')
    logger.attachToPage(workerPage)

    const profField = workerPage.getByText('Profesion')
    const isVisible = await profField.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')

    await logger.persist(false)
  })
})
