import { expect, test, type Page } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

type Call = { method: string; path: string; body: unknown }

async function captureBody(request: { postDataJSON: () => unknown }) {
  try {
    return request.postDataJSON()
  } catch {
    return null
  }
}

// ── Cliente: "Mi espacio comercial" ─────────────────────────────────────────
async function mockPortal(page: Page) {
  const calls: Call[] = []
  const state = {
    summary: { clientName: 'Acme SAS', plan: 'Oro', planColor: '#f59e0b', pendingProposals: 1, unreadMessages: 1, approvedProposals: 0 },
    proposals: [
      {
        proposalId: 7,
        title: 'Video corporativo',
        description: 'Video corporativo\nIncluye guion, rodaje y edición',
        value: 1500000,
        status: 'Sent',
        documentUrl: 'https://example.com/p7.pdf',
        createdDate: '2026-10-10',
        responseDate: null,
        clientComment: null,
        projectId: null,
      },
    ] as Record<string, unknown>[],
    messages: [
      { messageId: 'm1', direction: 'OUTBOUND', body: 'Hola, te enviamos la propuesta del video.', createdAt: '2026-10-21T09:00:00', readAt: null, authorName: 'Equipo CIMA' },
    ] as Record<string, unknown>[],
  }
  await page.route(/\/api\/v1\/marketing\/me\//, async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const body = await captureBody(request)
    calls.push({ method: request.method(), path, body })
    if (path.endsWith('/me/summary')) return route.fulfill({ json: state.summary })
    if (path.endsWith('/me/proposals')) return route.fulfill({ json: state.proposals })
    if (path.endsWith('/me/proposals/7/decision')) {
      const { decision, comment } = body as { decision: string; comment: string | null }
      const updated = { ...state.proposals[0], status: decision === 'ACCEPTED' ? 'Approved' : 'Rejected', clientComment: comment, responseDate: '2026-10-22' }
      state.proposals = [updated]
      state.summary = { ...state.summary, pendingProposals: 0, approvedProposals: 1 }
      return route.fulfill({ json: updated })
    }
    if (path.endsWith('/me/messages') && request.method() === 'POST') {
      const sent = { messageId: 'm-new', direction: 'INBOUND', body: (body as { body: string }).body, createdAt: '2026-10-22T10:00:00', readAt: null, authorName: 'Acme SAS' }
      state.messages = [...state.messages, sent]
      return route.fulfill({ status: 201, json: sent })
    }
    if (path.endsWith('/me/messages')) {
      state.messages = state.messages.map((m) => ({ ...m, readAt: m.readAt ?? '2026-10-22T09:59:00' }))
      state.summary = { ...state.summary, unreadMessages: 0 }
      return route.fulfill({ json: state.messages })
    }
    return route.fulfill({ status: 404, json: {} })
  })
  return calls
}

