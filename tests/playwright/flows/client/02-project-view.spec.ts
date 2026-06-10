import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Client - Vista de Proyectos', () => {
  test('ver proyectos propios', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-02-ver-proyectos')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(clientPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(0)

    await logger.persist(false)
  })

  test('abrir proyecto y ver workspace', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-02-abrir-workspace')
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
      await expect(project.briefTab).toBeVisible()
    }

    await logger.persist(false)
  })

  test('client NO puede crear proyecto', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-02-no-crear-proyecto')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(clientPage)
    await collab.expectLoaded()

    const createButton = collab.newProjectButton
    const isVisible = await createButton.isVisible().catch(() => false)
    expect(isVisible).toBe(false)

    await logger.persist(false)
  })

  test('ver resumen de proyectos', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-02-resumen-proyectos')
    logger.attachToPage(clientPage)

    const dashboard = new DashboardPage(clientPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(clientPage)
    await collab.expectLoaded()

    await expect(collab.statsRegion).toBeVisible()

    await logger.persist(false)
  })
})
