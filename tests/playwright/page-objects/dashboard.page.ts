import type { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly sidebar: Locator
  readonly overviewTab: Locator
  readonly collabTab: Locator
  readonly adminTab: Locator
  readonly accountTab: Locator
  readonly notificationsTab: Locator
  readonly logoutButton: Locator
  readonly mobileMenuButton: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.getByLabel('Barra de navegacion lateral')
    this.overviewTab = page.getByRole('button', { name: 'Resumen' })
    this.collabTab = page.getByRole('button', { name: 'Colaboración' })
    this.adminTab = page.getByRole('button', { name: 'Administración' })
    this.accountTab = page.getByRole('button', { name: /mi cuenta/i })
    this.notificationsTab = page.getByRole('button', { name: /^notificaciones$/i })
    this.logoutButton = page.getByRole('button', { name: /cerrar sesion/i })
    this.mobileMenuButton = page.getByLabel('Abrir menu')
  }

  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToOverview() {
    await this.overviewTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToCollab() {
    await this.collabTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToAdmin() {
    await this.adminTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToAccount() {
    await this.page.getByRole('button', { name: /admin@cima\.dev|@/i }).first().click()
    await this.accountTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToNotifications() {
    await this.page.getByRole('button', { name: /admin@cima\.dev|@/i }).first().click()
    await this.notificationsTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async logout() {
    const footer = this.page.getByLabel('Barra de navegacion lateral')
    const footerButton = footer.locator('button:has-text("Cerrar")')
    if (await footerButton.isVisible()) {
      await footerButton.click()
    } else {
      await this.logoutButton.click()
    }
    await this.page.waitForURL('**/login', { timeout: 10_000 })
  }

  async expectDashboardLoaded() {
    await this.page.waitForURL('**/dashboard')
    await this.overviewTab.waitFor({ state: 'visible', timeout: 10_000 })
  }

  async isTabVisible(tabName: string): Promise<boolean> {
    const tab = this.page.getByRole('button', { name: tabName })
    return tab.isVisible()
  }
}