test.describe('Portal del cliente: Mi espacio comercial', () => {
  test('ve la propuesta pendiente, la acepta con comentario y escribe a CIMA', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'client')
    const calls = await mockPortal(page)
    await page.goto('/dashboard?tab=collab')

    // El menú muestra "Mi espacio comercial" con el contador (1 pendiente + 1 mensaje).
    const menu = page.locator('[data-tour="sidebar-tab-portal"]').filter({ visible: true })
    const trigger = page.locator('[data-tour="mobile-navigation-trigger"]').filter({ visible: true })
    await expect(menu.or(trigger).first()).toBeVisible()
    // En móvil el menú lateral está fuera de la pantalla hasta abrirlo.
    if (await trigger.isVisible()) await trigger.click()
    const item = menu.first()
    await expect(item).toHaveAttribute('aria-label', 'Mi espacio comercial (2 pendientes)')
    await item.click()
    await expect(page).toHaveURL(/tab=portal/)

    const header = page.locator('[data-tour="portal-header"]')
    await expect(header).toContainText('Hola, Acme SAS')
    await expect(header.getByTestId('portal-plan')).toContainText('Plan Oro')

    // Propuesta pendiente → detalle.
    const card = page.locator('[data-client-proposal-id="7"]')
    await expect(card).toContainText('Pendiente')
    await card.click()
    const detalle = page.getByRole('dialog', { name: 'Video corporativo' })
    await expect(detalle).toContainText('Incluye guion, rodaje y edición')
    await expect(detalle.getByRole('link', { name: 'Ver documento de la propuesta' })).toHaveAttribute('href', 'https://example.com/p7.pdf')

    // Aceptar con comentario.
    await detalle.getByRole('button', { name: 'Aceptar propuesta' }).click()
    const confirmar = page.getByRole('dialog', { name: '¿Aceptar esta propuesta?' })
    await confirmar.getByLabel('Comentario (opcional)').fill('¡Empecemos la próxima semana!')
    await confirmar.getByRole('button', { name: 'Sí, aceptar propuesta' }).click()
    await expect(confirmar).toBeHidden()
    await expect
      .poll(() => calls.find((c) => c.method === 'PATCH')?.body)
      .toEqual({ decision: 'ACCEPTED', comment: '¡Empecemos la próxima semana!' })
    await expect(detalle.getByTestId('client-proposal-decision')).toContainText('Aceptaste esta propuesta')
    await expect(detalle).toContainText('¡Empecemos la próxima semana!')
    await page.keyboard.press('Escape')
    await expect(card).toContainText('Aceptada')

    // Mensajes con CIMA.
    await page.locator('[data-tour="portal-tab-messages"]').click()
    const chat = page.getByTestId('conversation-view')
    await expect(chat).toContainText('Hola, te enviamos la propuesta del video.')
    const caja = chat.getByLabel('Escribe tu mensaje')
    await caja.fill('Gracias, ¿cuándo empezamos?')
    await expect(chat.getByTestId('message-counter')).toContainText('27/4.000')
    await caja.press('Enter')
    await expect
      .poll(() => calls.find((c) => c.method === 'POST' && c.path.endsWith('/me/messages'))?.body)
      .toEqual({ body: 'Gracias, ¿cuándo empezamos?' })
    await expect(chat.locator('[data-direction="own"]')).toContainText('Gracias, ¿cuándo empezamos?')
    await expect(caja).toHaveValue('')
    expect(errors).toEqual([])
  })

  test('409 al decidir: recarga la lista con aviso; 429 al escribir: mensaje amable', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'client')
    await mockPortal(page)
    await page.route(/\/me\/proposals\/7\/decision$/, (route) =>
      route.fulfill({ status: 409, json: { message: 'La propuesta #7 ya no está pendiente' } })
    )
    await page.route(/\/me\/messages$/, (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 429, json: { message: 'Límite' } }) : route.fallback()
    )
    await page.goto('/dashboard?tab=portal')

    await page.locator('[data-client-proposal-id="7"]').click()
    const detalle = page.getByRole('dialog', { name: 'Video corporativo' })
    await detalle.getByRole('button', { name: 'Rechazar' }).click()
    const confirmar = page.getByRole('dialog', { name: '¿Rechazar esta propuesta?' })
    // El motivo es obligatorio.
    await confirmar.getByRole('button', { name: 'Sí, rechazar propuesta' }).click()
    await expect(confirmar).toContainText('el comentario es obligatorio')
    await confirmar.getByLabel('Motivo del rechazo (obligatorio)').fill('Muy costosa')
    await confirmar.getByRole('button', { name: 'Sí, rechazar propuesta' }).click()
    await expect(confirmar).toBeHidden()
    await expect(detalle).toContainText('ya no estaba pendiente')

    await page.keyboard.press('Escape')
    await page.locator('[data-tour="portal-tab-messages"]').click()
    const chat = page.getByTestId('conversation-view')
    await chat.getByLabel('Escribe tu mensaje').fill('Hola')
    await chat.getByRole('button', { name: 'Enviar' }).click()
    await expect(chat.getByRole('alert')).toContainText('Has enviado muchos mensajes en poco tiempo')
    expect(errors).toEqual([])
  })

  test('cuenta sin sincronizar con marketing', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'client')
    await page.route(/\/api\/v1\/marketing\/me\//, (route) => route.fulfill({ status: 404, json: { message: 'No existe' } }))
    await page.goto('/dashboard?tab=portal')
    await expect(page.getByTestId('portal-not-synced')).toContainText('Tu cuenta aún no está sincronizada con marketing')
    expect(errors).toEqual([])
  })
})

