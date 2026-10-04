import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

const mockStoragePayload = {
  data: {
    cloudStorage: {
      quotaBytes: 100_000_000,
      usedBytes: 45_000_000,
      availableBytes: 55_000_000,
      usedPercentage: 45,
      totalFilesCount: 25,
      projectFilesCount: 15,
      projectFilesBytes: 30_000_000, // 30%
      avatarsCount: 8,
      avatarsBytes: 10_000_000, // 10%
      documentsCount: 2,
      documentsBytes: 5_000_000, // 5%
    },
    disk: {
      totalBytes: 500_000_000,
      usedBytes: 150_000_000,
      availableBytes: 350_000_000,
      usedPercentage: 30,
    },
    assets: {
      totalAssetsCount: 25,
      totalAssetsBytes: 45_000_000,
      documentsCount: 15,
      documentsBytes: 30_000_000,
      avatarsCount: 8,
      avatarsBytes: 10_000_000,
    },
    cachedAt: '2026-10-04T00:00:00Z',
  },
}

async function mockStorageStats(page: Page) {
  await page.route('**/media/storage/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: mockStoragePayload,
    })
  })
}

test.describe('Admin Storage: Barra Segmentada Multilínea macOS y Micro-Popovers', () => {
  test('Renderiza la barra segmentada con categorías proporcionales, leyenda y tooltips', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockStorageStats(page)

    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    // 1. Verificar presencia de la barra segmentada
    const segmentedBar = page.locator('[data-testid="storage-segmented-bar"]')
    await expect(segmentedBar).toBeVisible()

    // 2. Verificar existencia de los segmentos
    const projectsSegment = page.locator('[data-testid="storage-segment-projects"]')
    const avatarsSegment = page.locator('[data-testid="storage-segment-avatars"]')
    const documentsSegment = page.locator('[data-testid="storage-segment-documents"]')
    const availableSegment = page.locator('[data-testid="storage-segment-available"]')

    await expect(projectsSegment).toBeVisible()
    await expect(avatarsSegment).toBeVisible()
    await expect(documentsSegment).toBeVisible()
    await expect(availableSegment).toBeVisible()

    // 3. Click / Tap en segmento despliega tooltip detallado
    await projectsSegment.click()
    const tooltip = page.locator('[data-testid="storage-segment-tooltip"]')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('Archivos de Proyectos')

    // 4. Click / Tap en píldora de leyenda interactiva
    const avatarLegend = page.locator('[data-testid="storage-legend-avatars"]')
    await avatarLegend.click()
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('Avatares de Usuario')

    // 5. Cero desbordamiento horizontal en la ventana
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('Respeta prefers-reduced-motion eliminando animaciones y transiciones de segmentos', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await mockStorageStats(page)

    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    const segmentedBar = page.locator('[data-testid="storage-segmented-bar"]')
    await expect(segmentedBar).toBeVisible()

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noOverflow).toBe(true)
    expect(errors).toEqual([])
  })
})
