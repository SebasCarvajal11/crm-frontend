import { expect, test } from '@playwright/test'
import { projectId, setupDashboard } from '../tour/fixtures'

for (const role of ['admin', 'worker'] as const) {
  test(`resumen editorial conserva información y navegación para ${role}`, async ({ page }, info) => {
    const { errors } = await setupDashboard(page, role)
    await page.goto('/dashboard?tab=overview')

    const overview = page.locator('.overview-stage')
    await expect(overview).toBeVisible()
    await expect(overview.locator('.overview-kpi')).toHaveCount(6)
    await expect(page.locator('[data-tour="overview-identity"]')).toBeVisible()
    await expect(page.locator('[data-tour="overview-notifications"]')).toBeVisible()
    await expect(page.locator('[data-tour="overview-kpis"]')).toBeVisible()

    if (role === 'admin') {
      for (const target of [
        'overview-admin-changes', 'overview-admin-blocked', 'overview-recent-projects',
        'overview-admin-clients', 'overview-admin-workload', 'overview-admin-ranking',
      ]) {
        await expect(page.locator(`[data-tour="${target}"]`)).toBeVisible()
      }
      await expect(page.getByRole('button', { name: 'Abrir proyecto Proyecto de prueba' })).toBeVisible()
      await expect(page.getByText('Sin solicitudes pendientes')).toBeVisible()
    } else {
      await expect(page.locator('[data-tour="overview-worker-tasks"]')).toBeVisible()
      await expect(page.locator('[data-tour="overview-admin-changes"]')).toHaveCount(0)
      await expect(page.getByText('¡Estás al día!')).toBeVisible()
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    expect(errors).toEqual([])
    await page.screenshot({
      path: info.outputPath(`overview-${role}.png`),
      fullPage: !info.project.name.startsWith('mobile'),
    })

    if (role === 'admin') {
      await page.getByRole('button', { name: 'Abrir proyecto Proyecto de prueba' }).click()
      await expect(page).toHaveURL(new RegExp(projectId))
    }
  })
}
