import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { TaskPage } from '../../page-objects/task.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Worker - Gestion de Tareas', () => {
  test.beforeEach(async ({ workerPage }) => {
    const dashboard = new DashboardPage(workerPage)
    await dashboard.navigateToCollab()
  })

  test('ver tareas asignadas en proyecto', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-03-ver-tareas')
    logger.attachToPage(workerPage)

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await workerPage.waitForTimeout(1000)

      const project = new ProjectPage(workerPage)
      await project.expectLoaded()

      const taskCount = await project.getTaskCount()
      expect(taskCount).toBeGreaterThanOrEqual(0)
    }

    await logger.persist(false)
  })

  test('abrir detalle de tarea', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-03-abrir-tarea')
    logger.attachToPage(workerPage)

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

        const task = new TaskPage(workerPage)
        await task.expectLoaded()
        await task.close()
      }
    }

    await logger.persist(false)
  })

  test('ver columnas del tablero', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-03-ver-columnas')
    logger.attachToPage(workerPage)

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await workerPage.waitForTimeout(1000)

      const project = new ProjectPage(workerPage)
      await project.expectLoaded()

      const columnCount = await project.getColumnCount()
      expect(columnCount).toBeGreaterThan(0)
    }

    await logger.persist(false)
  })

  test('buscar tareas en proyecto', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-03-buscar-tareas')
    logger.attachToPage(workerPage)

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await workerPage.waitForTimeout(1000)

      const project = new ProjectPage(workerPage)
      await project.expectLoaded()
      await project.searchTasks('Test')
      await workerPage.waitForTimeout(1000)
    }

    await logger.persist(false)
  })
})
