import type { Page, Locator } from '@playwright/test'

export class AccountPage {
  readonly page: Page
  readonly profileSection: Locator
  readonly sessionsSection: Locator
  readonly changePasswordSection: Locator
  readonly avatarDropdown: Locator
  readonly emailDisplay: Locator
  readonly roleDisplay: Locator
  readonly verifiedBadge: Locator
  readonly unverifiedBadge: Locator
  readonly verifyEmailButton: Locator

  constructor(page: Page) {
    this.page = page
    this.profileSection = page.locator('text=Nombres').locator('..')
    this.sessionsSection = page.locator('text=Sesiones activas').locator('..')
    this.changePasswordSection = page.locator('text=Contraseña actual').locator('..')
    this.avatarDropdown = page.getByLabel('Opciones de foto de perfil')
    this.emailDisplay = page.getByRole('main').getByText(/Correoadmin@cima\.dev|admin@cima\.dev/).first()
    this.roleDisplay = page.locator('text=Rol').locator('..')
    this.verifiedBadge = page.getByText('Verificado')
    this.unverifiedBadge = page.getByText('Pendiente de verificacion')
    this.verifyEmailButton = page.getByRole('button', { name: /enlace de verificacion/i })
  }

  async expectLoaded() {
    await this.page.locator('text=Nombres').waitFor({ state: 'visible', timeout: 10_000 })
  }

  async changePassword(oldPassword: string, newPassword: string) {
    await this.page.locator('input[name="old_password"], input[autocomplete="current-password"]').first().fill(oldPassword)
    await this.page.locator('input[name="new_password"], input[autocomplete="new-password"]').first().fill(newPassword)
    await this.page.locator('input[name="confirm"], input[autocomplete="new-password"]').last().fill(newPassword)
    await this.page.getByRole('button', { name: /actualizar contrasena/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async revokeSession(label: string) {
    const revokeButton = this.page.getByLabel(`Revocar sesion de ${label}`)
    await revokeButton.click()
    await this.page.waitForTimeout(500)
  }

  async revokeAllSessions() {
    await this.page.getByRole('button', { name: /cerrar sesion en todos/i }).click()
    await this.page.getByRole('button', { name: /confirmar cierre global/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async openAvatarMenu() {
    await this.avatarDropdown.click()
  }

  async requestEmailVerification() {
    await this.verifyEmailButton.click()
    await this.page.waitForTimeout(1000)
  }
}
