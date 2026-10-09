import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

async function mockAnalyticsEndpoints(page: Page, clients = 154, rate = 94.5) {
  await page.route('**/analytics/summary**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        totalClients: clients,
        activeCampaigns: 8,
        projectsInProgress: 14,
        totalProjects: 45,
        totalMarketingInteractions: 840,
      },
    })
  )
  await page.route('**/analytics/kpis/current**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        newClients: 28,
        activeCampaigns: 8,
        projectsInProgress: 14,
        clientsContacted: 840,
        responseRate: rate,
      },
    })
  )
}

test.describe('Ticker Numérico Cinemático (AnimatedCounter / MetricRibbon)', () => {
  test('Renderiza KPIs con tipografía tabular-nums y sin jitter en Overview', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockAnalyticsEndpoints(page, 154, 94.5)

    await page.goto('/dashboard?tab=overview')

    const kpiSection = page.locator('[data-tour="overview-kpis"]')
    await expect(kpiSection).toBeVisible()
    await kpiSection.scrollIntoViewIfNeeded()

    const tabularValues = kpiSection.locator('.tabular-nums')
    expect(await tabularValues.count()).toBeGreaterThan(0)

    await expect.poll(async () => kpiSection.textContent(), { timeout: 4000 }).toContain('154')
    await tabularValues.last().scrollIntoViewIfNeeded()
    await expect.poll(async () => kpiSection.textContent(), { timeout: 4000 }).toContain('94.5%')

    const fontVariant = await tabularValues.first().evaluate((el) => window.getComputedStyle(el).fontVariantNumeric)
    expect(fontVariant).toContain('tabular-nums')

    const noWindowOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    expect(noWindowOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('Respeta prefers-reduced-motion mostrando valores finales inmediatamente', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await mockAnalyticsEndpoints(page, 200, 88)

    await page.goto('/dashboard?tab=overview')

    const kpiSection = page.locator('[data-tour="overview-kpis"]')
    await expect(kpiSection).toBeVisible()
    await kpiSection.scrollIntoViewIfNeeded()

    await expect.poll(async () => kpiSection.textContent(), { timeout: 3000 }).toContain('200')
    await expect.poll(async () => kpiSection.textContent(), { timeout: 3000 }).toContain('88%')
    expect(errors).toEqual([])
  })

  test('Interpola fluidamente entre valores durante refetch o polling de TanStack Query', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockAnalyticsEndpoints(page, 154, 94.5)

    await page.goto('/dashboard?tab=overview')

    const kpiSection = page.locator('[data-tour="overview-kpis"]')
    await expect(kpiSection).toBeVisible()
    await kpiSection.scrollIntoViewIfNeeded()

    const tabularValues = kpiSection.locator('.tabular-nums')
    await expect.poll(async () => kpiSection.textContent(), { timeout: 4000 }).toContain('154')
    await tabularValues.last().scrollIntoViewIfNeeded()
    await expect.poll(async () => kpiSection.textContent(), { timeout: 4000 }).toContain('94.5%')

    await mockAnalyticsEndpoints(page, 280, 99.2)

    await page.evaluate(() => {
      const qc = (window as unknown as {
        __queryClient?: { invalidateQueries: (args: { queryKey: string[] }) => Promise<void> }
      }).__queryClient
      return qc?.invalidateQueries({ queryKey: ['analytics'] })
    })

    await tabularValues.first().scrollIntoViewIfNeeded()
    await expect.poll(async () => kpiSection.textContent(), { timeout: 4000 }).toContain('280')
    await tabularValues.last().scrollIntoViewIfNeeded()
    await expect.poll(async () => kpiSection.textContent(), { timeout: 4000 }).toContain('99.2%')
    expect(errors).toEqual([])
  })
})
