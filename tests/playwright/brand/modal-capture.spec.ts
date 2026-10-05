import { expect, test, type Page } from '@playwright/test'
import { projectId, setupDashboard } from '../tour/fixtures'
import path from 'node:path'

const SCREENSHOT_DIR = 'C:\\Users\\27seb\\.gemini\\antigravity\\brain\\d4c68a81-8968-412d-9f97-67e28767334d\\screenshots\\modals'

const mockBoardTasks = [
  {
    id: 'task-1',
    projectId,
    columnId: 'col-1',
    title: 'Diseño de identidad visual',
    description: 'Generación de tokens y piezas publicitarias para la campaña.',
    priority: 'high',
    position: 0,
    assigneeSub: null,
    reporterSub: 'test-user',
    blockedByTaskId: null,
    isClientVisible: true,
    blockType: null,
    blockReason: null,
    blockedAt: null,
    blockedBySub: null,
    deadline: '2026-05-15T00:00:00Z',
    subtasks: [{ id: 'sub-1', title: 'Paleta oficial', isCompleted: true }],
    checklistProgress: 50,
    completedAt: null,
    createdAt: '2026-04-01T12:00:00Z',
    updatedAt: '2026-04-02T15:30:00Z',
  },
]

const mockBoardColumns = [
  { id: 'col-1', projectId, key: 'pending', title: 'Pendiente', position: 0, isClientVisible: true, isDefault: true },
  { id: 'col-2', projectId, key: 'doing', title: 'En progreso', position: 1, isClientVisible: true, isDefault: true },
]

const mockPendingContract = {
  id: 'contract-1',
  projectId,
  providerKind: 'cima',
  providerName: 'CIMA S.A.S.',
  providerTaxId: '901234567-1',
  providerRepresentative: 'Carlos CIMA',
  clientKind: 'juridical',
  clientName: 'Cliente CIMA',
  clientCompanyName: 'Cliente CIMA S.A.S.',
  clientTaxId: '900123456-7',
  clientRepresentative: 'Representante Autorizado',
  clientEmail: 'cliente@cima.co',
  planName: 'Plan Diamante Estratégico',
  monthlyFee: 5400000,
  currency: 'COP',
  taxIncluded: true,
  termMonths: 12,
  serviceScope: 'Transformación digital integral y gestión de pauta.',
  contentSnapshot: 'Términos contractuales oficiales CIMA CRM.',
  status: 'signed',
  createdAt: '2026-04-01T08:00:00Z',
  updatedAt: '2026-04-01T10:00:00Z',
}

const mockAmendments = [
  {
    id: 'amend-1',
    projectId,
    contractId: 'contract-1',
    amendmentNumber: 1,
    title: 'Adición de 2 videos publicitarios',
    amendmentType: 'services',
    serviceScope: 'Producción audiovisual y postproducción de 2 reels publicitarios.',
    additionalFee: 1500000,
    feePaymentType: 'one_time',
    termMonthsExtension: 0,
    additionalTerms: 'Entrega en formato 9:16 en alta resolución.',
    contentSnapshot: 'Se acuerda la producción y entrega de dos (2) piezas audiovisuales para pauta en Instagram y TikTok.',
    status: 'pending_client_signature',
    createdAt: '2026-04-02T10:00:00Z',
  },
]

const mockMessages = [
  {
    id: 'msg-1',
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
    readStatus: { isSeen: true, seenCount: 1, requiredCount: 1, reads: [] },
  },
]

