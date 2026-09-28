import { expect, type Page } from '@playwright/test'

export const projectId = '22222222-2222-4222-8222-222222222222'
const project = {
  id: projectId, name: 'Proyecto de prueba', clientName: 'Cliente CIMA', type: 'campaign_service',
  status: 'todo', progressPercent: 20, description: 'Validación del tutorial',
  clientSub: null, adminResponsibleSub: 'test-user', estimatedDueDate: null,
  latestApprovedFileId: null, fileRepositoryUrl: null, isArchived: false,
  createdAt: '2026-09-28T00:00:00Z', updatedAt: '2026-09-28T00:00:00Z',
}
const pageOf = (items: unknown[]) => ({ items, total: items.length, page: 1, limit: 100, total_pages: 1 })

export async function setupDashboard(page: Page, role: 'admin' | 'worker' | 'client' = 'admin', empty = false) {
  const errors: string[] = []
  const mutations: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const token = `fixture.${Buffer.from(JSON.stringify({ role, sub: 'test-user' })).toString('base64url')}.fixture`
  await page.addInitScript(({ token }) => {
    sessionStorage.setItem('cima_access_token', token)
    sessionStorage.setItem('cima_user_email', 'tutorial@example.com')
  }, { token })
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    const method = route.request().method()
    // Background self-presence is independent from the tutorial; it never reads other users.
    if (path === '/api/v1/identity/presence') return route.fulfill({ json: { data: { heartbeat_interval_seconds: 60 } } })
    if (!['GET', 'HEAD'].includes(method)) {
      mutations.push(`${method} ${path}`)
      // Chat read acknowledgements are an existing application effect, not tutorial writes.
      if (path.endsWith('/read')) return route.fulfill({ json: { data: {} } })
      return route.fulfill({ status: 403, json: { error: 'Fixture forbids mutations' } })
    }
    let json: unknown
    if (path.endsWith('/identity/me')) json = { data: { id: '11111111-1111-4111-8111-111111111111', email: 'tutorial@example.com', role, first_name: 'Equipo', last_name: 'CIMA', emailVerifiedAt: '2026-09-28T00:00:00Z' } }
    else if (path.endsWith('/avatars/current')) return route.fulfill({ status: 404, json: {} })
    else if (path.endsWith('/collab/projects')) json = { data: pageOf(empty ? [] : [project]) }
    else if (path.endsWith('/projects/search')) json = { data: [] }
    else if (path.endsWith('/board')) json = { data: { project, members: [], board: { columns: [
      { id: 'col-1', projectId, key: 'pending', title: 'Pendiente', position: 0, isClientVisible: true, isDefault: true },
      { id: 'col-2', projectId, key: 'doing', title: 'En progreso', position: 1, isClientVisible: true, isDefault: true },
    ], tasks: [] } } }
    else if (path.endsWith('/notifications/unread/count')) json = { data: { unread_count: 0 } }
    else if (path.includes('/chat/')) json = { data: pageOf([]) }
    else if (path.endsWith('/brief') || path.endsWith('/contract')) json = { data: null }
    else if (path.endsWith('/members') || path.endsWith('/change-requests') || path.endsWith('/timeline') || path.endsWith('/files') || path.endsWith('/notifications/unread')) json = { data: [] }
    else if (path.endsWith('/account/sessions')) json = { data: [] }
    else if (path.endsWith('/admin/users')) json = { data: pageOf([]) }
    else if (path.endsWith('/admin/storage/tree')) json = { data: { summary: { totalClients: 0, totalProjects: 0, totalFiles: 0, totalBytes: 0, purgedFilesCount: 0, purgedBytes: 0 }, clients: [] } }
    else if (path.endsWith('/media/storage/stats')) json = { data: {
      cloudStorage: { quotaBytes: 1_000_000, usedBytes: 0, availableBytes: 1_000_000, usedPercentage: 0, totalFilesCount: 0, projectFilesCount: 0, projectFilesBytes: 0, avatarsCount: 0, avatarsBytes: 0, documentsCount: 0, documentsBytes: 0 },
      disk: { totalBytes: 1_000_000, usedBytes: 0, availableBytes: 1_000_000, usedPercentage: 0 },
      assets: { totalAssetsCount: 0, totalAssetsBytes: 0, documentsCount: 0, documentsBytes: 0, avatarsCount: 0, avatarsBytes: 0 }, cachedAt: '2026-09-28T00:00:00Z',
    } }
    else if (path.startsWith('/api/v1/marketing/')) json = []
    else if (path.includes('/analytics/summary') || path.includes('/kpis/current')) json = {}
    else if (path.startsWith('/api/v1/analytics/')) json = []
    else return route.fulfill({ status: 503, json: { error: 'Unavailable fixture endpoint' } })
    await route.fulfill({ json })
  })
  return { errors, mutations }
}

export async function openHelp(page: Page) {
  const guideHelp = page.getByRole('button', { name: 'Abrir centro de ayuda', exact: true })
  if (await guideHelp.isVisible()) await guideHelp.click()
  else await page.getByTestId('help-widget-trigger').click()
  await expect(page.getByRole('dialog', { name: 'Centro de ayuda' })).toBeVisible()
}

export async function startTour(page: Page, title: string) {
  await openHelp(page)
  await assertBounds(page, 'help-center')
  await page.getByRole('button', { name: 'Todas las guías', exact: true }).click()
  await page.getByLabel('Buscar guías y acciones').fill(title)
  await page.getByRole('button', { name: `Iniciar ${title}`, exact: true }).click()
  await expect(page.getByTestId('tour-guide')).toBeVisible()
  await expect(page.getByTestId('tour-guide')).toHaveAttribute('aria-busy', 'false')
}

export async function assertBounds(page: Page, testId = 'tour-guide') {
  const guide = page.getByTestId(testId)
  await expect.poll(() => guide.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const viewport = window.visualViewport
    return rect.left >= (viewport?.offsetLeft ?? 0) - 1 && rect.top >= (viewport?.offsetTop ?? 0) - 1 &&
      rect.right <= (viewport?.offsetLeft ?? 0) + (viewport?.width ?? innerWidth) + 1 &&
      rect.bottom <= (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight) + 1
  })).toBe(true)
}
