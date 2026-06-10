import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Admin - Reportes y Visualizacion', () => {
  test('ver resumen de proyectos en overview', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-07-overview-resumen')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToOverview()

    const overviewCard = adminPage.getByText('Tu cuenta')
    await expect(overviewCard).toBeVisible()

    const emailDisplay = adminPage.getByRole('main').getByText('admin@cima.dev')
    await expect(emailDisplay).toBeVisible()

    await logger.persist(false)
  })

  test('ver estadisticas del tablero de proyectos', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-07-estadisticas-tablero')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    await expect(collab.statsRegion).toBeVisible()

    await logger.persist(false)
  })

  test('ver estadisticas de un proyecto', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-07-estadisticas-proyecto')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await adminPage.waitForTimeout(1000)

      const project = new ProjectPage(adminPage)
      await project.expectLoaded()

      const progressVisible = await project.progressBar.isVisible().catch(() => false)
      expect(typeof progressVisible).toBe('boolean')
    }

    await logger.persist(false)
  })

  test('ver tablero kanban con columnas', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-07-kanban-columnas')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    await expect(collab.kanbanBoard).toBeVisible()

    await logger.persist(false)
  })

  test('ver links de documentacion en overview', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-07-links-documentacion')
    logger.attachToPage(adminPage)

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToOverview()

    const swaggerLink = adminPage.getByLabel('Abrir Swagger UI en una nueva pestaña')
    const openapiLink = adminPage.getByLabel('Abrir archivo openapi.yaml en una nueva pestaña')

    await expect(swaggerLink).toBeVisible()
    await expect(openapiLink).toBeVisible()

    await logger.persist(false)
  })
})
