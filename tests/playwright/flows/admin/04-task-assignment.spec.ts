import { test, expect } from '../../fixtures/auth.fixture'
import { TestData } from '../../fixtures/test-data.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { TaskPage } from '../../page-objects/task.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Admin - Asignacion de Tareas', () => {
  let projectPage: ProjectPage

  test.beforeEach(async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToCollab()

    const collab = new CollabPage(adminPage)
    await collab.expectLoaded()

    const cards = await collab.getProjectCards()
    const count = await cards.count()
    if (count > 0) {
      await cards.first().click()
      await adminPage.waitForTimeout(1000)
      projectPage = new ProjectPage(adminPage)
      await projectPage.expectLoaded()
    }
  })

  test('crear tarea con prioridad alta', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-04-crear-tarea-alta')
    logger.attachToPage(adminPage)

    const taskData = TestData.tasks.highPriority()
    const columns = await projectPage.getColumnCount()

    if (columns > 0) {
      const firstColumn = adminPage.getByLabel(/columna/i).first()
      const columnTitle = await firstColumn.getAttribute('aria-label')
      const title = columnTitle?.match(/Columna ([^,]+)/)?.[1] || 'Por Hacer'

      await projectPage.createTask({
        columnTitle: title,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
      })

      await adminPage.waitForTimeout(1000)
    }

    await logger.persist(false)
  })

  test('crear tarea con prioridad media', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-04-crear-tarea-media')
    logger.attachToPage(adminPage)

    const taskData = TestData.tasks.mediumPriority()
    const columns = await projectPage.getColumnCount()

    if (columns > 0) {
      const firstColumn = adminPage.getByLabel(/columna/i).first()
      const columnTitle = await firstColumn.getAttribute('aria-label')
      const title = columnTitle?.match(/Columna ([^,]+)/)?.[1] || 'Por Hacer'

      await projectPage.createTask({
        columnTitle: title,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
      })

      await adminPage.waitForTimeout(1000)
    }

    await logger.persist(false)
  })

  test('ver detalle de tarea existente', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-04-ver-tarea')
    logger.attachToPage(adminPage)

    const taskCards = adminPage.locator('[aria-label*="Tarea:"]')
    const count = await taskCards.count()

    if (count > 0) {
      await taskCards.first().click()
      await adminPage.waitForTimeout(500)

      const task = new TaskPage(adminPage)
      await task.expectLoaded()
      await expect(task.tabList).toBeVisible()
      await task.close()
    }

    await logger.persist(false)
  })

  test('editar tarea existente', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-04-editar-tarea')
    logger.attachToPage(adminPage)

    const taskCards = adminPage.locator('[aria-label*="Tarea:"]')
    const count = await taskCards.count()

    if (count > 0) {
      await taskCards.first().click()
      await adminPage.waitForTimeout(500)

      const task = new TaskPage(adminPage)
      await task.expectLoaded()

      await task.editTask({
        title: `Editada ${Date.now()}`,
        priority: 'low',
      })

      await task.close()
    }

    await logger.persist(false)
  })

  test('buscar tarea por titulo', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-04-buscar-tarea')
    logger.attachToPage(adminPage)

    await projectPage.searchTasks('Test')
    await adminPage.waitForTimeout(1000)

    await logger.persist(false)
  })
})
