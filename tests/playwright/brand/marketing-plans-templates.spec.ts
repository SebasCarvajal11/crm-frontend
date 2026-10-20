import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

const plans = [
  { planId: 'p1', name: 'Platinum', color: '#64748b', description: 'Básico', sortOrder: 1, active: true, clientCount: 1 },
  { planId: 'p2', name: 'Oro', color: '#f59e0b', description: 'Pauta y contenido', sortOrder: 2, active: true, clientCount: 5 },
  { planId: 'p3', name: 'Bronce', color: '#a16207', description: null, sortOrder: 3, active: false, clientCount: 1 },
]

const clients = [
  { clientId: 'c1', additionalInfo: 'Acme SAS', contactInfo: 'acme@example.com', plan: 'Oro' },
  { clientId: 'c2', additionalInfo: 'Beta Ltda', contactInfo: 'beta@example.com', plan: 'Bronce' },
]

const campaigns = [
  { campaignId: 7, campaignName: 'Reactivación Acme', campaignType: 'Reactivation', clientId: 'c1', createdBy: 'u', startDate: '2026-10-01', status: 'Active' },
]

const templates = [
  { templateId: 't1', name: 'Saludo WhatsApp', channel: 'WHATSAPP', plan: null, subject: null, body: 'Hola {nombre}, ¿hablamos?', active: true, createdAt: '2026-10-19T10:00:00' },
  { templateId: 't2', name: 'Bienvenida Oro', channel: 'EMAIL', plan: 'Oro', subject: 'Bienvenido {nombre}', body: 'Gracias por elegir el plan {plan}.', active: true, createdAt: '2026-10-19T10:00:00' },
]

const interactions = [
  { interactionId: 1, campaignId: 7, clientId: 'c1', executionId: 3, contactDate: '2026-10-19T09:00:00', interactionType: 'message', channel: 'email', response: null, deliveryStatus: 'FAILED', deliveryError: 'Buzón lleno' },
  { interactionId: 2, campaignId: 7, clientId: 'c1', executionId: 4, contactDate: '2026-10-19T09:30:00', interactionType: 'message', channel: 'email', response: null, deliveryStatus: 'SKIPPED_LIMIT', deliveryError: null },
]

async function mockMarketing(page: Page) {
  const calls: { method: string; path: string; body: unknown }[] = []
  await page.route(/\/api\/v1\/(marketing|analytics)\//, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    let body: unknown
    try {
      body = request.postDataJSON()
    } catch {
      body = null
    }
    calls.push({ method, path: `${path}${url.search}`, body })

    if (path.endsWith('/marketing/plans')) return route.fulfill({ json: plans })
    if (path.endsWith('/marketing/clients')) return route.fulfill({ json: clients })
    if (path.endsWith('/marketing/campaigns')) return route.fulfill({ json: campaigns })
    if (path.endsWith('/marketing/templates')) return route.fulfill({ json: templates })
    if (/\/templates\/[^/]+\/preview$/.test(path)) {
      return route.fulfill({ json: { subject: 'Bienvenido Acme SAS', body: 'Hola Acme SAS, ¿hablamos?' } })
    }
    if (path.endsWith('/notifications/email-quota')) {
      return route.fulfill({ json: { enabled: false, dailyLimit: 60, sentToday: 12, remaining: 48 } })
    }
    if (path.endsWith('/notifications/test-email')) {
      return route.fulfill({ json: { deliveryStatus: 'SIMULATED', detail: 'cimaxis.mail.enabled=false' } })
    }
    if (path.endsWith('/marketing/interactions') && method === 'POST') {
      return route.fulfill({ status: 201, json: { interactionId: 99, ...(body as object) } })
    }
    if (path.endsWith('/marketing/interactions')) return route.fulfill({ json: interactions })
    if (path.includes('/analytics/summary') || path.includes('/kpis/current')) return route.fulfill({ json: {} })
    return route.fulfill({ json: [] })
  })
  return calls
}

