import type { Page } from '@playwright/test'
import { getGatewayUrl } from './e2e-env'

const GATEWAY = getGatewayUrl()

export async function loginViaUI(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Correo').fill(email)
  await page.locator('input#password').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
  await page.waitForLoadState('networkidle')
}

export async function loginViaAPI(
  page: Page,
  email: string,
  password: string
): Promise<{ accessToken: string; role: string }> {
  const res = await page.request.post(`${GATEWAY}/api/v1/auth/login`, {
    data: { email, password },
  })
  const json = await res.json()
  const { access_token, user } = json.data

  await page.evaluate(
    ({ token, userEmail }) => {
      const store = (window as unknown as {
        __zustandSessionStore?: { getState: () => { setSession: (t: string, e: string) => void } }
      }).__zustandSessionStore
      if (store) {
        store.getState().setSession(token, userEmail)
      }
      sessionStorage.setItem('cima_access_token', token)
      sessionStorage.setItem('cima_user_email', userEmail)
    },
    { token: access_token, userEmail: email }
  )

  return { accessToken: access_token, role: user.role }
}

export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    const store = (window as unknown as {
      __zustandSessionStore?: { getState: () => { clearSession: () => void } }
    }).__zustandSessionStore
    if (store) {
      store.getState().clearSession()
    }
    sessionStorage.removeItem('cima_access_token')
    sessionStorage.removeItem('cima_user_email')
  })
  await page.context().clearCookies()
  await page.goto('/login')
}

export async function getToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const store = (window as unknown as {
      __zustandSessionStore?: { getState: () => { token: string | null } }
    }).__zustandSessionStore
    return store?.getState().token ?? sessionStorage.getItem('cima_access_token')
  })
}

export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await getToken(page)
  return token !== null && token.length > 0
}

export async function setSessionStorage(
  page: Page,
  data: Record<string, string>
): Promise<void> {
  await page.evaluate((items) => {
    for (const [key, value] of Object.entries(items)) {
      sessionStorage.setItem(key, value)
    }
  }, data)
}

export async function clearSession(page: Page): Promise<void> {
  await page.evaluate(() => sessionStorage.clear())
  await page.context().clearCookies()
}
