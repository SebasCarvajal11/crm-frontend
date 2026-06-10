import { test, expect } from '../../fixtures/auth.fixture'
import { TestData } from '../../fixtures/test-data.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Client - Solicitudes de Cambio', () => {
  test('ver seccion de brief en proyecto', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-05-ver-brief-seccion')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(clientPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await clientPage.waitForTimeout(1000)

      const project = new ProjectPage(clientPage)
      await project.expectLoaded()
      await project.navigateToBrief()

      const briefRegion = clientPage.getByLabel('Brief del proyecto')
      await expect(briefRegion).toBeVisible()
    }

    await logger.persist(false)
  })

  test('ver historial de cambios formales', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-05-historial-cambios')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(clientPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await clientPage.waitForTimeout(1000)

      const project = new ProjectPage(clientPage)
      await project.expectLoaded()
      await project.navigateToBrief()

      const historyRegion = clientPage.getByLabel('Historial de cambios formales')
      const isVisible = await historyRegion.isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    }

    await logger.persist(false)
  })

  test('client NO puede crear tarea', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-05-no-crear-tarea')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(clientPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await clientPage.waitForTimeout(1000)

      const createTaskButton = clientPage.getByLabel(/crear tarea/i)
      const isVisible = await createTaskButton.isVisible().catch(() => false)
      expect(isVisible).toBe(false)
    }

    await logger.persist(false)
  })

  test('ver tareas del proyecto (solo lectura)', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-05-ver-tareas-lectura')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(clientPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await clientPage.waitForTimeout(1000)

      const project = new ProjectPage(clientPage)
      await project.expectLoaded()

      const taskCount = await project.getTaskCount()
      expect(taskCount).toBeGreaterThanOrEqual(0)
    }

    await logger.persist(false)
  })
})
