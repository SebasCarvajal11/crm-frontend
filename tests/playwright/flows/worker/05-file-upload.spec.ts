import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Worker - Subida de Archivos', () => {
  test('ver seccion de archivos en tarea', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-05-archivos-tarea')
    logger.attachToPage(workerPage)

    const dashboard = new DashboardPage(workerPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await workerPage.waitForTimeout(1000)

      const taskCards = workerPage.locator('[aria-label*="Tarea:"]')
      const taskCount = await taskCards.count()

      if (taskCount > 0) {
        await taskCards.first().click()
        await workerPage.waitForTimeout(500)

        const filesTab = workerPage.getByRole('tab', { name: /archivos/i })
        if (await filesTab.isVisible()) {
          await filesTab.click()
          await workerPage.waitForTimeout(500)
        }
      }
    }

    await logger.persist(false)
  })

  test('ver timeline de archivos del proyecto', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-05-timeline-archivos')
    logger.attachToPage(workerPage)

    const dashboard = new DashboardPage(workerPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await workerPage.waitForTimeout(1000)

      const project = new ProjectPage(workerPage)
      await project.expectLoaded()

      const convTab = workerPage.getByRole('tab', { name: /conversacion/i })
      await convTab.click()
      await workerPage.waitForTimeout(500)
    }

    await logger.persist(false)
  })
})
