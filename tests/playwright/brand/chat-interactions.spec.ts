import { expect, test, type Page } from '@playwright/test'
import { projectId, setupDashboard } from '../tour/fixtures'

const mockInitialMessages = [
  {
    id: 'msg-brand-1',
    projectId,
    channel: 'external',
    messageType: 'text',
    authorSub: '11111111-1111-4111-8111-111111111111',
    authorEmail: 'tutorial@example.com',
    authorFirstName: 'Equipo',
    authorLastName: 'CIMA',
    authorRole: 'admin',
    authorProfession: 'Lead',
    body: 'Entregable de diseño listo para revisión.',
    mentionedSubs: null,
    metadata: null,
    createdAt: '2026-04-01T10:00:00Z',
    readStatus: {
      isSeen: true,
      seenCount: 2,
      requiredCount: 2,
      reads: [],
    },
  },
]

async function mockChatMessages(page: Page) {
  await page.route(`**/collab/projects/${projectId}/chat/external**`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            items: mockInitialMessages,
            total: mockInitialMessages.length,
            page: 1,
            limit: 50,
            total_pages: 1,
          },
        },
      })
      return
    }
    await route.fallback()
  })
}

test.describe('Chat Colaborativo: Inserción Amortiguada y Morphing de Doble Check', () => {
  test('Renderiza mensajes con doble check animado y soporte de viewport', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockChatMessages(page)

    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat`)
    await page.waitForLoadState('networkidle')

    // 1. Verificar presencia de burbuja de mensaje inicial
    const messageEl = page.locator('[data-message-id="msg-brand-1"]')
    await expect(messageEl).toBeVisible()
    await expect(messageEl).toHaveAttribute('data-newly-arrived', 'false')

    // 2. Verificar icono de doble check azul con morphing
    const receiptBtn = messageEl.locator('[data-testid="chat-read-receipt-btn"]')
    await expect(receiptBtn).toBeVisible()
    await expect(receiptBtn).toHaveAttribute('data-seen-state', 'fully-seen')

    const doubleCheckIcon = receiptBtn.locator('svg')
    await expect(doubleCheckIcon).toHaveClass(/animate-read-receipt-morph/)
    await expect(doubleCheckIcon).toHaveClass(/text-sky-500/)

    // 3. Cero desbordamiento global en la ventana
    const noWindowOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noWindowOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('Respeta strictly prefers-reduced-motion suprimiendo transformaciones en chat', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await mockChatMessages(page)

    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat`)
    await page.waitForLoadState('networkidle')

    const messageEl = page.locator('[data-message-id="msg-brand-1"]')
    await expect(messageEl).toBeVisible()

    const doubleCheckIcon = messageEl.locator('[data-testid="chat-read-receipt-btn"] svg')
    await expect(doubleCheckIcon).toBeVisible()

    const animationName = await doubleCheckIcon.evaluate(
      (el) => window.getComputedStyle(el).animationName
    )
    expect(['none', ''].includes(animationName) || animationName.length === 0).toBe(true)

    expect(errors).toEqual([])
  })
})
