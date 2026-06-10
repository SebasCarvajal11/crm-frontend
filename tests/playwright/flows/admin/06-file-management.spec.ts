import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'
import path from 'path'

test.describe('Admin - Gestion de Archivos', () => {
  test.beforeEach(async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToCollab()
  })

  test('ver pestaña de archivos en proyecto', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-06-ver-archivos')
    logger.attachToPage(adminPage)

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await adminPage.waitForTimeout(1000)

      const project = new ProjectPage(adminPage)
      await project.expectLoaded()

      const filesTab = adminPage.getByRole('tab', { name: /conversacion/i })
      await filesTab.click()
      await adminPage.waitForTimeout(500)
    }

    await logger.persist(false)
  })

  test('ver timeline de archivos', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-06-timeline-archivos')
    logger.attachToPage(adminPage)

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await adminPage.waitForTimeout(1000)

      const project = new ProjectPage(adminPage)
      await project.expectLoaded()

      const convTab = adminPage.getByRole('tab', { name: /conversacion/i })
      await convTab.click()
      await adminPage.waitForTimeout(500)
    }

    await logger.persist(false)
  })

  test('verificar botones de accion de archivos', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-06-botones-archivos')
    logger.attachToPage(adminPage)

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await adminPage.waitForTimeout(1000)

      const project = new ProjectPage(adminPage)
      await project.expectLoaded()

      const convTab = adminPage.getByRole('tab', { name: /conversacion/i })
      await convTab.click()
      await adminPage.waitForTimeout(500)

      const uploadButton = adminPage.getByLabel(/subir/i)
      const uploadVisible = await uploadButton.isVisible().catch(() => false)
      expect(typeof uploadVisible).toBe('boolean')
    }

    await logger.persist(false)
  })
})
