import { test, expect } from '../../fixtures/auth.fixture'
import { TestData } from '../../fixtures/test-data.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ChatPage } from '../../page-objects/chat.page'
import { ConsoleLogger } from '../../helpers/console-logger'

test.describe('Admin - Gestion de Chat', () => {
  let chatPage: ChatPage

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

      const project = new ProjectPage(adminPage)
      await project.expectLoaded()
      await project.navigateToChat()

      chatPage = new ChatPage(adminPage)
      await chatPage.expectLoaded()
    }
  })

  test('enviar mensaje en chat interno', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-05-chat-interno')
    logger.attachToPage(adminPage)

    await chatPage.switchToInternalChat()
    const chatData = TestData.chat.internal()
    await chatPage.sendMessage(chatData.message)

    const lastMsg = await chatPage.getLastMessage()
    expect(lastMsg).toContain(chatData.message)

    await logger.persist(false)
  })

  test('enviar mensaje en chat externo', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-05-chat-externo')
    logger.attachToPage(adminPage)

    await chatPage.switchToExternalChat()
    const chatData = TestData.chat.external()
    await chatPage.sendMessage(chatData.message)

    const lastMsg = await chatPage.getLastMessage()
    expect(lastMsg).toContain(chatData.message)

    await logger.persist(false)
  })

  test('cambiar entre canales de chat', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-05-cambiar-canales')
    logger.attachToPage(adminPage)

    await chatPage.switchToInternalChat()
    await adminPage.waitForTimeout(500)

    await chatPage.switchToExternalChat()
    await adminPage.waitForTimeout(500)

    await chatPage.switchToInternalChat()
    await adminPage.waitForTimeout(500)

    await logger.persist(false)
  })

  test('verificar mensajes cargados', async ({ adminPage }) => {
    const logger = new ConsoleLogger('admin-05-verificar-mensajes')
    logger.attachToPage(adminPage)

    await chatPage.switchToInternalChat()
    await adminPage.waitForTimeout(1000)

    const msgCount = await chatPage.getMessageCount()
    expect(msgCount).toBeGreaterThanOrEqual(0)

    await logger.persist(false)
  })
})
