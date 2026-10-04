import { expect, test, type Page } from '@playwright/test'
import { projectId, setupDashboard } from '../tour/fixtures'

const mockNotificationsList = [
  {
    id: 'notif-brand-1',
    source: 'mention' as const,
    project_id: projectId,
    project_name: 'Identidad Visual CIMA',
    channel: 'internal' as const,
    created_at: new Date().toISOString(),
    title: 'Mención en chat de equipo',
    body: 'Revisión prioritaria de entregables de marca aprobada.',
    resource_type: 'chat_message',
    resource_id: 'res-brand-1',
    message_id: 'msg-brand-1',
    author_sub: 'sub-author-1',
    author_email: 'lead@cima.dev',
  },
  {
    id: 'notif-brand-2',
    source: 'activity' as const,
    project_id: projectId,
    project_name: 'Identidad Visual CIMA',
    channel: 'external' as const,
    created_at: new Date().toISOString(),
    title: 'Nuevo hito contractual',
    body: 'Formalización de contrato lista para firma electrónica.',
    resource_type: 'contract',
    resource_id: 'contract-brand-1',
    message_id: null,
    author_sub: 'sub-author-2',
    author_email: 'contracts@cima.dev',
  },
]

async function mockNotifications(page: Page) {
  await page.route('**/collab/notifications/unread**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: mockNotificationsList,
        },
      })
      return
    }
    await route.fallback()
  })

  await page.route('**/collab/notifications/*/read**', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            id: 'notif-brand-1',
            is_seen: true,
            seen_at: new Date().toISOString(),
          },
        },
      })
      return
    }
    await route.fallback()
  })
}

test.describe('Bandeja de Notificaciones: Descarte con Colapso Suave en CSS Grid', () => {
  test('Renderiza notificaciones y ejecuta descarte con colapso suave sin saltos de layout', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockNotifications(page)

    await page.goto('/dashboard?tab=notifications')
    await page.waitForLoadState('networkidle')

    // 1. Verificar presencia de tarjetas de notificación
    const notif1 = page.locator('[data-notification-id="notif-brand-1"]')
    const notif2 = page.locator('[data-notification-id="notif-brand-2"]')

    await expect(notif1).toBeVisible()
    await expect(notif2).toBeVisible()
    await expect(notif1).toHaveAttribute('data-dismissing', 'false')

    // 2. Verificar clases CSS Grid de colapso suave
    await expect(notif1).toHaveClass(/notification-collapse-row/)

    // 3. Ejecutar descarte de la primera notificación
    const dismissBtn1 = notif1.locator('[data-testid="notification-dismiss-btn"]')
    await expect(dismissBtn1).toBeVisible()
    await dismissBtn1.click()

    // 4. Inmediatamente adquiere data-dismissing="true" para activar grid-template-rows: 0fr
    await expect(notif1).toHaveAttribute('data-dismissing', 'true')

    // 5. Tras la animación de colapso (220ms), el ítem se retira de la vista y el segundo persiste
    await expect(notif1).toBeHidden({ timeout: 4000 })
    await expect(notif2).toBeVisible()

    // 6. Verificar que no exista desbordamiento horizontal en la ventana
    const noWindowOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noWindowOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('Respeta strictly prefers-reduced-motion suprimiendo transiciones espaciales en notificaciones', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await mockNotifications(page)

    await page.goto('/dashboard?tab=notifications')
    await page.waitForLoadState('networkidle')

    const notif1 = page.locator('[data-notification-id="notif-brand-1"]')
    await expect(notif1).toBeVisible()

    // Verificar en CSS computado que las transiciones de transformación están anuladas
    const innerTransition = await notif1
      .locator('.notification-collapse-inner')
      .evaluate((el) => window.getComputedStyle(el).transitionDuration)

    // En reduced motion la duración debe ser 0.01ms o 0s
    expect(parseFloat(innerTransition) < 0.05).toBe(true)
    expect(errors).toEqual([])
  })
})
