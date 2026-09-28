import { expect, test, type Page } from '@playwright/test'
import { setupDashboard, assertBounds, startTour } from '../tour/fixtures'

type Role = 'admin' | 'worker' | 'client'
async function presenceFixture(page: Page, role: Role = 'admin', mode: 'mixed' | 'offline' | 'empty' = 'mixed') {
  const { errors } = await setupDashboard(page, role)
  const requests: string[] = []
  const heartbeat: string[] = []
  let status = 200
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/v1/identity/presence') {
      heartbeat.push(route.request().method())
      return route.fulfill({ json: { data: { heartbeat_interval_seconds: 60 } } })
    }
    if (url.pathname !== '/api/v1/admin/presence') return route.fallback()
    requests.push(url.search)
    const responseStatus = role === 'admin' ? status : 403
    if (responseStatus !== 200) return route.fulfill({ status: responseStatus, json: { error: 'Presence unavailable' } })
    const now = Date.now()
    const users = (count: number, prefix: string, profile: Role) => Array.from({ length: mode === 'empty' ? 0 : count }, (_, index) => ({
      subject: `${profile}-${index}`, email: `${prefix}.${index}@hurl.test`, first_name: index === 0 ? 'Ana María' : `${prefix} ${index}`,
      last_name: 'Pérez', company_name: profile === 'client' ? 'Estudio CIMA' : null,
      is_online: mode === 'mixed' && index === 0 && profile === 'worker',
      last_activity_at: new Date(now - (index === 0 && profile === 'worker' && mode === 'mixed' ? 20_000 : 120_000 + index * 60_000)).toISOString(),
      last_connection_at: new Date(now - 3600_000).toISOString(),
    }))
    const q = (url.searchParams.get('q') ?? '').toLocaleLowerCase('es')
    const groups = (['worker', 'client', 'admin'] as const).map((profile) => {
      const candidates = users(profile === 'worker' ? 12 : 1, profile === 'worker' ? 'artista' : profile === 'client' ? 'cliente' : 'administrador', profile)
        .filter((user) => [user.email, user.first_name, user.last_name, user.company_name].join(' ').toLocaleLowerCase('es').includes(q))
      const page = Math.min(Number(url.searchParams.get(`${profile}_page`) ?? 1), Math.max(1, Math.ceil(candidates.length / 10)))
      return { role: profile, page, page_size: 10, total: candidates.length, online: candidates.filter((user) => user.is_online).length,
        users: candidates.slice((page - 1) * 10, page * 10) }
    })
    await route.fulfill({ headers: { 'Cache-Control': 'no-store' }, json: { data: {
      as_of: new Date(now).toISOString(), online_for_seconds: 150, refresh_after_seconds: 30, history_days: 7, groups,
    } } })
  })
  return { errors, requests, heartbeat, setStatus: (next: number) => { status = next } }
}

async function openPresence(page: Page) {
  await page.getByTestId('presence-widget-trigger').click()
  const panel = page.getByTestId('presence-panel')
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('heading', { name: 'Colaboradores', exact: true })).toBeVisible()
  await assertBounds(page, 'presence-panel')
  return panel
}

test('segmentar, buscar por nombre, usuario, correo y empresa y paginar sin recortar', async ({ page }, info) => {
  const { errors, requests, heartbeat } = await presenceFixture(page)
  await page.goto('/dashboard?tab=collab')
  await expect.poll(() => heartbeat.length).toBe(1)
  expect(requests).toHaveLength(0)
  await page.clock.install()
  const panel = await openPresence(page)
  await expect(panel).toContainText('1 en línea')
  const worker = panel.getByRole('region', { name: 'Colaboradores', exact: true })
  await expect(worker.getByRole('listitem')).toHaveCount(10)
  await worker.getByRole('button', { name: 'Siguiente en Colaboradores' }).click()
  await expect(worker).toContainText('Página 2 de 2')
  await expect(worker.getByRole('listitem')).toHaveCount(2)
  // Opening the panel must never schedule a search reset that undoes a fast page change.
  await page.clock.fastForward(500)
  await expect(worker).toContainText('Página 2 de 2')
  await expect(panel.getByRole('region', { name: 'Clientes', exact: true }).getByRole('listitem')).toHaveCount(1)
  const search = panel.getByLabel('Buscar en todos los perfiles')
  for (const [q, expected] of [['artista.0', 'artista.0@hurl.test'], ['Ana María Pérez', 'Ana María Pérez'], ['cliente.0@hurl.test', 'cliente.0@hurl.test'], ['Estudio CIMA', 'Estudio CIMA']]) {
    await search.fill(q)
    await expect.poll(() => requests.at(-1)?.includes(encodeURIComponent(q).replace(/%20/g, '+'))).toBe(true)
    await expect(panel.getByRole('listitem').first()).toContainText(expected)
  }
  await search.fill('Sin resultado existente')
  await expect(panel).toContainText('Sin coincidencias')
  await panel.getByRole('button', { name: 'Limpiar búsqueda de presencia' }).click()
  await expect(worker.getByRole('listitem')).toHaveCount(10)
  await page.screenshot({ path: info.outputPath('presence-panel.png'), fullPage: true })
  await panel.getByRole('button', { name: 'Cerrar panel de presencia' }).click()
  await expect(page.getByTestId('presence-widget-trigger')).toBeFocused()
  expect(errors).toEqual([])
})

