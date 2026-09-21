import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardPage } from '../../page-objects/dashboard.page'

test.describe('Admin - Tarjeta de Almacenamiento e Instancia', () => {
  test('1. Estado real en vivo: debe cargar y mostrar las estadisticas de almacenamiento en la nube y disco', async ({
    adminPage,
  }) => {
    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToAdmin()

    const storageCardTitle = adminPage.getByText('Almacenamiento de Archivos en la Nube')
    await expect(storageCardTitle).toBeVisible({ timeout: 15_000 })

    await expect(adminPage.getByText(/Uso en la nube:/i)).toBeVisible()
    await expect(adminPage.getByText('Archivos en Nube')).toBeVisible()
    await expect(adminPage.getByText('Disponible para Subir')).toBeVisible()
    await expect(adminPage.getByText('Cuota Incluida')).toBeVisible()
    await expect(adminPage.getByText(/Archivos de Proyectos:/i)).toBeVisible()
    await expect(adminPage.getByText(/Avatares:/i)).toBeVisible()
    await expect(adminPage.getByText('Estado del Sistema y Servidor')).toBeVisible()

    await adminPage.screenshot({ path: 'test-results/storage-01-live.png', fullPage: false })
  })

  test('2. Estado de advertencia (75% de 10 GB): debe mostrar indicador en ambar', async ({
    adminPage,
  }) => {
    await adminPage.route('**/api/v1/media/storage/stats', async (route) => {
      const quotaBytes = 10 * 1024 * 1024 * 1024
      const usedBytes = 7.5 * 1024 * 1024 * 1024
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            cloudStorage: {
              quotaBytes,
              usedBytes,
              availableBytes: quotaBytes - usedBytes,
              usedPercentage: 75.0,
              totalFilesCount: 42,
              projectFilesCount: 35,
              projectFilesBytes: 7 * 1024 * 1024 * 1024,
              avatarsCount: 7,
              avatarsBytes: 0.5 * 1024 * 1024 * 1024,
              documentsCount: 0,
              documentsBytes: 0,
            },
            disk: {
              totalBytes: 50 * 1024 * 1024 * 1024,
              usedBytes: 25 * 1024 * 1024 * 1024,
              availableBytes: 25 * 1024 * 1024 * 1024,
              usedPercentage: 50,
            },
            assets: {
              totalAssetsCount: 42,
              totalAssetsBytes: usedBytes,
              documentsCount: 35,
              documentsBytes: 7 * 1024 * 1024 * 1024,
              avatarsCount: 7,
              avatarsBytes: 0.5 * 1024 * 1024 * 1024,
            },
            cachedAt: new Date().toISOString(),
          },
        }),
      })
    })

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToAdmin()

    await expect(adminPage.getByText('75%')).toBeVisible({ timeout: 15_000 })
    await expect(adminPage.getByText('7.5 GB', { exact: true })).toBeVisible()
    await expect(adminPage.getByText('2.5 GB', { exact: true })).toBeVisible()

    await adminPage.screenshot({ path: 'test-results/storage-02-warning.png', fullPage: false })
  })

  test('3. Estado critico (92% de 10 GB): debe mostrar indicador en rojo/rose', async ({
    adminPage,
  }) => {
    await adminPage.route('**/api/v1/media/storage/stats', async (route) => {
      const quotaBytes = 10 * 1024 * 1024 * 1024
      const usedBytes = 9.2 * 1024 * 1024 * 1024
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            cloudStorage: {
              quotaBytes,
              usedBytes,
              availableBytes: quotaBytes - usedBytes,
              usedPercentage: 92.0,
              totalFilesCount: 88,
              projectFilesCount: 70,
              projectFilesBytes: 8.5 * 1024 * 1024 * 1024,
              avatarsCount: 18,
              avatarsBytes: 0.7 * 1024 * 1024 * 1024,
              documentsCount: 0,
              documentsBytes: 0,
            },
            disk: {
              totalBytes: 50 * 1024 * 1024 * 1024,
              usedBytes: 42 * 1024 * 1024 * 1024,
              availableBytes: 8 * 1024 * 1024 * 1024,
              usedPercentage: 84,
            },
            assets: {
              totalAssetsCount: 88,
              totalAssetsBytes: usedBytes,
              documentsCount: 70,
              documentsBytes: 8.5 * 1024 * 1024 * 1024,
              avatarsCount: 18,
              avatarsBytes: 0.7 * 1024 * 1024 * 1024,
            },
            cachedAt: new Date().toISOString(),
          },
        }),
      })
    })

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToAdmin()

    await expect(adminPage.getByText('92%')).toBeVisible({ timeout: 15_000 })
    await expect(adminPage.getByText('9.2 GB', { exact: true })).toBeVisible()
    await expect(adminPage.getByText('819.2 MB', { exact: true })).toBeVisible()

    await adminPage.screenshot({ path: 'test-results/storage-03-critical.png', fullPage: false })
  })

  test('4. Manejo de error de red o backend: debe mostrar tarjeta de reintento visible', async ({
    adminPage,
  }) => {
    await adminPage.route('**/api/v1/media/storage/stats', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Fallo temporal en Media Service' }),
      })
    })

    const dashboard = new DashboardPage(adminPage)
    await dashboard.navigateToAdmin()

    await expect(
      adminPage.getByText('No se pudieron sincronizar las estadísticas de almacenamiento')
    ).toBeVisible({ timeout: 15_000 })
    await expect(adminPage.getByRole('button', { name: /Reintentar conexión/i })).toBeVisible()

    await adminPage.screenshot({ path: 'test-results/storage-04-error.png', fullPage: false })
  })
})
