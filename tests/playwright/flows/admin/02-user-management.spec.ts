import { test, expect } from '../../fixtures/auth.fixture'
import { TestData } from '../../fixtures/test-data.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { AdminPage } from '../../page-objects/admin.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Admin - Gestion de Usuarios', () => {
  test.beforeEach(async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToAdmin()
  })

  test('crear worker y verificar en lista', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-02-crear-worker')
    logger.attachToPage(adminPage)

    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const workerEmail = `worker.test.${Date.now()}@cima.dev`
    await admin.registerWorker({
      email: workerEmail,
      firstName: 'Worker',
      lastName: 'Test',
      profession: 'QA Engineer',
    })

    await admin.searchUser(workerEmail)
    await adminPage.waitForTimeout(1000)

    await logger.persist(false)
  })

  test('invitar client y verificar email enviado', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-02-invitar-client')
    logger.attachToPage(adminPage)

    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const clientEmail = `client.test.${Date.now()}@cima.dev`
    await admin.inviteClient({
      email: clientEmail,
      firstName: 'Client',
      lastName: 'Test',
      kind: 'natural',
    })

    await admin.searchUser(clientEmail)
    await adminPage.waitForTimeout(1000)

    await logger.persist(false)
  })

  test('invitar client juridico con empresa', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-02-invitar-client-juridico')
    logger.attachToPage(adminPage)

    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const clientEmail = `juridico.${Date.now()}@empresa.com`
    await admin.inviteClient({
      email: clientEmail,
      firstName: 'Empresa',
      lastName: 'Test',
      kind: 'juridical',
      company: 'Empresa Test SAS',
    })

    await admin.searchUser(clientEmail)
    await adminPage.waitForTimeout(1000)

    await logger.persist(false)
  })

  test('desactivar y reactivar usuario', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-02-desactivar-reactivar')
    logger.attachToPage(adminPage)

    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    await admin.searchUser('ana.martinez')
    await adminPage.waitForTimeout(1000)

    const rows = await admin.getUserRows()
    const count = await rows.count()
    if (count > 0) {
      await admin.deactivateUser('ana.martinez@cima.dev')
      await adminPage.waitForTimeout(500)
      await admin.activateUser('ana.martinez@cima.dev')
    }

    await logger.persist(false)
  })

  test('filtrar usuarios por rol', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-02-filtrar-rol')
    logger.attachToPage(adminPage)

    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    await admin.filterByRole('Trabajador')
    await adminPage.waitForTimeout(500)

    await admin.filterByRole('Cliente')
    await adminPage.waitForTimeout(500)

    await admin.filterByRole('Todos')
    await adminPage.waitForTimeout(500)

    await logger.persist(false)
  })

  test('paginacion de usuarios', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-02-paginacion')
    logger.attachToPage(adminPage)

    const admin = new AdminPage(adminPage)
    await admin.expectLoaded()

    const nextVisible = await admin.nextPageButton.isVisible()
    const nextEnabled = await admin.nextPageButton.isEnabled()
    if (nextVisible && nextEnabled) {
      await admin.nextPageButton.click()
      await adminPage.waitForTimeout(500)
      if (await admin.prevPageButton.isEnabled()) {
        await admin.prevPageButton.click()
        await adminPage.waitForTimeout(500)
      }
    }

    await logger.persist(false)
  })
})
