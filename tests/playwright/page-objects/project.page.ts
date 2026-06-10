import type { Page, Locator } from '@playwright/test'
import { chooseRadixSelectOption } from '../helpers/ui-actions'

export class ProjectPage {
  readonly page: Page
  readonly backButton: Locator
  readonly tabList: Locator
  readonly boardTab: Locator
  readonly chatTab: Locator
  readonly briefTab: Locator
  readonly membersTab: Locator
  readonly progressBar: Locator
  readonly taskSearchInput: Locator

  constructor(page: Page) {
    this.page = page
    this.backButton = page.getByLabel('Volver al tablero de proyectos')
    this.tabList = page.getByLabel('Secciones del proyecto')
    this.boardTab = page.getByRole('tab', { name: /tablero/i })
    this.chatTab = page.getByRole('tab', { name: /conversacion/i })
    this.briefTab = page.getByRole('tab', { name: /brief/i })
    this.membersTab = page.getByRole('tab', { name: /integrantes/i })
    this.progressBar = page.getByLabel(/progreso/i).first()
    this.taskSearchInput = page.getByLabel('Buscar tareas del proyecto')
  }

  async expectLoaded() {
    await this.tabList.waitFor({ state: 'visible', timeout: 15_000 })
  }

  async navigateToBoard() {
    await this.boardTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToChat() {
    await this.chatTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToBrief() {
    await this.briefTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToMembers() {
    await this.membersTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async goBack() {
    await this.backButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async searchTasks(query: string) {
    await this.taskSearchInput.fill(query)
    await this.page.waitForTimeout(500)
  }

  async getProgress(): Promise<string> {
    const progress = await this.progressBar.getAttribute('aria-valuenow')
    return progress || '0'
  }

  async getColumnCount(): Promise<number> {
    const columns = this.page.getByLabel(/columna/i)
    return columns.count()
  }

  async getTaskCount(): Promise<number> {
    const tasks = this.page.locator('[aria-label*="Tarea:"]')
    return tasks.count()
  }

  async openTask(taskTitle: string) {
    const task = this.page.getByRole('button', { name: new RegExp(taskTitle, 'i') })
    await task.click()
    await this.page.waitForTimeout(500)
  }

  async createTask(data: {
    columnTitle: string
    title: string
    description?: string
    priority?: string
  }) {
    let createButton = this.page.getByLabel(`Crear tarea en ${data.columnTitle}`)
    if ((await createButton.count()) === 0) {
      createButton = this.page.locator('button[aria-label^="Crear tarea en "]').first()
    }
    await createButton.click()
    await this.page.waitForTimeout(500)

    await this.page.locator('#ct-title').fill(data.title)
    if (data.description) {
      await this.page.locator('#ct-desc').fill(data.description)
    }
    if (data.priority) {
      const priorityLabel: Record<string, string> = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente',
      }
      await chooseRadixSelectOption(
        this.page,
        this.page.locator('#ct-pri'),
        priorityLabel[data.priority] ?? data.priority
      )
    }

    await this.page.getByRole('button', { name: /crear tarea/i }).click()
    await this.page.waitForTimeout(1000)
  }
}
