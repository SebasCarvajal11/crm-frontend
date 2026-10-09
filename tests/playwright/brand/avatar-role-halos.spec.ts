import { expect, test } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

test.describe('Halos Perimetrales por Rol de Usuario (CIMA CRM)', () => {
  test('Renderiza halo distintivo de administrador en el avatar del usuario', async ({ page }) => {
    await setupDashboard(page, 'admin')
    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    const avatar = page.locator('[data-testid="user-avatar"][data-user-role="admin"]:visible').first()
    await expect(avatar).toBeVisible()
    await expect(avatar).toHaveClass(/role-halo/)
    await expect(avatar).toHaveClass(/role-halo-admin/)
    await expect(avatar).toHaveClass(/role-halo-animated/)
  })

  test('Renderiza halo distintivo de colaborador en el avatar del usuario', async ({ page }) => {
    await setupDashboard(page, 'worker')
    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    const avatar = page.locator('[data-testid="user-avatar"][data-user-role="worker"]:visible').first()
    await expect(avatar).toBeVisible()
    await expect(avatar).toHaveClass(/role-halo/)
    await expect(avatar).toHaveClass(/role-halo-worker/)
    await expect(avatar).toHaveClass(/role-halo-animated/)
  })

  test('Renderiza halo distintivo de cliente en el avatar del usuario', async ({ page }) => {
    await setupDashboard(page, 'client')
    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    const avatar = page.locator('[data-testid="user-avatar"][data-user-role="client"]:visible').first()
    await expect(avatar).toBeVisible()
    await expect(avatar).toHaveClass(/role-halo/)
    await expect(avatar).toHaveClass(/role-halo-client/)
    await expect(avatar).toHaveClass(/role-halo-animated/)
  })

  test('Desactiva animación del halo con prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await setupDashboard(page, 'admin')
    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    const avatar = page.locator('[data-testid="user-avatar"][data-user-role="admin"]:visible').first()
    await expect(avatar).toBeVisible()

    const animation = await avatar.evaluate((el) => window.getComputedStyle(el).animationName)
    expect(animation).toBe('none')
  })
})
