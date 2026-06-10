import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Client - Vista de Brief', () => {
  test('ver brief del proyecto', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-03-ver-brief')
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

  test('brief muestra contenido', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-03-brief-contenido')
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

      await clientPage.waitForTimeout(1000)
      const briefContent = clientPage.getByLabel('Brief del proyecto')
      const text = await briefContent.textContent()
      expect(text).toBeTruthy()
    }

    await logger.persist(false)
  })

  test('client NO puede editar brief', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-03-no-editar-brief')
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

      const editButton = clientPage.getByRole('button', { name: /editar/i })
      const isVisible = await editButton.isVisible().catch(() => false)
      expect(isVisible).toBe(false)
    }

    await logger.persist(false)
  })
})
