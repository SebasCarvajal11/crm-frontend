import type { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly forgotPasswordLink: Locator
  readonly errorMessage: Locator
  readonly backToHomeLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Correo')
    this.passwordInput = page.getByLabel(/contrase(?:n|ñ)a/i)
    this.submitButton = page.getByRole('button', { name: 'Entrar' })
    this.forgotPasswordLink = page.getByRole('link', { name: /olvidaste.*contrase(?:n|ñ)a/i })
    this.errorMessage = page.getByRole('alert')
    this.backToHomeLink = page.getByRole('link', { name: /volver al inicio/i })
  }

  async goto() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('networkidle')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
    await this.page.waitForURL('**/dashboard', { timeout: 15_000 })
    await this.page.waitForLoadState('networkidle')
  }

  async loginExpectingError(email: string, password: string): Promise<string> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
    await this.page.waitForTimeout(1000)
    return (await this.errorMessage.textContent()) || ''
  }

  async expectLoginPage() {
    await this.page.waitForURL('**/login')
    await this.emailInput.waitFor({ state: 'visible' })
    await this.passwordInput.waitFor({ state: 'visible' })
    await this.submitButton.waitFor({ state: 'visible' })
  }
}