for (const role of ['worker', 'client'] as const) test(`ocultar interfaz y evitar consultas para ${role}`, async ({ page }) => {
  const { requests, heartbeat, errors } = await presenceFixture(page, role)
  await page.goto('/dashboard?tab=collab')
  await expect(page.getByTestId('help-widget-trigger')).toBeVisible()
  await expect(page.getByTestId('presence-widget-trigger')).toHaveCount(0)
  await expect.poll(() => heartbeat.length).toBe(1)
  expect(requests).toHaveLength(0)
  expect(errors).toEqual([])
})

test('mostrar desconexiones recientes por perfil cuando no hay conectados', async ({ page }, info) => {
  await presenceFixture(page, 'admin', 'offline')
  await page.goto('/dashboard?tab=collab')
  const panel = await openPresence(page)
  await expect(panel).toContainText('0 en línea')
  await expect(panel).toContainText('Sin conexión')
  await expect(panel).toContainText('Actividad hace 2 minutos')
  await expect(panel).toContainText('Último acceso hace 1 hora')
  await page.screenshot({ path: info.outputPath('presence-offline.png'), fullPage: true })
})

test('presentar vacío explícito en los tres perfiles', async ({ page }) => {
  await presenceFixture(page, 'admin', 'empty')
  await page.goto('/dashboard?tab=collab')
  const panel = await openPresence(page)
  await expect(panel).toContainText('Sin otros usuarios recientes')
  await expect(panel.getByText('Sin actividad reciente para este perfil.')).toHaveCount(3)
})

test('recuperar errores y retirar datos al perder permisos', async ({ page }) => {
  const fixture = await presenceFixture(page)
  fixture.setStatus(503)
  await page.goto('/dashboard?tab=collab')
  await page.getByTestId('presence-widget-trigger').click()
  const panel = page.getByTestId('presence-panel')
  await expect(panel.getByRole('alert')).toBeVisible()
  await expect(panel.getByRole('status').first()).toHaveText('Presencia no disponible.')
  fixture.setStatus(200)
  await panel.getByRole('button', { name: 'Actualizar presencia' }).click()
  await expect(panel.getByRole('listitem').first()).toBeVisible()
  fixture.setStatus(403)
  await panel.getByRole('button', { name: 'Actualizar presencia' }).click()
  await expect(panel).toContainText('Tu cuenta ya no tiene acceso')
  await expect(panel.getByRole('status').first()).toHaveText('Acceso restringido.')
  await expect(panel.getByRole('listitem')).toHaveCount(0)
})

test('cancelar polling al cerrar, ocultar pestaña o perder red y reanudar al volver', async ({ page, context }) => {
  const { requests } = await presenceFixture(page)
  await page.clock.install()
  await page.goto('/dashboard?tab=collab')
  const panel = await openPresence(page)
  const first = requests.length
  await page.clock.fastForward(31_000)
  await expect.poll(() => requests.length).toBeGreaterThan(first)
  await context.setOffline(true)
  await expect(panel).toContainText('actualización está pausada')
  const offline = requests.length
  await page.clock.fastForward(65_000)
  expect(requests).toHaveLength(offline)
  await context.setOffline(false)
  await expect.poll(() => requests.length).toBeGreaterThan(offline)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(panel).toContainText('actualización está pausada')
  const hidden = requests.length
  await page.clock.fastForward(65_000)
  expect(requests).toHaveLength(hidden)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(panel.getByRole('button', { name: 'Actualizar presencia' })).toBeEnabled()
  await panel.getByRole('button', { name: 'Cerrar panel de presencia' }).click()
  const closed = requests.length
  await page.clock.fastForward(65_000)
  expect(requests).toHaveLength(closed)
})

