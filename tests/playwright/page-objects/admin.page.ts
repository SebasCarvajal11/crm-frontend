import type { Page, Locator } from '@playwright/test'
import { chooseRadixSelectOption } from '../helpers/ui-actions'

export class AdminPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly roleFilter: Locator
  readonly includeDeletedCheckbox: Locator
  readonly userTable: Locator
  readonly prevPageButton: Locator
  readonly nextPageButton: Locator
  readonly inviteClientCard: Locator
  readonly registerWorkerCard: Locator
  readonly inviteAdminCard: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByLabel('Buscar por nombre, empresa, apellido o correo')
    this.roleFilter = page.locator('#admin-role-filter')
    this.includeDeletedCheckbox = page.locator('#admin-include-deleted')
    this.userTable = page.getByRole('table')
    this.prevPageButton = page.getByLabel('Pagina anterior')
    this.nextPageButton = page.getByLabel('Pagina siguiente')
    this.inviteClientCard = page.locator('text=Invitar cliente').locator('..')
    this.registerWorkerCard = page.locator('text=Registrar trabajador').locator('..')
    this.inviteAdminCard = page.locator('text=Invitar administrador').locator('..')
  }

  async expectLoaded() {
    await this.userTable.waitFor({ state: 'visible', timeout: 15_000 })
  }

  async searchUser(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500)
  }

  async filterByRole(role: 'Admin' | 'Trabajador' | 'Cliente' | 'Todos') {
    await chooseRadixSelectOption(this.page, this.roleFilter, role)
    await this.page.waitForTimeout(500)
  }

  async toggleIncludeDeleted() {
    await this.includeDeletedCheckbox.click()
    await this.page.waitForTimeout(500)
  }

  async getUserRows(): Promise<Locator> {
    return this.userTable.locator('tbody tr')
  }

  async getUserCount(): Promise<number> {
    const rows = await this.getUserRows()
    return rows.count()
  }

  async inviteClient(data: {
    email: string
    firstName: string
    lastName: string
    kind: 'natural' | 'juridical'
    company?: string
  }) {
    await this.page.locator('#invite-email').fill(data.email)
    await this.page.locator('#invite-first').fill(data.firstName)
    await this.page.locator('#invite-last').fill(data.lastName)
    await chooseRadixSelectOption(
      this.page,
      this.page.locator('#invite-kind'),
      data.kind === 'juridical' ? 'Persona juridica' : 'Persona natural'
    )
    if (data.kind === 'juridical' && data.company) {
      await this.page.locator('#invite-company').fill(data.company)
    }
    await this.page.getByRole('button', { name: /crear invitacion/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async registerWorker(data: {
    email: string
    firstName: string
    lastName: string
    profession: string
  }) {
    await this.page.locator('#worker-email').fill(data.email)
    await this.page.locator('#worker-first').fill(data.firstName)
    await this.page.locator('#worker-last').fill(data.lastName)
    await this.page.locator('#worker-prof').fill(data.profession)
    await this.page.getByRole('button', { name: /^registrar$/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async inviteAdmin(data: {
    email: string
    firstName: string
    lastName: string
    secretPassword: string
  }) {
    await this.page.locator('#admin-email').fill(data.email)
    await this.page.locator('#admin-first').fill(data.firstName)
    await this.page.locator('#admin-last').fill(data.lastName)
    await this.page.locator('#admin-secret').fill(data.secretPassword)
    await this.page.getByRole('button', { name: /invitar administrador/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async deactivateUser(email: string) {
    const row = this.page.locator(`tr:has-text("${email}")`)
    await row.getByRole('button', { name: /desactivar/i }).click()
    await this.page.waitForTimeout(500)
  }

  async activateUser(email: string) {
    const row = this.page.locator(`tr:has-text("${email}")`)
    await row.getByRole('button', { name: /activar/i }).click()
    await this.page.waitForTimeout(500)
  }

  async archiveUser(email: string) {
    const row = this.page.locator(`tr:has-text("${email}")`)
    await row.getByRole('button', { name: /archivar/i }).click()
    await this.page.getByRole('button', { name: /^archivar$/i }).click()
    await this.page.waitForTimeout(500)
  }

  async restoreUser(email: string) {
    const row = this.page.locator(`tr:has-text("${email}")`)
    await row.getByRole('button', { name: /restaurar/i }).click()
    await this.page.waitForTimeout(500)
  }
}
