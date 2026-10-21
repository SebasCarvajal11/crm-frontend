import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

const plans = [
  { planId: 'p1', name: 'Oro', color: '#f59e0b', description: null, sortOrder: 1, active: true, clientCount: 1 },
]

const funnel = {
  period: null,
  stages: [
    { key: 'clients', label: 'Clientes', count: 12 },
    { key: 'contacted', label: 'Contactados', count: 8 },
    { key: 'responded', label: 'Respondieron', count: 3 },
    { key: 'proposal_sent', label: 'Propuesta enviada', count: 0 },
    { key: 'approved', label: 'Aprobada', count: 2 },
    { key: 'project', label: 'Con proyecto', count: 1 },
  ],
  conversionPercent: [66.67, 37.5, 0, null, 50],
}

const stageClients = [
  { clientId: 'c1', name: 'Acme SAS', plan: 'Oro', lastContact: '2026-10-15T10:00:00', score: 80 },
  { clientId: 'c404', name: 'Cliente Fantasma', plan: null, lastContact: null, score: 10 },
]

const timeline = {
  client: {
    clientId: 'c1',
    name: 'Acme SAS',
    email: 'acme@example.com',
    plan: 'Oro',
    createdAt: '2026-08-01T09:00:00',
    lastContact: '2026-10-15T10:00:00',
    score: 80,
  },
  stats: { interactions: 4, responses: 2, proposals: 1, approvedValue: 2000000, projects: 0 },
  events: [
    { type: 'PROPOSAL_DECISION', date: '2026-10-16T10:00:00', title: 'Propuesta aprobada', detail: 'Plan Oro anual', refId: '5' },
    { type: 'RESPONSE', date: '2026-10-15T10:00:00', title: 'El cliente respondió', detail: 'Quiere avanzar', refId: '9' },
    { type: 'MESSAGE', date: '2026-10-10T10:00:00', title: 'Correo enviado', detail: null, refId: '8' },
  ],
}

const today = {
  clientsWithoutContact: [
    { clientId: 'c2', name: 'Beta Ltda', plan: null, daysSinceContact: null },
    { clientId: 'c3', name: 'Gamma', plan: 'Oro', daysSinceContact: 20 },
  ],
  proposalsWithoutResponse: [
    { proposalId: 7, title: 'Video corporativo', clientId: 'c3', clientName: 'Gamma', daysOpen: 9, value: 1500000 },
  ],
  approvedWithoutProject: [],
  counts: { clientsWithoutContact: 24, proposalsWithoutResponse: 1, approvedWithoutProject: 0 },
}

const proposals = [
  { proposalId: 7, clientId: 'c3', description: 'Video corporativo', status: 'Sent', estimatedValue: 1500000, createdDate: '2026-10-10' },
  { proposalId: 5, clientId: 'c1', description: 'Plan Oro anual\nIncluye pauta', status: 'Approved', estimatedValue: 2000000, createdDate: '2026-10-01', projectId: null },
]

async function mockCommercial(page: Page, todayPayload = today) {
  const calls: { method: string; path: string; body: unknown }[] = []
  await page.route(/\/api\/v1\/(marketing\/|identity\/search|collab\/projects$)/, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    let body: unknown
    try {
      body = request.postDataJSON()
    } catch {
      body = null
    }
    calls.push({ method: request.method(), path: `${path}${url.search}`, body })

    if (path.endsWith('/marketing/plans')) return route.fulfill({ json: plans })
    if (path.endsWith('/marketing/funnel')) return route.fulfill({ json: funnel })
    if (/\/funnel\/[a-z_]+\/clients$/.test(path)) return route.fulfill({ json: stageClients })
    if (path.endsWith('/clients/c1/timeline')) return route.fulfill({ json: timeline })
    if (/\/clients\/[^/]+\/timeline$/.test(path)) return route.fulfill({ status: 404, json: { message: 'No existe' } })
    if (path.endsWith('/marketing/today')) return route.fulfill({ json: todayPayload })
    if (path.endsWith('/marketing/proposals')) return route.fulfill({ json: proposals })
    if (path.endsWith('/proposals/5/project')) {
      return route.fulfill({ json: { ...proposals[1], projectId: (body as { projectId: string }).projectId } })
    }
    if (path.endsWith('/marketing/clients')) {
      return route.fulfill({ json: [{ clientId: 'c1', additionalInfo: 'Acme SAS', contactInfo: 'acme@example.com', plan: 'Oro', score: 80 }] })
    }
    if (path.endsWith('/identity/search')) {
      const role = url.searchParams.get('role')
      return route.fulfill({
        json: {
          data:
            role === 'worker'
              ? [{ subject: 'w1', email: 'equipo@example.com', role: 'worker' }]
              : [{ subject: 'c1', email: 'acme@example.com', role: 'client' }],
        },
      })
    }
    if (path.endsWith('/collab/projects') && request.method() === 'POST') {
      return route.fulfill({ status: 201, json: { data: { id: 'proj-99' } } })
    }
    return route.fulfill({ json: [] })
  })
  return calls
}

