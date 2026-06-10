import type { Page, Locator } from '@playwright/test'

export class ChatPage {
  readonly page: Page
  readonly channelTabs: Locator
  readonly externalChannel: Locator
  readonly internalChannel: Locator
  readonly messageInput: Locator
  readonly sendButton: Locator
  readonly messageLog: Locator
  readonly loadMoreButton: Locator

  constructor(page: Page) {
    this.page = page
    this.channelTabs = page.getByLabel('Seleccionar canal')
    this.externalChannel = page.getByRole('tab', { name: /cliente/i })
    this.internalChannel = page.getByRole('tab', { name: /equipo/i })
    this.messageInput = page.getByLabel('Escribir mensaje')
    this.sendButton = page.getByLabel('Enviar mensaje')
    this.messageLog = page.getByLabel('Mensajes')
    this.loadMoreButton = page.getByRole('button', { name: /cargar mensajes anteriores/i })
  }

  async expectLoaded() {
    await this.messageLog.waitFor({ state: 'visible', timeout: 10_000 })
  }

  async switchToExternalChat() {
    if (await this.externalChannel.isVisible().catch(() => false)) {
      await this.externalChannel.click()
    }
    await this.page.waitForTimeout(500)
  }

  async switchToInternalChat() {
    await this.internalChannel.click()
    await this.page.waitForTimeout(500)
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text)
    await this.sendButton.click()
    await this.page.waitForTimeout(1000)
  }

  async sendMentionedMessage(text: string, mentionTarget: string) {
    await this.messageInput.fill(`${text} @`)
    await this.page.waitForTimeout(500)
    const suggestion = this.page.getByRole('option', { name: new RegExp(mentionTarget, 'i') })
    if (await suggestion.isVisible()) {
      await suggestion.click()
    }
    await this.sendButton.click()
    await this.page.waitForTimeout(1000)
  }

  async getMessageCount(): Promise<number> {
    const messages = this.page.locator('[role="log"] > *')
    return messages.count()
  }

  async getLastMessage(): Promise<string> {
    const messages = this.page.locator('[role="log"] > *')
    const count = await messages.count()
    if (count === 0) return ''
    return (await messages.last().textContent()) || ''
  }

  async loadMoreMessages() {
    if (await this.loadMoreButton.isVisible()) {
      await this.loadMoreButton.click()
      await this.page.waitForTimeout(1000)
    }
  }

  async isInternalChannelVisible(): Promise<boolean> {
    return this.internalChannel.isVisible()
  }

  async isExternalChannelVisible(): Promise<boolean> {
    return (
      (await this.externalChannel.isVisible().catch(() => false)) ||
      (await this.page.getByRole('region', { name: /chat con el cliente/i }).isVisible().catch(() => false))
    )
  }
}
