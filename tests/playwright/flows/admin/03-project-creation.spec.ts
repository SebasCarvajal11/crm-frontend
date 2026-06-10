import { test, expect } from '../../fixtures/auth.fixture'
import { TestData } from '../../fixtures/test-data.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ConsoleLogger } from '../../helpers/console-logger'
import { chooseRadixSelectOption, chooseUserSearchResult } from '../../helpers/ui-actions'

async function fillRequiredProjectRelations(page: import('@playwright/test').Page) {
  await chooseUserSearchResult(
    page,
    page.getByRole('combobox', { name: /email del cliente/i }),
    TestData.users.client.email
  )
  await chooseUserSearchResult(
    page,
    page.getByRole('combobox', { name: /email del trabajador/i }),
    TestData.users.worker.email
  )
}

async function expectProjectCreated(page: import('@playwright/test').Page, projectName: string) {
  const project = new ProjectPage(page)
  if (await project.tabList.isVisible().catch(() => false)) {
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible()
    return
  }

  const collab = new CollabPage(page)
  await collab.expectLoaded()
  await expect(page.getByRole('button', { name: new RegExp(projectName, 'i') })).toBeVisible()
}

test.describe('Admin - Creacion de Proyectos', () => {
  test.beforeEach(async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToCollab()
  })

  test('crear proyecto campaign_service', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-03-crear-campaign')
    logger.attachToPage(adminPage)

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    await collab.openCreateProjectModal()

    const projectData = TestData.projects.campaign()
    await adminPage.locator('#cp-name').fill(projectData.name)
    await chooseRadixSelectOption(adminPage, adminPage.locator('#cp-type'), 'Campana / Servicio')
    await fillRequiredProjectRelations(adminPage)
    await adminPage.locator('#cp-desc').fill(projectData.description)
    await adminPage.locator('#cp-brief').fill(projectData.brief)

    await adminPage.getByRole('button', { name: /crear proyecto/i }).click()
    await adminPage.waitForTimeout(2000)

    await expectProjectCreated(adminPage, projectData.name)

    await logger.persist(false)
  })

  test('crear proyecto product_order', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-03-crear-order')
    logger.attachToPage(adminPage)

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    await collab.openCreateProjectModal()

    const projectData = TestData.projects.order()
    await adminPage.locator('#cp-name').fill(projectData.name)
    await chooseRadixSelectOption(adminPage, adminPage.locator('#cp-type'), 'Pedido de Producto')
    await fillRequiredProjectRelations(adminPage)
    await adminPage.locator('#cp-desc').fill(projectData.description)

    await adminPage.getByRole('button', { name: /crear proyecto/i }).click()
    await adminPage.waitForTimeout(2000)

    await expectProjectCreated(adminPage, projectData.name)

    await logger.persist(false)
  })

  test('buscar proyecto por nombre', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-03-buscar-proyecto')
    logger.attachToPage(adminPage)

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    await collab.searchProject('Test')
    await adminPage.waitForTimeout(1000)

    await logger.persist(false)
  })

  test('abrir proyecto y ver workspace', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-03-abrir-workspace')
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
      await expect(project.boardTab).toBeVisible()
      await expect(project.chatTab).toBeVisible()
      await expect(project.briefTab).toBeVisible()
      await expect(project.membersTab).toBeVisible()
    }

    await logger.persist(false)
  })

  test('resumen de proyectos muestra estadisticas', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-03-estadisticas')
    logger.attachToPage(adminPage)

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    await expect(collab.statsRegion).toBeVisible()

    await logger.persist(false)
  })
})