test.describe('Marketing: Inicio, embudo, panel Hoy y ficha 360°', () => {
  test('Inicio → etapa del embudo → ficha 360° del cliente', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'worker')
    const calls = await mockCommercial(page)
    await page.goto('/dashboard?tab=marketing')

    // Inicio es la pestaña por defecto.
    await expect(page.locator('[data-tour="marketing-tab-home"]')).toHaveAttribute('data-state', 'active')
    const embudo = page.locator('[data-tour="marketing-home-funnel"]')
    await expect(embudo.locator('[data-funnel-stage="responded"]')).toContainText('3')
    await expect(embudo.locator('[data-funnel-conversion="0"]')).toContainText('66,7 %')
    await expect(embudo.locator('[data-funnel-conversion="3"]')).toContainText('—')
    await expect(embudo).toContainText('Siguiente paso: enviarles una propuesta.')

    // El período se envía al backend.
    await embudo.getByLabel('Período del embudo').selectOption({ index: 1 })
    await expect.poll(() => calls.some((c) => /\/marketing\/funnel\?period=\d{4}-\d{2}$/.test(c.path))).toBe(true)

    // Etapa → lista de clientes.
    await embudo.locator('[data-funnel-stage="responded"]').click()
    const etapa = page.getByRole('dialog', { name: 'Etapa: Respondieron' })
    await expect(etapa.getByTestId('funnel-stage-clients')).toContainText('Acme SAS')
    await expect(etapa.locator('[data-score-level="alto"]').first()).toBeVisible()

    // Cliente → ficha 360°.
    await etapa.getByRole('button', { name: 'Acme SAS' }).click()
    const ficha = page.getByRole('dialog', { name: 'Acme SAS' })
    const vista = ficha.getByTestId('client360-view')
    await expect(vista).toContainText('acme@example.com')
    await expect(vista).toContainText('Interés alto')
    await expect(vista.getByRole('meter')).toHaveAttribute('aria-valuenow', '80')
    await expect(vista).toContainText('$ 2.000.000')
    await expect(vista.locator('[data-event-type="PROPOSAL_DECISION"]')).toContainText('Propuesta aprobada')
    await expect(vista.getByRole('button', { name: 'Registrar contacto' })).toBeVisible()
    await expect(vista.getByRole('button', { name: 'Nueva propuesta' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(ficha).toBeHidden()

    // Cliente que no existe en marketing: mensaje claro.
    await etapa.getByRole('button', { name: 'Cliente Fantasma' }).click()
    await expect(page.getByRole('dialog', { name: 'Cliente Fantasma' })).toContainText('Este cliente no está en Marketing')
    expect(errors).toEqual([])
  })

  test('panel Hoy: contadores, "y N más", estado al día y "Ver propuesta"', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'worker')
    await mockCommercial(page)
    await page.goto('/dashboard?tab=marketing')

    const hoy = page.locator('[data-tour="marketing-today"]')
    const sinContacto = hoy.getByTestId('today-clients')
    await expect(sinContacto).toContainText('Nunca contactado')
    await expect(sinContacto).toContainText('Hace 20 días')
    await expect(sinContacto).toContainText('24')
    await expect(sinContacto).toContainText('y 22 más')
    await expect(hoy.getByTestId('today-approved')).toContainText('¡Todo al día!')

    await hoy.getByTestId('today-proposals').getByRole('button', { name: 'Ver propuesta' }).click()
    await expect(page.locator('[data-tour="marketing-tab-proposals"]')).toHaveAttribute('data-state', 'active')
    await expect(page.locator('[data-proposal-id="7"]')).toHaveAttribute('data-highlighted', 'true')
    expect(errors).toEqual([])
  })

  test('admin crea el proyecto desde una propuesta aprobada y queda vinculada', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls = await mockCommercial(page, {
      ...today,
      approvedWithoutProject: [{ proposalId: 5, title: 'Plan Oro anual', clientId: 'c1', clientName: 'Acme SAS', value: 2000000 }],
      counts: { ...today.counts, approvedWithoutProject: 1 },
    })
    await page.goto('/dashboard?tab=marketing')

    await page.locator('[data-tour="marketing-create-project-btn"]').click()
    const modal = page.getByRole('dialog', { name: 'Nuevo proyecto' })
    await expect(modal.getByLabel(/Nombre del proyecto/)).toHaveValue('Plan Oro anual')
    // El cliente de marketing (c1) se encontró en CIMAxios por su correo.
    await expect(modal.getByText('acme@example.com')).toBeVisible()
    await modal.getByPlaceholder('Busca por email del trabajador...').fill('equipo')
    await modal.getByText('equipo@example.com').click()
    await modal.getByRole('button', { name: 'Crear proyecto' }).click()

    await expect
      .poll(() => calls.find((c) => c.method === 'PATCH' && c.path.endsWith('/proposals/5/project'))?.body)
      .toEqual({ projectId: 'proj-99' })
    const creado = calls.find((c) => c.method === 'POST' && c.path.endsWith('/collab/projects'))
    expect(creado?.body).toMatchObject({ name: 'Plan Oro anual', client_sub: 'c1', worker_subs: ['w1'] })
    expect(errors).toEqual([])
  })
})
