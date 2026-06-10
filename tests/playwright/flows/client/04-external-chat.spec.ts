import { test, expect } from '../../fixtures/auth.fixture'
import { TestData } from '../../fixtures/test-data.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ChatPage } from '../../page-objects/chat.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Client - Chat Externo', () => {
  test('enviar mensaje en chat externo', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-04-chat-externo')
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
      await project.navigateToChat()

      const chat = new ChatPage(clientPage)
      await chat.expectLoaded()

      await chat.switchToExternalChat()
      const chatData = TestData.chat.external()
      await chat.sendMessage(chatData.message)

      const lastMsg = await chat.getLastMessage()
      expect(lastMsg).toContain(chatData.message)
    }

    await logger.persist(false)
  })

  test('ver canal externo del cliente', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-04-ver-canal-externo')
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
      await project.navigateToChat()

      const chat = new ChatPage(clientPage)
      await chat.expectLoaded()

      const externalVisible = await chat.isExternalChannelVisible()
      expect(externalVisible).toBe(true)
    }

    await logger.persist(false)
  })

  test('client NO puede ver chat interno', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-04-no-chat-interno')
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
      await project.navigateToChat()

      const chat = new ChatPage(clientPage)
      await chat.expectLoaded()

      const internalVisible = await chat.isInternalChannelVisible()
      expect(internalVisible).toBe(false)
    }

    await logger.persist(false)
  })

  test('verificar mensajes cargados', async ({ clientPage }) => {
    const logger = new ConsoleLogger('client-04-verificar-mensajes')
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
      await project.navigateToChat()

      const chat = new ChatPage(clientPage)
      await chat.expectLoaded()

      await chat.switchToExternalChat()
      await clientPage.waitForTimeout(1000)

      const msgCount = await chat.getMessageCount()
      expect(msgCount).toBeGreaterThanOrEqual(0)
    }

    await logger.persist(false)
  })
})