async function setupFullMocks(page: Page) {
  await page.route('**/collab/projects/*/board**', async (route) => {
    const project = {
      id: projectId,
      name: 'Campaña Primavera 2026',
      clientName: 'Cliente CIMA',
      type: 'campaign_service',
      status: 'in_progress',
      progressPercent: 50,
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { data: { project, members: [{ userSub: 'test-user', role: 'admin', email: 'tutorial@example.com' }], board: { columns: mockBoardColumns, tasks: mockBoardTasks } } },
    })
  })

  await page.route('**/collab/projects/*/contract', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { data: mockPendingContract },
    })
  })

  await page.route('**/collab/projects/*/contract-amendments**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { data: mockAmendments },
    })
  })

  await page.route('**/collab/projects/*/chat/external**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { data: { items: mockMessages, total: 1, page: 1, limit: 50, total_pages: 1 } },
    })
  })

  await page.route('**/api/v1/identity/presence**', async (route) => {
    await route.fulfill({ json: { data: { heartbeat_interval_seconds: 60 } } })
  })

  await page.route('**/api/v1/admin/presence**', async (route) => {
    await route.fulfill({
      json: {
        data: {
          as_of: new Date().toISOString(),
          online_for_seconds: 150,
          refresh_after_seconds: 30,
          history_days: 7,
          groups: [
            {
              role: 'worker',
              page: 1,
              page_size: 10,
              total: 2,
              online: 1,
              users: [
                {
                  subject: 'worker-1',
                  email: 'carlos.worker@cima.co',
                  first_name: 'Carlos',
                  last_name: 'Diseñador',
                  company_name: 'CIMA Studio',
                  is_online: true,
                  last_activity_at: new Date().toISOString(),
                  last_connection_at: new Date().toISOString(),
                },
              ],
            },
            {
              role: 'client',
              page: 1,
              page_size: 10,
              total: 1,
              online: 1,
              users: [
                {
                  subject: 'client-1',
                  email: 'contacto@cliente.co',
                  first_name: 'María',
                  last_name: 'Directora',
                  company_name: 'Cliente CIMA S.A.S.',
                  is_online: true,
                  last_activity_at: new Date().toISOString(),
                  last_connection_at: new Date().toISOString(),
                },
              ],
            },
            {
              role: 'admin',
              page: 1,
              page_size: 10,
              total: 1,
              online: 1,
              users: [
                {
                  subject: 'admin-1',
                  email: 'tutorial@example.com',
                  first_name: 'Equipo',
                  last_name: 'CIMA',
                  company_name: null,
                  is_online: true,
                  last_activity_at: new Date().toISOString(),
                  last_connection_at: new Date().toISOString(),
                },
              ],
            },
          ],
        },
      },
    })
  })

  await page.route('**/api/v1/marketing/**', async (route) => {
    const pathName = new URL(route.request().url()).pathname
    if (pathName.endsWith('/clients')) {
      await route.fulfill({ json: [{ clientId: 'cli-1', contactInfo: 'Cliente Prueba (test@cima.co)', additionalInfo: 'Activo' }] })
    } else if (pathName.endsWith('/campaigns')) {
      await route.fulfill({ json: [{ campaignId: 1, campaignName: 'Campaña Digital Q2', status: 'active', type: 'digital' }] })
    } else if (pathName.endsWith('/proposals')) {
      await route.fulfill({ json: [{ proposalId: 'prop-1', clientId: 'cli-1', title: 'Estrategia Redes 2026', estimatedAmount: 5000000, status: 'sent' }] })
    } else {
      await route.fulfill({ json: [] })
    }
  })

  await page.route('**/account/sessions**', async (route) => {
    await route.fulfill({
      json: {
        data: [
          {
            id: 'sess-1',
            device_label: 'Mozilla/5.0 Chrome 122',
            ip_address: '186.84.90.12',
            last_active_at: new Date().toISOString(),
            is_current: false,
          },
        ],
      },
    })
  })
}

