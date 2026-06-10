import { test as base, type Page, type BrowserContext, type TestInfo } from '@playwright/test'
import { FailureHandler } from '../helpers/failure-handler'

export interface TestUser {
  email: string
  password: string
  role: 'admin' | 'worker' | 'client'
  firstName?: string
  lastName?: string
}

export const USERS: Record<string, TestUser> = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@cima.dev',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'CIMA',
  },
  worker: {
    email: process.env.WORKER_EMAIL || 'ana.martinez@cima.dev',
    password: process.env.WORKER_PASSWORD || 'Demo123!',
    role: 'worker',
    firstName: 'Ana',
    lastName: 'Martínez',
  },
  client: {
    email: process.env.CLIENT_EMAIL || 'contacto@restauranteelbuensabor.com',
    password: process.env.CLIENT_PASSWORD || 'Demo123!',
    role: 'client',
    firstName: 'Contacto',
    lastName: 'El Buen Sabor',
  },
}

async function loginViaUI(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Correo').fill(user.email)
  await page.getByLabel(/contrase(?:n|ñ)a/i).fill(user.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15_000 })
  await page.waitForLoadState('networkidle')
}

async function wrapWithFailureCapture(
  page: Page,
  testInfo: TestInfo,
  setup: () => Promise<void>
): Promise<{ page: Page; failureHandler: FailureHandler }> {
  const testName = testInfo.titlePath.join(' > ')
  const failureHandler = new FailureHandler(page, testName)
  failureHandler.attach()

  await setup()

  return { page, failureHandler }
}

interface AuthFixtures {
  adminPage: Page
  workerPage: Page
  clientPage: Page
  guestPage: Page
  adminContext: BrowserContext
  workerContext: BrowserContext
  clientContext: BrowserContext
  failureHandler: FailureHandler
}

export const test = base.extend<AuthFixtures>({
  failureHandler: async ({ page }, use, testInfo) => {
    const testName = testInfo.titlePath.join(' > ')
    const handler = new FailureHandler(page, testName)
    handler.attach()
    await use(handler)
  },

  adminPage: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    const testName = testInfo.titlePath.join(' > ')
    const failureHandler = new FailureHandler(page, testName)
    failureHandler.attach()

    try {
      await loginViaUI(page, USERS.admin)
      await use(page)
    } catch (error) {
      await failureHandler.captureFailure(error as Error)
      throw error
    } finally {
      await context.close()
    }
  },

  workerPage: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    const testName = testInfo.titlePath.join(' > ')
    const failureHandler = new FailureHandler(page, testName)
    failureHandler.attach()

    try {
      await loginViaUI(page, USERS.worker)
      await use(page)
    } catch (error) {
      await failureHandler.captureFailure(error as Error)
      throw error
    } finally {
      await context.close()
    }
  },

  clientPage: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    const testName = testInfo.titlePath.join(' > ')
    const failureHandler = new FailureHandler(page, testName)
    failureHandler.attach()

    try {
      await loginViaUI(page, USERS.client)
      await use(page)
    } catch (error) {
      await failureHandler.captureFailure(error as Error)
      throw error
    } finally {
      await context.close()
    }
  },

  guestPage: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    const testName = testInfo.titlePath.join(' > ')
    const failureHandler = new FailureHandler(page, testName)
    failureHandler.attach()

    try {
      await use(page)
    } catch (error) {
      await failureHandler.captureFailure(error as Error)
      throw error
    } finally {
      await context.close()
    }
  },

  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await loginViaUI(page, USERS.admin)
    await page.close()
    await use(context)
    await context.close()
  },

  workerContext: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await loginViaUI(page, USERS.worker)
    await page.close()
    await use(context)
    await context.close()
  },

  clientContext: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await loginViaUI(page, USERS.client)
    await page.close()
    await use(context)
    await context.close()
  },
})

export { expect } from '@playwright/test'
export { FailureHandler } from '../helpers/failure-handler'
