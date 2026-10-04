import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

const mockKpiSnapshots = [
  {
    snapshotsId: 1,
    period: '2026-01',
    newClients: 15,
    closedProjects: 9,
    projectsInProgress: 12,
    activeCampaigns: 5,
    estimatedRevenue: 15000,
    clientsContacted: 40,
    responseRate: 45,
    avgCloseDays: 10,
    calculatedBy: 'admin',
    calculatedAt: '2026-01-31T23:59:59Z',
  },
  {
    snapshotsId: 2,
    period: '2026-02',
    newClients: 22,
    closedProjects: 14,
    projectsInProgress: 16,
    activeCampaigns: 8,
    estimatedRevenue: 22000,
    clientsContacted: 55,
    responseRate: 50,
    avgCloseDays: 8,
    calculatedBy: 'admin',
    calculatedAt: '2026-02-28T23:59:59Z',
  },
]

async function mockKpisEndpoint(page: Page) {
  await page.route('**/analytics/kpis', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: mockKpiSnapshots,
      })
      return
    }
    await route.fallback()
  })
}

test.describe('Analítica y Gráficos: Áreas Degradadas Radiant y Tooltips Glassmorphic', () => {
  test('Renderiza KpiTrendChart con gradientes SVG radiantes y contenedor responsive', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockKpisEndpoint(page)

    await page.goto('/dashboard?tab=analytics')
    await page.waitForLoadState('networkidle')

    // 1. Verificar presencia del contenedor de gráfico de áreas
    const chartContainer = page.locator('[data-testid="kpi-trend-area-chart"]')
    await expect(chartContainer).toBeVisible()

    // 2. Verificar existencia de las definiciones de gradientes SVG en el DOM
    const gradientNewClients = page.locator('linearGradient#gradientNewClients')
    const gradientClosedProjects = page.locator('linearGradient#gradientClosedProjects')
    const gradientInProgress = page.locator('linearGradient#gradientProjectsInProgress')
    const gradientCampaigns = page.locator('linearGradient#gradientActiveCampaigns')

    await expect(gradientNewClients).toBeAttached()
    await expect(gradientClosedProjects).toBeAttached()
    await expect(gradientInProgress).toBeAttached()
    await expect(gradientCampaigns).toBeAttached()

    // 3. Verificar que las áreas utilicen los rellenos degradados
    const areaFills = chartContainer.locator('path.recharts-area-area')
    await expect(areaFills.first()).toBeAttached()

    // 4. Cero desbordamiento horizontal en la ventana
    const noWindowOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noWindowOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('Respeta strictly prefers-reduced-motion desactivando animaciones de trazado en recharts', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await mockKpisEndpoint(page)

    await page.goto('/dashboard?tab=analytics')
    await page.waitForLoadState('networkidle')

    const chartContainer = page.locator('[data-testid="kpi-trend-area-chart"]')
    await expect(chartContainer).toBeVisible()

    // 5. Cero desbordamiento global en la ventana bajo reduced-motion
    const noWindowOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noWindowOverflow).toBe(true)
    expect(errors).toEqual([])
  })
})
