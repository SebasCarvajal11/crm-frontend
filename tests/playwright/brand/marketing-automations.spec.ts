import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

type Call = { method: string; path: string; body: unknown }

const campaigns = [
  {
    campaignId: 1, campaignName: 'Reactivación Oro', campaignType: 'Reactivation', audienceType: 'SEGMENT',
    clientId: null, segmentId: 's1', segmentName: 'Oro sin proyecto', audienceSize: 2,
    createdBy: 'admin', startDate: '2020-01-01', endDate: '2099-12-31', status: 'Active',
  },
  {
    campaignId: 2, campaignName: 'Navidad', campaignType: 'Positioning', audienceType: 'ALL',
    clientId: null, segmentId: null, segmentName: null, audienceSize: 25,
    createdBy: 'admin', startDate: '2020-01-01', endDate: '2099-12-31', status: 'Paused',
  },
]

const workflows = [
  {
    workflowId: 3, campaignId: 1, workflowName: 'Recordatorio sin contacto', triggerType: 'no_contact_x_days',
    noContactDays: 15, scheduledAt: null, actionType: 'send_email', messageTemplate: 'Hola {nombre}', active: true,
  },
  {
    workflowId: 4, campaignId: 1, workflowName: 'Saludo manual', triggerType: 'manual',
    noContactDays: null, scheduledAt: null, actionType: 'send_portal_message', messageTemplate: 'Hola', active: true,
  },
]

const segments = [
  { segmentId: 's1', name: 'Oro sin proyecto', description: 'Clientes Oro sin proyectos', criteria: { plans: ['Oro'], hasProjects: false }, active: true, clientCount: 2 },
  { segmentId: 's2', name: 'Inactivo viejo', description: null, criteria: {}, active: false, clientCount: 4 },
]

async function body(request: { postDataJSON: () => unknown }) {
  try {
    return request.postDataJSON()
  } catch {
    return null
  }
}

async function mockAutomations(page: Page) {
  const calls: Call[] = []
  let whatsappSent = false
  await page.route(/\/api\/v1\/marketing\//, async (route) => {
    const request = route.request()
    const method = request.method()
    const path = new URL(request.url()).pathname
    calls.push({ method, path, body: await body(request) })

    if (path.endsWith('/marketing/campaigns') && method === 'GET') return route.fulfill({ json: campaigns })
    if (path.endsWith('/marketing/campaigns') && method === 'POST') {
      return route.fulfill({ status: 201, json: { ...campaigns[0], campaignId: 9, ...(calls.at(-1)!.body as object) } })
    }
    if (path.endsWith('/marketing/workflows') && method === 'GET') return route.fulfill({ json: workflows })
    if (path.endsWith('/marketing/workflows') && method === 'POST') {
      return route.fulfill({ status: 201, json: { ...workflows[0], workflowId: 10, ...(calls.at(-1)!.body as object) } })
    }
    if (path.endsWith('/workflows/3/preview')) {
      return route.fulfill({
        json: {
          campaignName: 'Reactivación Oro', campaignActive: true, audienceType: 'SEGMENT', audienceSize: 2, nextRunAt: null,
          eligible: [{ clientId: 'c1', name: 'Acme SAS', plan: 'Oro' }],
          skipped: [{ clientId: 'c2', name: 'Beta Ltda', reason: 'Ya lo recibió hace 3 días' }],
        },
      })
    }
    if (path.endsWith('/workflows/4/run-now')) {
      return route.fulfill({
        json: {
          executed: [
            { clientId: 'c1', name: 'Acme SAS', result: 'success', deliveryStatus: null, detail: null },
            { clientId: 'c2', name: 'Beta Ltda', result: 'failed', deliveryStatus: 'FAILED', detail: 'El cliente no tiene portal' },
          ],
          skipped: [],
        },
      })
    }
    if (path.endsWith('/marketing/segments/saved') && method === 'GET') return route.fulfill({ json: segments })
    if (path.endsWith('/marketing/segments/saved') && method === 'POST') {
      return route.fulfill({ status: 201, json: { segmentId: 's9', active: true, clientCount: 3, ...(calls.at(-1)!.body as object) } })
    }
    if (path.endsWith('/segments/saved/s1/active')) {
      return route.fulfill({ status: 409, json: { message: 'La campaña activa "Reactivación Oro" usa este segmento' } })
    }
    if (path.endsWith('/marketing/segments/preview')) {
      return route.fulfill({ json: { total: 3, clients: [], criteria: {} } })
    }
    if (path.endsWith('/marketing/today')) {
      return route.fulfill({
        json: {
          clientsWithoutContact: [], proposalsWithoutResponse: [], approvedWithoutProject: [],
          whatsappPending: whatsappSent
            ? []
            : [{ interactionId: 21, clientId: 'c1', clientName: 'Acme SAS', message: 'Hola Acme, ¿hablamos?', createdAt: '2026-10-22T08:00:00', workflowName: 'Reactivación' }],
          counts: { clientsWithoutContact: 0, proposalsWithoutResponse: 0, approvedWithoutProject: 0, whatsappPending: whatsappSent ? 0 : 1 },
        },
      })
    }
    if (path.endsWith('/whatsapp/pending/21/sent')) {
      whatsappSent = true
      return route.fulfill({ json: { interactionId: 21, deliveryStatus: 'SENT_MANUAL', sentAt: '2026-10-22T09:00:00' } })
    }
    if (path.endsWith('/marketing/clients')) {
      return route.fulfill({ json: [{ clientId: 'c1', additionalInfo: 'Acme SAS', contactInfo: 'acme@example.com', plan: 'Oro', score: 80 }] })
    }
    if (path.endsWith('/notifications/email-quota')) return route.fulfill({ json: { sentToday: 0, dailyLimit: 100, remaining: 100 } })
    return route.fulfill({ json: [] })
  })
  return calls
}