test.describe('Marketing: planes configurables, plantillas, correos y WhatsApp', () => {
  test('admin ve los planes con su color, gestiona la pestaña Planes y confirma al desactivar', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockMarketing(page)
    await page.goto('/dashboard?tab=marketing')

    // Clientes: chip con el color del plan y plan inactivo en gris.
    const tabla = page.locator('table').first()
    await expect(tabla.getByText('Oro', { exact: true }).first()).toBeVisible()
    await expect(tabla.getByText('Bronce (inactivo)')).toBeVisible()
    const selector = page.getByLabel('Asignar plan a Acme SAS')
    await expect(selector.locator('option', { hasText: 'Bronce' })).toHaveCount(0)

    // Pestaña Planes (solo admin).
    await page.locator('[data-tour="marketing-tab-plans"]').click()
    await expect(page.getByRole('heading', { name: 'Planes comerciales' })).toBeVisible()
    await expect(page.getByText('Pauta y contenido')).toBeVisible()
    await expect(page.getByRole('button', { name: /Eliminar/ })).toHaveCount(0)

    await page.getByRole('row', { name: /Oro/ }).getByRole('button', { name: /Desactivar/ }).click()
    const confirmacion = page.getByRole('alertdialog')
    await expect(confirmacion).toContainText('¿Desactivar el plan Oro?')
    await expect(confirmacion).toContainText('5 clientes tienen este plan')
    await confirmacion.getByRole('button', { name: 'Cancelar' }).click()

    await page.locator('[data-tour="marketing-new-plan-btn"]').click()
    const dialogo = page.getByRole('dialog', { name: 'Nuevo plan' })
    await expect(dialogo).toBeVisible()
    await dialogo.getByRole('button', { name: 'Crear plan' }).click()
    await expect(dialogo.getByText('El nombre es obligatorio.')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('worker no ve la pestaña Planes y usa Plantillas con vista previa', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'worker')
    const calls = await mockMarketing(page)
    await page.goto('/dashboard?tab=marketing')

    await expect(page.locator('[data-tour="marketing-tab-templates"]')).toBeVisible()
    await expect(page.locator('[data-tour="marketing-tab-plans"]')).toHaveCount(0)

    await page.locator('[data-tour="marketing-tab-templates"]').click()
    await expect(page.getByText('Saludo WhatsApp')).toBeVisible()
    // Explicación de qué es una plantilla, que se puede ocultar.
    const ayuda = page.locator('[data-tour="marketing-templates-help"]')
    await expect(ayuda).toContainText('¿Qué es una plantilla?')
    await expect(ayuda).toContainText('Hola Acme SAS, gracias por confiar en el plan Oro.')
    await ayuda.getByRole('button', { name: /Ocultar/ }).click()
    await expect(ayuda).not.toContainText('Dónde se usa')
    await ayuda.getByRole('button', { name: /Ver explicación/ }).click()
    await expect(ayuda).toContainText('Dónde se usa')
    await page.getByLabel('Filtrar por canal').selectOption('EMAIL')
    await expect(page.getByText('Saludo WhatsApp')).toHaveCount(0)
    await expect(page.getByText('Bienvenida Oro')).toBeVisible()

    await page.getByRole('row', { name: /Bienvenida Oro/ }).getByRole('button', { name: /Vista previa/ }).click()
    const preview = page.getByRole('dialog', { name: /Vista previa: Bienvenida Oro/ })
    await preview.getByLabel('Ver con los datos de').selectOption('c1')
    await expect(preview.getByTestId('template-preview-result')).toContainText('Bienvenido Acme SAS')
    expect(calls.some((c) => c.method === 'POST' && c.path.endsWith('/templates/t2/preview'))).toBe(true)
    expect(errors).toEqual([])
  })

  test('automatizaciones muestran el cupo y el admin envía un correo de prueba; interacciones muestran la entrega', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls = await mockMarketing(page)
    await page.goto('/dashboard?tab=marketing')

    await page.locator('[data-tour="marketing-tab-workflows"]').click()
    const cupo = page.locator('[data-tour="marketing-email-quota"]')
    await expect(cupo).toContainText('Correos hoy: 12 de 60')
    await expect(cupo).toContainText('Envío de correos en modo simulado')

    await page.locator('[data-tour="marketing-test-email-btn"]').click()
    const dialogo = page.getByRole('dialog', { name: 'Enviar correo de prueba' })
    await dialogo.getByLabel('Destinatario').fill('equipo@example.com')
    await dialogo.getByRole('button', { name: 'Enviar', exact: true }).click()
    await expect(dialogo.getByRole('status')).toContainText('Correo de prueba simulado')
    expect(calls).toContainEqual(
      expect.objectContaining({ method: 'POST', body: { to: 'equipo@example.com' } })
    )
    await dialogo.locator('form').getByRole('button', { name: 'Cerrar', exact: true }).click()
    await expect(dialogo).toBeHidden()

    await page.locator('[data-tour="marketing-tab-interactions"]').click()
    await expect(page.locator('[data-delivery="FAILED"]')).toContainText('Falló')
    await expect(page.locator('[data-delivery="SKIPPED_LIMIT"]')).toContainText('Límite diario alcanzado')
    await expect(page.locator('[data-delivery="FAILED"]')).toHaveAttribute('title', 'Buzón lleno')
    await expect(page.locator('[data-delivery="SKIPPED_LIMIT"]')).toHaveAttribute('title', 'Se reintentará mañana')
    expect(errors).toEqual([])
  })

  test('Abrir en WhatsApp arma el mensaje con la plantilla y registra el contacto', async ({ page, context }) => {
    const { errors } = await setupDashboard(page, 'worker')
    const calls = await mockMarketing(page)
    // No se sale a WhatsApp de verdad: se intercepta la pestaña nueva.
    await context.route('https://wa.me/**', (route) => route.fulfill({ body: 'ok' }))
    await page.goto('/dashboard?tab=marketing')

    await page.locator('[data-tour="marketing-whatsapp-btn"]').click()
    const dialogo = page.getByRole('dialog', { name: 'Abrir en WhatsApp' })
    await dialogo.getByLabel('Plantilla').selectOption('t1')
    await expect(dialogo.getByLabel('Mensaje')).toHaveValue('Hola Acme SAS, ¿hablamos?')
    await dialogo.getByLabel('Campaña relacionada').selectOption('7')

    const popupPromise = page.waitForEvent('popup')
    await dialogo.getByRole('button', { name: 'Abrir WhatsApp y registrar' }).click()
    const popup = await popupPromise
    expect(decodeURIComponent(popup.url())).toContain('https://wa.me/?text=Hola Acme SAS, ¿hablamos?')
    await expect(dialogo).toBeHidden()

    expect(calls).toContainEqual(
      expect.objectContaining({
        method: 'POST',
        path: '/api/v1/marketing/interactions',
        body: { campaignId: 7, clientId: 'c1', channel: 'whatsapp', interactionType: 'message', response: null },
      })
    )
    expect(errors).toEqual([])
  })

  test('con pestañas que no caben aparecen flechas para recorrerlas', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 })
    const { errors } = await setupDashboard(page, 'admin')
    await mockMarketing(page)
    await page.goto('/dashboard?tab=marketing')

    const barra = page.locator('[data-tour="marketing-tabs"]')
    const derecha = barra.getByRole('button', { name: 'Ver más pestañas' })
    await expect(derecha).toBeVisible()
    await expect(barra.getByRole('button', { name: 'Ver pestañas anteriores' })).toHaveCount(0)

    const toolbar = barra.locator('div[role="toolbar"]')
    const antes = await toolbar.evaluate((el) => el.scrollLeft)
    await derecha.click()
    await expect.poll(() => toolbar.evaluate((el) => el.scrollLeft)).toBeGreaterThan(antes)
    await expect(barra.getByRole('button', { name: 'Ver pestañas anteriores' })).toBeVisible()

    // Hasta el final: la última pestaña queda visible y la flecha derecha desaparece.
    while (await derecha.isVisible()) await derecha.click()
    await expect(page.locator('[data-tour="marketing-tab-plans"]')).toBeInViewport()
    expect(errors).toEqual([])
  })
})
