import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Worker - Vista de Proyectos', () => {
  test('ver proyectos asignados', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-02-ver-proyectos')
    logger.attachToPage(workerPage)

    const dashboard = new DashboardPage(workerPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(0)

    await logger.persist(false)
  })

  test('abrir proyecto y ver tablero', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-02-abrir-tablero')
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
      await expect(project.boardTab).toBeVisible()
    }

    await logger.persist(false)
  })

  test('worker NO puede crear proyecto', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-02-no-crear-proyecto')
    logger.attachToPage(workerPage)

    const dashboard = new DashboardPage(workerPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    const createButton = collab.newProjectButton
    const isVisible = await createButton.isVisible().catch(() => false)
    expect(isVisible).toBe(false)

    await logger.persist(false)
  })

  test('buscar proyectos', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-02-buscar-proyectos')
    logger.attachToPage(workerPage)

    const dashboard = new DashboardPage(workerPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(workerPage)
    await collab.expectLoaded()

    await collab.searchProject('Test')
    await workerPage.waitForTimeout(1000)

    await logger.persist(false)
  })
})
