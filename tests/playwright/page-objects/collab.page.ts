import type { Page, Locator } from '@playwright/test'

export class CollabPage {
  readonly page: Page
  readonly newProjectButton: Locator
  readonly searchInput: Locator
  readonly statsRegion: Locator
  readonly kanbanBoard: Locator
  readonly loadingSpinner: Locator

  constructor(page: Page) {
    this.page = page
    this.newProjectButton = page.getByRole('button', { name: /nuevo proyecto/i })
    this.searchInput = page.getByLabel('Buscar proyectos')
    this.statsRegion = page.getByLabel('Resumen de proyectos')
    this.kanbanBoard = page.getByLabel('Tablero Kanban de proyectos')
    this.loadingSpinner = page.getByLabel('Cargando proyectos')
  }

  async expectLoaded() {
    await this.kanbanBoard.waitFor({ state: 'visible', timeout: 15_000 })
  }

  async searchProject(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500)
  }

  async openProject(projectName: string) {
    const card = this.page.getByRole('button', { name: new RegExp(projectName, 'i') })
    await card.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getProjectCards(): Promise<Locator> {
    return this.page.locator('[aria-label*="Abrir proyecto"]')
  }

  async getProjectCount(): Promise<number> {
    const cards = await this.getProjectCards()
    return cards.count()
  }

  async openCreateProjectModal() {
    await this.newProjectButton.click()
    await this.page.getByRole('dialog', { name: /nuevo proyecto/i }).waitFor({ state: 'visible' })
  }

  async getColumnCount(): Promise<string[]> {
    const columns = this.page.locator('[aria-label*="proyecto(s)"]')
    const texts: string[] = []
    const count = await columns.count()
    for (let i = 0; i < count; i++) {
      const text = await columns.nth(i).getAttribute('aria-label')
      if (text) texts.push(text)
    }
    return texts
  }
}