test('mantener las tres burbujas separadas y el panel dentro del viewport con zoom, teclado y rotación', async ({ page }, info) => {
  const { errors } = await presenceFixture(page)
  await page.addInitScript(() => localStorage.setItem('cima_ui_zoom', '1.5'))
  await page.goto('/dashboard?tab=collab')
  const bounds = await Promise.all(['zoom-widget-trigger', 'help-widget-trigger', 'presence-widget-trigger'].map((id) => page.getByTestId(id).boundingBox()))
  expect(bounds.every(Boolean)).toBe(true)
  for (let index = 1; index < bounds.length; index++) expect(bounds[index]!.y + bounds[index]!.height).toBeLessThan(bounds[index - 1]!.y)
  const panel = await openPresence(page)
  await expect(panel.getByRole('heading', { name: 'Usuarios en línea' })).toBeFocused()
  await panel.getByLabel('Buscar en todos los perfiles').fill('Ana')
  await page.setViewportSize({ width: 390, height: 330 })
  await assertBounds(page, 'presence-panel')
  await panel.getByRole('button', { name: 'Cerrar panel de presencia' }).click()
  await page.setViewportSize({ width: 844, height: 390 })
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await openPresence(page)
  await page.screenshot({ path: info.outputPath('presence-rotated-dark.png'), fullPage: true })
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('presence-panel')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('suspender tutorial durante el panel y conservar el paso al cerrar', async ({ page }) => {
  await presenceFixture(page)
  await page.goto('/dashboard?tab=collab')
  await startTour(page, 'Misión 1: Exploración del Tablero Kanban')
  const currentStep = await page.getByTestId('tour-guide').locator('header span').first().innerText()
  await page.getByTestId('tour-guide').getByRole('button', { name: 'Minimizar tutorial' }).click()
  const panel = await openPresence(page)
  await expect(page.getByTestId('tour-guide')).toHaveCount(0)
  await panel.getByRole('button', { name: 'Cerrar panel de presencia' }).click()
  await expect(page.getByTestId('tour-guide')).toContainText(currentStep)
})

test('coordinar señales entre pestañas de la misma identidad', async ({ page, context }) => {
  const first = await presenceFixture(page)
  await page.goto('/dashboard?tab=collab')
  await expect.poll(() => first.heartbeat.length).toBe(1)
  const other = await context.newPage()
  const second = await presenceFixture(other)
  await other.goto('/dashboard?tab=collab')
  await expect(other.getByTestId('presence-widget-trigger')).toBeVisible()
  await expect.poll(() => other.evaluate(() => Number(localStorage.getItem('cima_presence_signal:test-user')))).toBeGreaterThan(0)
  expect(second.heartbeat).toHaveLength(0)
  expect(second.requests).toHaveLength(0)
  await other.close()
})

test('retirar el panel al cambiar rol y no reutilizar datos entre identidades', async ({ page }) => {
  const fixture = await presenceFixture(page)
  await page.goto('/dashboard?tab=collab')
  await openPresence(page)
  const switchIdentity = async (role: Role, subject: string) => {
    const token = `fixture.${Buffer.from(JSON.stringify({ role, sub: subject })).toString('base64url')}.fixture`
    await page.evaluate((token) => {
      const store = (window as unknown as { __zustandSessionStore: { getState: () => { setSession: (token: string) => void } } }).__zustandSessionStore
      store.getState().setSession(token)
    }, token)
  }
  await switchIdentity('worker', 'second-worker')
  await expect(page.getByTestId('presence-panel')).toHaveCount(0)
  await expect(page.getByTestId('presence-widget-trigger')).toHaveCount(0)
  fixture.setStatus(503)
  await switchIdentity('admin', 'second-admin')
  await page.getByTestId('presence-widget-trigger').click()
  const panel = page.getByTestId('presence-panel')
  await expect(panel.getByRole('alert')).toBeVisible()
  await expect(panel.getByRole('listitem')).toHaveCount(0)
})