// ── CIMA: bandeja de mensajes ───────────────────────────────────────────────
test.describe('Marketing: bandeja de mensajes', () => {
  test('admin responde desde la bandeja (también por correo) y la conversación queda leída', async ({ page }) => {
    const { errors } = await setupDashboard(page, 'admin')
    const calls: Call[] = []
    let unread = 2
    await page.route(/\/api\/v1\/marketing\/(messages|plans|today)/, async (route) => {
      const request = route.request()
      const path = new URL(request.url()).pathname
      const body = await captureBody(request)
      calls.push({ method: request.method(), path, body })
      if (path.endsWith('/marketing/plans')) {
        return route.fulfill({ json: [{ planId: 'p1', name: 'Oro', color: '#f59e0b', sortOrder: 1, active: true, clientCount: 1 }] })
      }
      if (path.endsWith('/marketing/today')) {
        return route.fulfill({
          json: { clientsWithoutContact: [], proposalsWithoutResponse: [], approvedWithoutProject: [], counts: { clientsWithoutContact: 0, proposalsWithoutResponse: 0, approvedWithoutProject: 0 } },
        })
      }
      if (path.endsWith('/messages/threads')) {
        return route.fulfill({
          json: [
            { clientId: 'c1', clientName: 'Acme SAS', plan: 'Oro', lastMessage: '¿Cuándo empezamos?', lastAt: '2026-10-22T09:00:00', lastDirection: 'INBOUND', unread },
            { clientId: 'c2', clientName: 'Beta Ltda', plan: null, lastMessage: 'Gracias', lastAt: '2026-10-20T09:00:00', lastDirection: 'OUTBOUND', unread: 0 },
          ],
        })
      }
      if (path.endsWith('/messages/c1/read')) {
        unread = 0
        return route.fulfill({ json: { marked: 2 } })
      }
      if (path.endsWith('/messages/c1') && request.method() === 'POST') {
        return route.fulfill({
          status: 201,
          json: {
            messageId: 's1', direction: 'OUTBOUND', body: (body as { body: string }).body, createdAt: '2026-10-22T10:00:00',
            readAt: null, authorName: 'Equipo CIMA', emailDeliveryStatus: 'SIMULATED', emailDetail: 'Modo simulación',
          },
        })
      }
      if (path.endsWith('/messages/c1')) {
        return route.fulfill({
          json: [
            { messageId: 'i1', direction: 'INBOUND', body: 'Hola, vi la propuesta', createdAt: '2026-10-22T08:59:00', readAt: unread ? null : '2026-10-22T09:30:00', authorName: 'Acme SAS' },
            { messageId: 'i2', direction: 'INBOUND', body: '¿Cuándo empezamos?', createdAt: '2026-10-22T09:00:00', readAt: unread ? null : '2026-10-22T09:30:00', authorName: 'Acme SAS' },
          ],
        })
      }
      return route.fulfill({ json: [] })
    })
    await page.goto('/dashboard?tab=marketing')

    // Contador de la pestaña y tarjeta del panel Hoy.
    await expect(page.getByTestId('marketing-messages-badge')).toHaveText('2')
    const hoy = page.getByTestId('today-messages')
    await expect(hoy).toContainText('Acme SAS')
    await hoy.getByRole('button', { name: 'Responder' }).click()

    // Abre la conversación en la pestaña Mensajes y la marca como leída.
    await expect(page.locator('[data-tour="marketing-tab-messages"]')).toHaveAttribute('data-state', 'active')
    const chat = page.getByTestId('conversation-view')
    await expect(chat).toContainText('¿Cuándo empezamos?')
    await expect.poll(() => calls.some((c) => c.method === 'PATCH' && c.path.endsWith('/messages/c1/read'))).toBe(true)
    await expect(page.getByTestId('marketing-messages-badge')).toHaveCount(0)

    // Responde también por correo.
    await chat.getByRole('checkbox', { name: 'Enviar también por correo' }).click()
    await chat.getByLabel('Escribe tu mensaje').fill('Empezamos el lunes. ¡Gracias!')
    await chat.getByRole('button', { name: 'Enviar' }).click()
    await expect
      .poll(() => calls.find((c) => c.method === 'POST' && c.path.endsWith('/messages/c1'))?.body)
      .toEqual({ body: 'Empezamos el lunes. ¡Gracias!', alsoEmail: true })
    await expect(chat.locator('[data-direction="own"]')).toContainText('Empezamos el lunes. ¡Gracias!')
    await expect(chat.getByTestId('message-email-status').locator('[data-delivery="SIMULATED"]')).toBeVisible()

    // El encabezado abre la ficha 360° del cliente.
    await chat.getByRole('button', { name: 'Acme SAS' }).click()
    await expect(page.getByRole('dialog', { name: /Acme SAS|Ficha del cliente/ })).toBeVisible()
    expect(errors).toEqual([])
  })
})
