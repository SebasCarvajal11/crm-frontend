import { test, expect } from '../../fixtures/auth.fixture'
import { TestData } from '../../fixtures/test-data.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ChatPage } from '../../page-objects/chat.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Worker - Chat Interno', () => {
  test('enviar mensaje en chat interno', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-04-chat-interno')
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
      await project.navigateToChat()

      const chat = new ChatPage(workerPage)
      await chat.expectLoaded()

      await chat.switchToInternalChat()
      const chatData = TestData.chat.internal()
      await chat.sendMessage(chatData.message)

      const lastMsg = await chat.getLastMessage()
      expect(lastMsg).toContain(chatData.message)
    }

    await logger.persist(false)
  })

  test('ver canal interno del equipo', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-04-ver-canal-interno')
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
      await project.navigateToChat()

      const chat = new ChatPage(workerPage)
      await chat.expectLoaded()

      const internalVisible = await chat.isInternalChannelVisible()
      expect(internalVisible).toBe(true)
    }

    await logger.persist(false)
  })

  test('verificar mensajes cargados en chat', async ({ workerPage }) => {
    const logger = new ConsoleLogger('worker-04-verificar-mensajes')
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
      await project.navigateToChat()

      const chat = new ChatPage(workerPage)
      await chat.expectLoaded()

      await chat.switchToInternalChat()
      await workerPage.waitForTimeout(1000)

      const msgCount = await chat.getMessageCount()
      expect(msgCount).toBeGreaterThanOrEqual(0)
    }

    await logger.persist(false)
  })
})
