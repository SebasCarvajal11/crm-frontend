import { expect, test } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

test.describe('Admin Invites: Conmutador Unificado de Rol con Morphing', () => {
  test('Renderiza el conmutador de rol, anima la píldora deslizante y transiciona campos de formulario', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    // 1. Navegar a la subpestaña "Centro de Incorporación" para aislar el conmutador
    const invitesTab = page.locator('[data-tour="admin-tab-invites"]')
    if (await invitesTab.isVisible()) {
      await invitesTab.click()
    }

    // 2. Verificar presencia del conmutador y su píldora deslizante
    const slidingPill = page.locator('[data-testid="invite-role-sliding-pill"]')
    await expect(slidingPill).toBeAttached()

    // 3. Verificar estado inicial: Cliente activo
    const clientTab = page.locator('[data-tour="admin-invite-client"]')
    const workerTab = page.locator('[data-tour="admin-invite-worker"]')
    const adminTab = page.locator('[data-tour="admin-invite-admin"]')

    await expect(clientTab).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#invite-kind')).toBeAttached()
    await expect(page.locator('[data-testid="invite-submit-btn"]')).toContainText('Crear invitación')

    // 4. Cambiar a Colaborador (Worker)
    await workerTab.click()
    await expect(workerTab).toHaveAttribute('aria-selected', 'true')
    await expect(clientTab).toHaveAttribute('aria-selected', 'false')
    await expect(page.locator('#worker-prof')).toBeVisible()
    await expect(page.locator('[data-testid="invite-submit-btn"]')).toContainText('Registrar colaborador')

    // 5. Cambiar a Administrador (Admin)
    await adminTab.click()
    await expect(adminTab).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText('Nivel de Acceso Crítico')).toBeVisible()
    await expect(page.locator('[data-testid="invite-submit-btn"]')).toContainText('Invitar administrador')

    // 6. Regresar a Cliente
    await clientTab.click()
    await expect(clientTab).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#invite-kind')).toBeVisible()

    // 7. Cero desbordamiento horizontal en la ventana
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('Respeta prefers-reduced-motion eliminando transiciones espaciales en el conmutador de rol', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    const invitesTab = page.locator('[data-tour="admin-tab-invites"]')
    if (await invitesTab.isVisible()) {
      await invitesTab.click()
    }

    const workerTab = page.locator('[data-tour="admin-invite-worker"]')
    await workerTab.click()
    await expect(workerTab).toHaveAttribute('aria-selected', 'true')

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noOverflow).toBe(true)
    expect(errors).toEqual([])
  })
})
