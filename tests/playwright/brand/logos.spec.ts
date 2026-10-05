import { test, expect, type Locator, type Page } from '@playwright/test'

async function assertLogo(logo: Locator) {
  await expect(logo).toBeVisible()
  await expect.poll(() => logo.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true)
  // Esperar a que las transiciones del sidebar terminen de entrar al viewport.
  await expect.poll(() => logo.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return bounds.left >= 0 && bounds.right <= window.innerWidth + 1
  })).toBe(true)
  const dimensions = await logo.evaluate((element: HTMLImageElement) => {
    const bounds = element.getBoundingClientRect()
    return {
      ratio: bounds.width / bounds.height,
      originalRatio: element.naturalWidth / element.naturalHeight,
      left: bounds.left,
      right: bounds.right,
      viewport: window.innerWidth,
      filter: getComputedStyle(element).filter,
      background: getComputedStyle(element.parentElement!).backgroundColor,
    }
  })
  expect(dimensions.ratio).toBeCloseTo(dimensions.originalRatio, 1)
  expect(dimensions.left).toBeGreaterThanOrEqual(0)
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport + 1)
  expect(dimensions.background).toBe('rgba(0, 0, 0, 0)')
  const inverse = await logo.evaluate((element) =>
    element.classList.contains('brightness-0') || document.documentElement.classList.contains('dark'),
  )
  if (inverse) {
    expect(dimensions.filter).toContain('brightness(0)')
    expect(dimensions.filter).toContain('invert(1)')
  } else {
    expect(['none', 'brightness(1) invert(0)']).toContain(dimensions.filter)
  }
}

async function assertNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}

test.beforeEach(async ({ page }) => {
  // La suite visual no requiere credenciales ni servicios de producción.
  await page.route('**/api/v1/auth/refresh', (route) => route.fulfill({ status: 401, json: { error: 'No session' } }))
})

test('autenticación conserva marca, formularios y favicon oficial', async ({ page }, testInfo) => {
  await page.goto('/login')
  const logo = page.getByRole('img', { name: 'CIMA — Centro de Innovación Multimedia y Artística', exact: true })
  await assertLogo(logo)
  await assertNoOverflow(page)
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible()
  await page.getByLabel('Correo', { exact: true }).fill('marca@example.com')
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaDeMarca123!')
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeEnabled()
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.png')
  const favicon = await page.request.get('/favicon.png')
  expect(favicon.ok()).toBe(true)
  expect(favicon.headers()['content-type']).toContain('image/png')
  expect((await favicon.body()).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  await page.screenshot({ path: testInfo.outputPath('login.png'), fullPage: true })

  await page.getByRole('link', { name: /olvidaste/i }).click()
  await expect(page).toHaveURL(/forgot-password/)
  await assertLogo(logo)
  await assertNoOverflow(page)
  await page.getByRole('link', { name: /volver al inicio/i }).click()
  await expect(page).toHaveURL(/login/)
})

test('marca institucional permanece legible en modo oscuro y zoom', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('cima_ui_zoom', '1.25'))
  await page.goto('/login')
  const logo = page.getByRole('img', { name: 'CIMA — Centro de Innovación Multimedia y Artística', exact: true })
  await assertLogo(logo)
  await page.evaluate(() => {
    document.documentElement.classList.add('dark')
  })
  await assertLogo(logo)
  await assertNoOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('login-dark-zoom.png'), fullPage: true })
})

test('dashboard utiliza CIMAxis y conserva navegación expandida, compacta y móvil', async ({ page }, testInfo) => {
  const errors: string[] = []
  const unexpectedRequests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    sessionStorage.setItem('cima_access_token', 'brand-test-session')
    sessionStorage.setItem('cima_user_email', 'marca@example.com')
  })
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    const responses: Record<string, unknown> = {
      '/api/v1/identity/me': { data: {
        id: '11111111-1111-4111-8111-111111111111', email: 'marca@example.com',
        role: 'worker', first_name: 'Equipo', last_name: 'CIMA', emailVerifiedAt: '2026-09-28T00:00:00Z',
      } },
      '/api/v1/collab/projects': { data: { items: [], total: 0, page: 1, limit: 100 } },
      '/api/v1/collab/notifications/unread': { data: [] },
      '/api/v1/collab/notifications/unread/count': { data: { unread_count: 0 } },
      '/api/v1/analytics/summary': {},
      '/api/v1/analytics/kpis/current': {},
    }
    if (path === '/api/v1/media/avatars/current') {
      await route.fulfill({ status: 404, json: { error: 'No avatar' } })
    } else if (path in responses) {
      await route.fulfill({ json: responses[path] })
    } else {
      unexpectedRequests.push(path)
      await route.fulfill({ status: 501, json: { error: 'Missing visual fixture' } })
    }
  })
  await page.goto('/dashboard')
  await expect(page.getByText('Hola', { exact: false }).first()).toBeVisible()
  await assertLogo(page.locator('main').getByRole('img', { name: 'CIMAxis', exact: true }))
  await assertNoOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('dashboard-expanded.png'), fullPage: true })
  if ((page.viewportSize()?.width ?? 0) < 768) {
    await assertLogo(page.locator('header').getByRole('img', { name: 'CIMA', exact: true }))
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).click()
    const menu = page.getByRole('complementary', { name: 'Menu de navegacion', includeHidden: true })
    await assertLogo(menu.getByRole('img', { name: 'CIMAxis', exact: true }))
    await page.screenshot({ path: testInfo.outputPath('dashboard-menu.png'), fullPage: true })
    await menu.getByRole('link', { name: 'CRM CIMA', exact: true }).click()
    await expect(menu).toHaveAttribute('aria-hidden', 'true')
  } else {
    const sidebar = page.getByRole('complementary', { name: 'Barra de navegacion lateral' })
    const isTabletCollapsed = (page.viewportSize()?.width ?? 0) < 1024
    if (isTabletCollapsed) {
      await assertLogo(sidebar.getByRole('img', { name: 'CIMA', exact: true }))
      await page.getByRole('button', { name: /expandir barra lateral/i }).click()
      await assertLogo(sidebar.getByRole('img', { name: 'CIMAxis', exact: true }))
      await page.getByRole('button', { name: 'Colapsar barra lateral', exact: true }).click()
      await assertLogo(sidebar.getByRole('img', { name: 'CIMA', exact: true }))
    } else {
      await assertLogo(sidebar.getByRole('img', { name: 'CIMAxis', exact: true }))
      await page.getByRole('button', { name: 'Colapsar barra lateral', exact: true }).click()
      await assertLogo(sidebar.getByRole('img', { name: 'CIMA', exact: true }))
      await sidebar.getByRole('link', { name: 'CRM CIMA', exact: true }).click()
      await expect(page).toHaveURL(/dashboard/)
      await page.getByRole('button', { name: /expandir barra lateral/i }).click()
      await assertLogo(sidebar.getByRole('img', { name: 'CIMAxis', exact: true }))
    }
  }
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await assertLogo(page.locator('main').getByRole('img', { name: 'CIMAxis', exact: true }))
  await assertNoOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('dashboard-dark.png'), fullPage: true })
  expect(errors).toEqual([])
  expect(unexpectedRequests).toEqual([])
})
