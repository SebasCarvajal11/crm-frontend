import { expect, test } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

const mockUsersPayload = {
  data: {
    items: [
      {
        id: '11111111-2222-4111-8111-111111111111',
        email: 'anderson.gremoto@gmail.com',
        first_name: 'Anderson',
        last_name: 'Giraldo',
        role: 'client',
        is_active: true,
        deleted_at: null,
        client_kind: null,
        company_name: 'CIMA Tech Corp',
        profession: null,
        force_password_change: false,
        created_at: '2026-01-15T10:00:00Z',
      },
      {
        id: '22222222-3333-4222-8222-222222222222',
        email: 'juan.sebastian.lopez.extended@empresa.com.co',
        first_name: 'Juan Sebastian',
        last_name: 'López de la Vega',
        role: 'client',
        is_active: true,
        deleted_at: null,
        client_kind: null,
        company_name: 'Logística Internacional',
        profession: null,
        force_password_change: true,
        created_at: '2026-01-16T10:00:00Z',
      },
      {
        id: '33333333-4444-4333-8333-333333333333',
        email: 'valeria.quintero@cima.dev',
        first_name: 'Valeria',
        last_name: 'Quintero',
        role: 'admin',
        is_active: true,
        deleted_at: null,
        client_kind: null,
        company_name: 'CIMA Consorcio',
        profession: 'CEO',
        force_password_change: false,
        created_at: '2026-01-10T10:00:00Z',
      },
      {
        id: '44444444-5555-4444-8444-444444444444',
        email: 'carlos.worker@cima.dev',
        first_name: 'Carlos',
        last_name: 'Pérez',
        role: 'worker',
        is_active: false,
        deleted_at: null,
        client_kind: null,
        company_name: null,
        profession: 'Diseñador UI',
        force_password_change: false,
        created_at: '2026-01-12T10:00:00Z',
      },
    ],
    page: 1,
    limit: 10,
    total: 4,
    total_pages: 1,
  },
}

test.describe('Admin: Directorio de Usuarios - Carrusel Responsive Multi-Viewport', () => {
  test('Garantiza dimensiones de tarjeta, visibilidad completa de badge y sin cortes de acciones', async ({
    page,
  }) => {
    await setupDashboard(page, 'admin')

    // Mock endpoint de usuarios de administración
    await page.route('**/api/v1/admin/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: mockUsersPayload,
      })
    })

    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const carouselRegion = page.getByRole('region', {
      name: /directorio de usuarios interactivo/i,
    })
    await expect(carouselRegion).toBeVisible({ timeout: 10_000 })
    await carouselRegion.scrollIntoViewIfNeeded()

    const userCards = page.locator('[data-testid="admin-user-card"]')
    const cardCount = await userCards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Evaluar cada tarjeta visible en pantalla
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const card = userCards.nth(i)
      await expect(card).toBeVisible()

      const metrics = await card.evaluate((el) => {
        const cardRect = el.getBoundingClientRect()
        const badge = el.querySelector('.shrink-0 .rounded-full')
        const badgeRect = badge?.getBoundingClientRect()
        const actions =
          el.querySelector('[data-tour="admin-user-actions"]') ||
          el.querySelector('.border-t')

        return {
          cardWidth: Math.round(cardRect.width),
          cardScrollWidth: el.scrollWidth,
          cardClientWidth: el.clientWidth,
          badgeRight: badgeRect ? Math.round(badgeRect.right) : 0,
          badgeWidth: badgeRect ? Math.round(badgeRect.width) : 0,
          cardRight: Math.round(cardRect.right),
          actionsClientWidth: actions ? actions.clientWidth : 0,
          actionsScrollWidth: actions ? actions.scrollWidth : 0,
        }
      })

      // 1. Cada tarjeta debe tener un ancho confortable (>= 280px) en cualquier dispositivo
      expect(metrics.cardWidth).toBeGreaterThanOrEqual(280)

      // 2. El badge de estado debe estar 100% visible sin ser empujado fuera de la tarjeta
      expect(metrics.badgeRight).toBeLessThanOrEqual(metrics.cardRight + 4)
      expect(metrics.badgeWidth).toBeGreaterThan(0)

      // 3. Las acciones no deben tener overflow desbordante hacia la izquierda
      expect(metrics.actionsScrollWidth).toBeLessThanOrEqual(
        metrics.actionsClientWidth + 2
      )
    }

    // Capturar screenshot del carrusel completo para verificación visual
    await carouselRegion.screenshot({
      path: `tests/test-results/brand/carousel-${test.info().project.name}.png`,
    })
  })
})