const marketingTab = (page: Page, tab: string) => page.locator(`[data-tour="marketing-tab-${tab}"]`).click()

test.describe('Marketing: audiencias y automatizaciones', () => {
  test('campaña para un segmento guardado: la tarjeta muestra su audiencia', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls = await mockAutomations(page)
    await page.goto('/dashboard?tab=marketing')
    await marketingTab(page, 'campaigns')

    await expect(page.getByTestId('campaign-audience').filter({ hasText: 'Segmento: Oro sin proyecto · 2 clientes' })).toBeVisible()
    await expect(page.getByTestId('campaign-audience').filter({ hasText: 'Todos los clientes · 25' })).toBeVisible()

    await page.locator('[data-tour="marketing-new-campaign-btn"]').click()
    const dialog = page.getByRole('dialog', { name: 'Crear Nueva Campaña' })
    await dialog.getByLabel(/Un segmento guardado/).check()
    const select = dialog.getByLabel('Segmento guardado *')
    await expect(select.locator('option')).toHaveText(['Selecciona un segmento', 'Oro sin proyecto · 2 clientes'])
    await select.selectOption('s1')
    await dialog.getByLabel(/Nombre de la campaña/i).fill('Oro Q4')
    await dialog.getByRole('button', { name: 'Crear Campaña' }).click()
    await expect
      .poll(() => calls.find((c) => c.method === 'POST' && c.path.endsWith('/marketing/campaigns'))?.body)
      .toMatchObject({ audienceType: 'SEGMENT', segmentId: 's1', clientId: null, campaignName: 'Oro Q4' })
    expect(errors).toEqual([])
  })

  test('formulario de automatización por disparador y payload sin días donde no aplica', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls = await mockAutomations(page)
    await page.goto('/dashboard?tab=marketing')
    await marketingTab(page, 'workflows')

    // La tarjeta no muestra "(15d)" y avisa la audiencia.
    await expect(page.getByText('Disparo manual', { exact: true })).toBeVisible()
    await expect(page.getByText('(15d)')).toHaveCount(0)

    await page.locator('[data-tour="marketing-new-workflow-btn"]').click()
    const dialog = page.getByRole('dialog', { name: 'Nueva Automatización' })
    await dialog.getByLabel('Nombre del Flujo *').fill('Fin de año')
    await dialog.getByLabel('Campaña Vinculada *').selectOption('1')
    await expect(dialog.getByTestId('workflow-audience')).toContainText('Le llegará a: Segmento Oro sin proyecto · 2 clientes')

    await dialog.getByLabel('Disparador').selectOption('scheduled_date')
    await expect(dialog).toContainText('Se envía una vez cuando llegue esa fecha y hora.')
    await expect(dialog.getByLabel('Días sin contacto (X)')).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: 'Crear Flujo' })).toBeDisabled()
    await dialog.getByLabel('Fecha y hora de envío *').fill('2026-12-01T09:00')

    await dialog.getByLabel('Acción a Ejecutar').selectOption('send_portal_message')
    await expect(dialog).toContainText('Le llega en Mensajes con CIMA de su portal.')
    await dialog.getByLabel('Acción a Ejecutar').selectOption('log_followup')
    await expect(dialog.getByLabel(/Plantilla de la biblioteca/)).toHaveCount(0)

    await dialog.getByRole('button', { name: 'Crear Flujo' }).click()
    await expect
      .poll(() => calls.find((c) => c.method === 'POST' && c.path.endsWith('/marketing/workflows'))?.body)
      .toMatchObject({ triggerType: 'scheduled_date', scheduledAt: '2026-12-01T09:00:00', actionType: 'log_followup' })
    const sent = calls.find((c) => c.method === 'POST' && c.path.endsWith('/marketing/workflows'))!.body as Record<string, unknown>
    expect(sent).not.toHaveProperty('noContactDays')
    expect(errors).toEqual([])
  })

  test('ver a quién le llegaría y ejecutar ahora un disparo manual', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockAutomations(page)
    await page.goto('/dashboard?tab=marketing')
    await marketingTab(page, 'workflows')

    const recordatorio = page.locator('[data-tour="marketing-workflow-preview-btn"]').first()
    await recordatorio.click()
    const preview = page.getByRole('dialog', { name: '¿A quién le llegaría?' })
    await expect(preview.getByTestId('workflow-eligible')).toContainText('Acme SAS')
    await expect(preview.getByTestId('workflow-skipped')).toContainText('Ya lo recibió hace 3 días')
    await page.keyboard.press('Escape')
    await expect(preview).toBeHidden()

    await page.locator('[data-tour="marketing-workflow-run-btn"]').nth(1).click()
    const confirmar = page.getByRole('alertdialog')
    await expect(confirmar.getByTestId('run-now-warning')).toContainText('le llegará otra vez a toda la audiencia')
    await confirmar.getByRole('button', { name: 'Sí, ejecutar ahora' }).click()
    const resultado = page.getByRole('dialog', { name: 'Resultado de la ejecución' })
    await expect(resultado.getByTestId('run-now-executed')).toContainText('En el portal')
    await expect(resultado.getByTestId('run-now-executed')).toContainText('Falló')
    await expect(resultado).toContainText('El cliente no tiene portal')
    expect(errors).toEqual([])
  })

  test('segmentos guardados: lista, 409 al desactivar y guardar como segmento', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls = await mockAutomations(page)
    await page.goto('/dashboard?tab=marketing')
    await marketingTab(page, 'segments')

    const guardados = page.getByTestId('saved-segments')
    await expect(guardados.locator('[data-saved-segment="s1"]')).toContainText('2 clientes')
    await guardados.locator('[data-saved-segment="s1"]').getByRole('button', { name: 'Desactivar' }).click()
    await expect(guardados.locator('[data-saved-segment="s1"]').getByRole('alert')).toContainText('usa este segmento')

    await page.getByRole('button', { name: 'Calcular segmento' }).click()
    await page.locator('[data-tour="marketing-save-segment-btn"]').click()
    const dialog = page.getByRole('dialog', { name: 'Guardar como segmento' })
    await dialog.getByLabel('Nombre *').fill('Plata activos')
    await dialog.getByRole('button', { name: 'Guardar segmento' }).click()
    await expect
      .poll(() => calls.find((c) => c.method === 'POST' && c.path.endsWith('/segments/saved'))?.body)
      .toMatchObject({ name: 'Plata activos' })
    expect(errors).toEqual([])
  })

  test('panel Hoy: WhatsApp por enviar se abre y se marca como enviado', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'worker')
    const calls = await mockAutomations(page)
    await page.goto('/dashboard?tab=marketing')

    const card = page.getByTestId('today-whatsapp')
    await expect(card).toContainText('Hola Acme, ¿hablamos?')
    await expect(card.getByRole('link', { name: 'Abrir en WhatsApp' })).toHaveAttribute(
      'href',
      `https://wa.me/?text=${encodeURIComponent('Hola Acme, ¿hablamos?')}`
    )
    await card.getByRole('button', { name: 'Marcar como enviado' }).click()
    await expect.poll(() => calls.some((c) => c.method === 'PATCH' && c.path.endsWith('/whatsapp/pending/21/sent'))).toBe(true)
    await expect(card).toContainText('No hay mensajes de WhatsApp por enviar.')
    expect(errors).toEqual([])
  })
})
