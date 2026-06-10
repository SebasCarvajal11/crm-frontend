import type { Page, Locator } from '@playwright/test'
import { chooseRadixSelectOption } from '../helpers/ui-actions'

export class TaskPage {
  readonly page: Page
  readonly titleInput: Locator
  readonly descriptionInput: Locator
  readonly prioritySelect: Locator
  readonly assigneesInput: Locator
  readonly deadlineInput: Locator
  readonly subtasksSection: Locator
  readonly commentsSection: Locator
  readonly filesSection: Locator
  readonly editButton: Locator
  readonly closeButton: Locator
  readonly tabList: Locator
  readonly commentInput: Locator
  readonly fileSelect: Locator

  constructor(page: Page) {
    this.page = page
    this.titleInput = page.locator('#et-title')
    this.descriptionInput = page.locator('#et-desc')
    this.prioritySelect = page.locator('#et-pri')
    this.assigneesInput = page.getByLabel('Asignados')
    this.deadlineInput = page.getByLabel('Fecha limite')
    this.subtasksSection = page.getByText('Subtareas')
    this.commentsSection = page.getByText('Comentarios')
    this.filesSection = page.getByText('Archivos')
    this.editButton = page.getByLabel('Editar tarea')
    this.closeButton = page.getByLabel('Cerrar panel')
    this.tabList = page.getByLabel('Secciones de la tarea')
    this.commentInput = page.getByLabel('Escribe un comentario')
    this.fileSelect = page.getByLabel('Seleccionar archivo')
  }

  async expectLoaded() {
    await this.tabList.waitFor({ state: 'visible', timeout: 10_000 })
  }

  async editTask(data: {
    title?: string
    description?: string
    priority?: string
  }) {
    await this.editButton.click()
    await this.page.waitForTimeout(500)

    if (data.title) {
      await this.titleInput.clear()
      await this.titleInput.fill(data.title)
    }
    if (data.description) {
      await this.descriptionInput.clear()
      await this.descriptionInput.fill(data.description)
    }
    if (data.priority) {
      const priorityLabel: Record<string, string> = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente',
      }
      await chooseRadixSelectOption(this.page, this.prioritySelect, priorityLabel[data.priority] ?? data.priority)
    }

    await this.page.getByRole('button', { name: /guardar/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async addComment(text: string) {
    await this.commentInput.fill(text)
    await this.page.getByRole('button', { name: /enviar/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async close() {
    if (await this.closeButton.isVisible().catch(() => false)) {
      await this.closeButton.click()
    }
  }

  async getCommentCount(): Promise<number> {
    const comments = this.page.locator('[aria-label*="Comentario"]')
    return comments.count()
  }

  async getSubtaskCount(): Promise<number> {
    const subtasks = this.page.locator('[aria-label*="Subtarea"]')
    return subtasks.count()
  }
}