test.describe('Modal Audit Screenshot Capture Suite', () => {
  test('01. CreateProjectModal', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const createBtn = page.getByRole('button', { name: 'Nuevo proyecto' })
    if (await createBtn.isVisible()) {
      await createBtn.click()
    } else {
      await page.locator('[data-tour="collab-create-btn"]').click()
    }

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(300)

    const projectName = testInfo.project.name
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `01_create_project_modal_${projectName}.png`),
    })
  })

  test('02. CreateTaskModal', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}`)
    await page.waitForLoadState('networkidle')

    const addTaskBtn = page.locator('[data-tour="workspace-create-task-btn"]').first()
    await expect(addTaskBtn).toBeVisible()
    await addTaskBtn.click()

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(300)

    const projectName = testInfo.project.name
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `02_create_task_modal_${projectName}.png`),
    })
  })

  test('03. TaskSheet', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}`)
    await page.waitForLoadState('networkidle')

    const card = page.locator('.kanban-task-card').first()
    await expect(card).toBeVisible()
    await card.click()

    const sheet = page.locator('[data-slot="sheet-content"]')
    await expect(sheet).toBeVisible()
    await page.waitForTimeout(300)

    const projectName = testInfo.project.name
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `03_task_sheet_${projectName}.png`),
    })
  })

  test('04. BlockTaskDialog', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}`)
    await page.waitForLoadState('networkidle')

    const card = page.locator('.kanban-task-card').first()
    await expect(card).toBeVisible()
    await card.click()

    const sheet = page.locator('[data-slot="sheet-content"]')
    await expect(sheet).toBeVisible()

    const blockBtn = page.getByRole('button', { name: /bloquear/i }).first()
    await expect(blockBtn).toBeVisible()
    await blockBtn.click()

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(300)

    const projectName = testInfo.project.name
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `04_block_task_dialog_${projectName}.png`),
    })
  })

  test('05. ChatExportDialog', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat`)
    await page.waitForLoadState('networkidle')

    const exportBtn = page.locator('button[aria-label="Exportar conversación"]')
    await expect(exportBtn).toBeVisible()
    await exportBtn.click()

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(300)

    const projectName = testInfo.project.name
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `05_chat_export_dialog_${projectName}.png`),
    })
  })

  test('06. ContractAmendmentModal & SignDialog', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=contract`)
    await page.waitForLoadState('networkidle')

    const amendmentsSubTab = page.getByRole('button', { name: /otrosíes y adiciones/i })
    await expect(amendmentsSubTab).toBeVisible()
    await amendmentsSubTab.click()

    // 6a. Open ContractAmendmentModal
    const openBtn = page.locator('[data-testid="open-amendment-modal-btn"]')
    await expect(openBtn).toBeVisible()
    await openBtn.click()

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(300)

    const projectName = testInfo.project.name
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `06a_contract_amendment_modal_${projectName}.png`),
    })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // 6b. Open ContractAmendmentSignDialog
    const signBtn = page.getByRole('button', { name: /firmar otrosí/i }).first()
    if (await signBtn.isVisible()) {
      await signBtn.click()
      const signDialog = page.locator('[data-slot="dialog-content"]')
      await expect(signDialog).toBeVisible()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `06b_contract_amendment_sign_${projectName}.png`),
      })
    }
  })

  test('07. Marketing Modals (Campaign & RegisterContact)', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto('/dashboard?tab=marketing')
    await page.waitForLoadState('networkidle')

    const projectName = testInfo.project.name

    // 7a. Campañas tab -> Nueva campaña
    const campaignsTab = page.locator('button[role="tab"]:has-text("Campañas")')
    if (await campaignsTab.isVisible()) {
      await campaignsTab.click()
      const newCampaignBtn = page.getByRole('button', { name: /nueva campaña/i }).first()
      if (await newCampaignBtn.isVisible()) {
        await newCampaignBtn.click()
        const dialog = page.locator('[data-slot="dialog-content"]')
        await expect(dialog).toBeVisible()
        await page.waitForTimeout(300)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `07a_campaign_form_dialog_${projectName}.png`),
        })
        await page.keyboard.press('Escape')
        await page.waitForTimeout(200)
      }
    }

    // 7b. Interacciones tab -> Registrar contacto
    const interactionsTab = page.locator('button[role="tab"]:has-text("Interacciones")')
    if (await interactionsTab.isVisible()) {
      await interactionsTab.click()
      const regBtn = page.getByRole('button', { name: /registrar contacto/i })
      if (await regBtn.isVisible()) {
        await regBtn.click()
        const dialog = page.locator('[data-slot="dialog-content"]')
        await expect(dialog).toBeVisible()
        await page.waitForTimeout(300)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `07b_register_contact_dialog_${projectName}.png`),
        })
        await page.keyboard.press('Escape')
        await page.waitForTimeout(200)
      }
    }
  })

  test('08. PresencePanel & HelpCenter', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const projectName = testInfo.project.name

    // 8a. Presence Panel
    const presenceTrigger = page.getByTestId('presence-widget-trigger')
    if (await presenceTrigger.isVisible()) {
      await presenceTrigger.click()
      const panel = page.getByTestId('presence-panel')
      await expect(panel).toBeVisible()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `08a_presence_panel_${projectName}.png`),
      })
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }

    // 8b. Help Center
    const helpTrigger = page.getByTestId('help-widget-trigger')
    if (await helpTrigger.isVisible()) {
      await helpTrigger.click()
      const dialog = page.getByTestId('help-center')
      await expect(dialog).toBeVisible()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `08b_help_center_${projectName}.png`),
      })
    }
  })

  test('09. Account AlertDialogs', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await setupFullMocks(page)
    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    const projectName = testInfo.project.name

    // 9a. Password Cancel Confirmation
    const oldPwd = page.locator('#old_password')
    if (await oldPwd.isVisible()) {
      await oldPwd.fill('Pass123!')
      const cancelBtn = page.getByRole('button', { name: 'Cancelar cambios' })
      await expect(cancelBtn).toBeEnabled()
      await cancelBtn.click()

      const alertContent = page.locator('[data-slot="alert-dialog-content"]')
      await expect(alertContent).toBeVisible()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `09a_discard_password_alert_${projectName}.png`),
      })
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }

    // 9b. Sessions Revoke
    const revokeBtn = page.getByRole('button', { name: /cerrar sesión en todos/i })
    if (await revokeBtn.isVisible()) {
      await revokeBtn.click()
      const alertContent = page.locator('[data-slot="alert-dialog-content"]')
      await expect(alertContent).toBeVisible()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `09b_sessions_revoke_alert_${projectName}.png`),
      })
    }
  })
})
