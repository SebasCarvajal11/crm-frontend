import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

const snapshot = {
  snapshotsId: null,
  period: '2026-10',
  calculatedAt: '2026-10-18T10:00:00',
  newClients: 3,
  closedProjects: 1,
  estimatedRevenue: 3500000,
  activeCampaigns: 2,
  clientsContacted: 4,
  responseRate: 50,
  avgCloseDays: 12,
  projectsInProgress: 2,
  calculatedBy: null,
}

const comparison = {
  period: '2026-10',
  previousPeriod: '2026-09',
  kpis: [
    { kpi: 'new_clients', current: 3, previous: 2, deltaPercent: 50 },
    { kpi: 'revenue', current: 3500000, previous: 5000000, deltaPercent: -30 },
    { kpi: 'active_campaigns', current: 2, previous: 0, deltaPercent: null },
    { kpi: 'clients_contacted', current: 4, previous: 4, deltaPercent: 0 },
    { kpi: 'response_rate', current: 50, previous: 40, deltaPercent: 25 },
    { kpi: 'closed_projects', current: 1, previous: 1, deltaPercent: 0 },
    { kpi: 'projects_in_progress', current: 2, previous: 1, deltaPercent: 100 },
    { kpi: 'avg_close_days', current: 12, previous: 15, deltaPercent: -20 },
  ],
}

const revenueDetail = {
  kpi: 'revenue',
  period: '2026-10',
  total: 2,
  kpiValue: 3500000,
  items: [
    { id: '10', title: 'Plan Oro anual', subtitle: 'Acme SAS', date: '2026-10-07T00:36:37', value: 2000000, status: 'Approved', clientId: 'c1', clientName: 'Acme SAS' },
    { id: '11', title: 'Video corporativo', subtitle: 'Beta Ltda', date: '2026-10-12T09:00:00', value: 1500000, status: 'Approved', clientId: 'c2', clientName: 'Beta Ltda' },
  ],
}

const projects = [
  { projectId: 'p1', name: 'Branding Acme', status: 'in_progress', clientId: 'c1', clientName: 'Acme SAS', createdAt: '2026-09-01T10:00:00', updatedAt: '2026-10-10T10:00:00', approvedProposalsValue: 2000000 },
  { projectId: 'p2', name: 'Video Beta', status: 'in_review', clientId: 'c2', clientName: 'Beta Ltda', createdAt: '2026-09-02T10:00:00', updatedAt: '2026-10-09T10:00:00', approvedProposalsValue: 1500000 },
  { projectId: 'p3', name: 'Web Gamma', status: 'completed', clientId: 'c3', clientName: 'Gamma', createdAt: '2026-08-02T10:00:00', updatedAt: '2026-10-01T10:00:00', approvedProposalsValue: 0 },
]

async function mockAnalytics(page: Page) {
  const calls: string[] = []
  await page.route(/\/api\/v1\/(analytics|integration)\//, async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    calls.push(`${route.request().method()} ${path}${url.search}`)
    if (path.includes('/kpis/current')) return route.fulfill({ json: snapshot })
    if (path.endsWith('/kpis/compare')) return route.fulfill({ json: comparison })
    if (path.endsWith('/kpis/revenue/detail')) return route.fulfill({ json: revenueDetail })
    if (/\/kpis\/[a-z_]+\/detail$/.test(path)) {
      return route.fulfill({ json: { kpi: 'x', period: url.searchParams.get('period'), total: 0, kpiValue: 0, items: [] } })
    }
    if (path.endsWith('/analytics/projects')) return route.fulfill({ json: projects })
    if (path.endsWith('/integration/sync')) {
      return route.fulfill({ json: { clientesSincronizados: 5, proyectosSincronizados: 17, fecha: '2026-10-18T12:00:00' } })
    }
    if (path.endsWith('/analytics/summary')) return route.fulfill({ json: {} })
    return route.fulfill({ json: [] })
  })
  return calls
}

test.describe('Analítica: detalle de KPI, variación, proyectos y sincronización', () => {
  test('admin abre el detalle de un KPI, busca y ve proyectos por estado', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls = await mockAnalytics(page)
    await page.goto('/dashboard?tab=analytics')

    const cards = page.locator('[data-tour="analytics-kpi-cards"]')
    await expect(cards).toBeVisible()
    // Variación frente al mes anterior: subida, bajada y "sin dato".
    await expect(cards.getByText('▲ 50 %')).toBeVisible()
    await expect(cards.getByText('▼ 30 %')).toBeVisible()
    await expect(cards.getByText('sin dato')).toBeVisible()

    // El inventario se ocultó.
    await expect(page.locator('[data-tour="analytics-inventory-alerts"]')).toHaveCount(0)
    await expect(page.getByText('Alertas de stock bajo')).toHaveCount(0)

    // La tarjeta abre el panel lateral con el detalle.
    await cards.getByRole('button', { name: /Ingresos estimados/ }).click()
    const sheet = page.getByRole('dialog', { name: 'Detalle: Ingresos estimados' })
    await expect(sheet).toBeVisible()
    await expect(sheet.getByText('2 registros').first()).toBeVisible()
    await expect(sheet.getByText('Plan Oro anual')).toBeVisible()
    await expect(sheet.getByRole('button', { name: /Excel/ })).toBeVisible()
    await expect(sheet.getByRole('button', { name: /PDF/ })).toBeVisible()
    await sheet.getByLabel('Buscar en el detalle').fill('video')
    await expect(sheet.getByText('Plan Oro anual')).toHaveCount(0)
    await expect(sheet.getByText('Mostrando 1 de 2 registros')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()

    // Los endpoints se llaman con el período del selector.
    expect(calls.some((c) => /kpis\/compare\?period=\d{4}-\d{2}/.test(c))).toBe(true)
    expect(calls.some((c) => /kpis\/revenue\/detail\?period=\d{4}-\d{2}/.test(c))).toBe(true)

    // Sección Proyectos con filtro por estado.
    const section = page.locator('[data-tour="analytics-projects"]')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('columnheader', { name: 'Aprobado del cliente' })).toBeVisible()
    await expect(section.getByText('Branding Acme')).toBeVisible()
    await section.getByRole('button', { name: /En revisión/ }).click()
    await expect(section.getByText('Video Beta')).toBeVisible()
    await expect(section.getByText('Branding Acme')).toHaveCount(0)

    expect(errors).toEqual([])
  })

  test('admin sincroniza con el CRM y ve los conteos', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls = await mockAnalytics(page)
    await page.goto('/dashboard?tab=analytics')

    await page.locator('[data-tour="analytics-sync-btn"]').click()
    await expect(page.getByText('Sincronización completada: 5 clientes y 17 proyectos sincronizados.')).toBeVisible()
    expect(calls).toContain('POST /api/v1/integration/sync')
    expect(errors).toEqual([])
  })

  test('worker no ve el botón de sincronizar', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'worker')
    await mockAnalytics(page)
    await page.goto('/dashboard?tab=analytics')

    await expect(page.locator('[data-tour="analytics-kpi-cards"]')).toBeVisible()
    await expect(page.locator('[data-tour="analytics-sync-btn"]')).toHaveCount(0)
    expect(errors).toEqual([])
  })
})
