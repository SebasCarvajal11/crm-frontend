import { test, expect, type Page, type Route } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve(
  'C:/Users/27seb/.gemini/antigravity/brain/e2057b0d-12c6-4807-b5cd-ffe30e2c58d5/screenshots'
)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const mockStats = {
  data: {
    cloudStorage: {
      quotaBytes: 15 * 1024 * 1024 * 1024,
      usedBytes: 3.2 * 1024 * 1024 * 1024,
      availableBytes: 11.8 * 1024 * 1024 * 1024,
      usedPercentage: 21.3,
      totalFilesCount: 15,
      projectFilesCount: 12,
      projectFilesBytes: 3.0 * 1024 * 1024 * 1024,
      avatarsCount: 3,
      avatarsBytes: 0.2 * 1024 * 1024 * 1024,
      documentsCount: 0,
      documentsBytes: 0,
    },
    disk: {
      totalBytes: 50 * 1024 * 1024 * 1024,
      usedBytes: 20 * 1024 * 1024 * 1024,
      availableBytes: 30 * 1024 * 1024 * 1024,
      usedPercentage: 40.0,
    },
    assets: {
      totalAssetsCount: 15,
      totalAssetsBytes: 3.2 * 1024 * 1024 * 1024,
      documentsCount: 12,
      documentsBytes: 3.0 * 1024 * 1024 * 1024,
      avatarsCount: 3,
      avatarsBytes: 0.2 * 1024 * 1024 * 1024,
    },
    cachedAt: new Date().toISOString(),
  },
}

const mockTree = {
  data: {
    summary: {
      totalClients: 1,
      totalProjects: 1,
      totalFiles: 4,
      totalBytes: 12582912,
      purgedFilesCount: 0,
      purgedBytes: 0,
    },
    clients: [
      {
        clientSub: '11111111-1111-4111-8111-111111111111',
        clientName: 'Valeria Quintero Corporativa',
        totalFiles: 4,
        totalBytes: 12582912,
        projects: [
          {
            projectId: '22222222-2222-4222-8222-222222222222',
            projectName: 'Lanzamiento Estratégico App Móvil 2026',
            totalFiles: 4,
            totalBytes: 12582912,
            folders: {
              document: {
                folderKey: 'document',
                folderLabel: 'Documentos',
                totalFiles: 1,
                totalBytes: 2621440,
                files: [
                  {
                    id: '33333333-3333-4333-8333-333333333333',
                    fileName: 'Acuerdo_Confidencialidad_NDA_Firma_Digital.pdf',
                    storagePath: 'collab/proj-1/nda.pdf',
                    sizeBytes: 2621440,
                    contentType: 'application/pdf',
                    mimeType: 'application/pdf',
                    isPurged: false,
                    isSignedContract: false,
                    uploadedAt: '2026-09-20T10:00:00.000Z',
                    clientSub: '11111111-1111-4111-8111-111111111111',
                    clientName: 'Valeria Quintero Corporativa',
                    projectId: '22222222-2222-4222-8222-222222222222',
                    projectName: 'Lanzamiento Estratégico App Móvil 2026',
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  },
}

async function setupMocks(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('cima_access_token', 'mock-access-token-jwt')
    sessionStorage.setItem('cima_user_email', 'valeria.quintero@cima.dev')
  })

  await page.route('**/api/v1/auth/login', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          accessToken: 'mock-access-token-jwt',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        },
      }),
    })
  })

  await page.route('**/api/v1/identity/me', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: '11111111-1111-4111-8111-111111111111',
          email: 'valeria.quintero@cima.dev',
          role: 'admin',
          first_name: 'Valeria',
          last_name: 'Quintero',
          firstName: 'Valeria',
          lastName: 'Quintero',
          client_kind: null,
          company_name: 'CIMA S.A.S.',
          profession: 'Directora de Operaciones',
          emailVerifiedAt: '2026-01-01T00:00:00.000Z',
          mustChangePassword: false,
          isActive: true,
        },
      }),
    })
  })

  await page.route('**/api/v1/auth/me', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: '11111111-1111-4111-8111-111111111111',
          email: 'valeria.quintero@cima.dev',
          role: 'admin',
          first_name: 'Valeria',
          last_name: 'Quintero',
          firstName: 'Valeria',
          lastName: 'Quintero',
        },
      }),
    })
  })

  await page.route('**/api/v1/collab/projects*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            name: 'Lanzamiento Estratégico App Móvil 2026',
            clientName: 'Valeria Quintero Corporativa',
            type: 'campaign_service',
            status: 'in_progress',
            progressPercent: 75,
          },
        ],
      }),
    })
  })

  await page.route('**/api/v1/collab/projects/22222222-2222-4222-8222-222222222222/board*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          project: {
            id: '22222222-2222-4222-8222-222222222222',
            name: 'Lanzamiento Estratégico App Móvil 2026',
            clientName: 'Valeria Quintero Corporativa',
            type: 'campaign_service',
            status: 'in_progress',
            progressPercent: 75,
            description: 'Campaña y desarrollo integral',
            contractAmount: 15000000,
            startDate: '2026-01-01',
            targetDeliveryDate: '2026-12-31',
            leadId: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          members: [
            {
              projectId: '22222222-2222-4222-8222-222222222222',
              userSub: '11111111-1111-4111-8111-111111111111',
              email: 'valeria.quintero@cima.dev',
              role: 'admin',
              first_name: 'Valeria',
              last_name: 'Quintero',
            },
          ],
          board: {
            columns: [],
            tasks: [],
            tasksTotal: 0,
            tasksLimit: 2000,
            tasksTruncated: false,
          },
        },
      }),
    })
  })

  await page.route('**/api/v1/collab/projects/22222222-2222-4222-8222-222222222222', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Lanzamiento Estratégico App Móvil 2026',
          clientName: 'Valeria Quintero Corporativa',
          type: 'campaign_service',
          status: 'in_progress',
          progressPercent: 75,
          description: 'Campaña y desarrollo integral',
          contractAmount: 15000000,
          startDate: '2026-01-01',
          targetDeliveryDate: '2026-12-31',
          leadId: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          tasks: [],
          members: [
            {
              projectId: '22222222-2222-4222-8222-222222222222',
              userSub: '11111111-1111-4111-8111-111111111111',
              email: 'valeria.quintero@cima.dev',
              role: 'admin',
              first_name: 'Valeria',
              last_name: 'Quintero',
            },
          ],
        },
      }),
    })
  })

  await page.route('**/api/v1/collab/projects/*/chat/*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          items: [
            {
              id: '44444444-4444-4444-8444-444444444444',
              projectId: '22222222-2222-4222-8222-222222222222',
              channel: 'external',
              messageType: 'text',
              authorSub: '11111111-1111-4111-8111-111111111111',
              authorEmail: 'valeria.quintero@cima.dev',
              authorFirstName: 'Valeria',
              authorLastName: 'Quintero',
              authorRole: 'admin',
              authorProfession: null,
              body: 'Se adjuntan los entregables probatorios aprobados.',
              mentionedSubs: null,
              metadata: null,
              createdAt: '2026-09-22T08:00:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 100,
        },
      }),
    })
  })

  await page.route('**/api/v1/collab/projects/*/tasks*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })

  await page.route('**/api/v1/collab/projects/*/files*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })

  await page.route('**/api/v1/collab/projects/*/contract-amendments*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })

  await page.route('**/api/v1/media/storage/stats', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockStats),
    })
  })

  await page.route('**/api/v1/collab/admin/storage/tree', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTree),
    })
  })

  // Mock para vaciado masivo con demora deliberada para capturar la barra de progreso
  await page.route('**/api/v1/collab/admin/storage/purge', async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { success: true, purgedCount: 4, freedBytes: 12582912 },
      }),
    })
  })

  // Mock para depuración individual con demora para capturar barra de progreso
  await page.route('**/api/v1/collab/admin/storage/files/*', async (route: Route) => {
    if (route.request().method() === 'DELETE') {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { success: true, freedBytes: 2621440, purgedFileId: 'file-doc-1' },
        }),
      })
    } else {
      await route.continue()
    }
  })
}

test.describe('Validación Visual de Modales Responsive y Barra de Progreso en 4 Viewports', () => {
  test('1. Mobile (375x812): Margen exterior holgado, sin textos truncados y barra de progreso al depurar', async ({
    page,
  }) => {
    page.on('console', (msg) => console.log('[PAGE CONSOLE]', msg.text()))
    page.on('pageerror', (err) => console.log('[PAGE ERROR]', err.message))

    await setupMocks(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Seleccionar cliente en el explorador de archivos
    const clientItem = page.getByTestId('storage-client-item').first()
    await expect(clientItem).toBeVisible({ timeout: 15_000 })
    await clientItem.click()
    await page.waitForTimeout(500)

    // Abrir diálogo de vaciado masivo
    const emptyBtn = page.getByRole('button', { name: /Vaciar archivos del proyecto/i })
    await expect(emptyBtn).toBeVisible()
    await emptyBtn.click()

    // Validar modal responsive en mobile
    const emptyDialog = page.locator('[data-slot="alert-dialog-content"]')
    await expect(emptyDialog).toBeVisible()

    // Captura del modal de vaciado en Mobile con márgenes confortables
    await page.screenshot({
      path: path.join(outputDir, '01-mobile-empty-project-dialog.png'),
      fullPage: false,
    })

    // Pulsar "Confirmar y Vaciar" para disparar la barra de progreso
    const confirmEmptyBtn = page.getByRole('button', { name: 'Confirmar y Vaciar' })
    await confirmEmptyBtn.click()

    // Esperar y validar barra de progreso porcentual
    const progressBar = emptyDialog.locator('[data-slot="progress"]')
    await expect(progressBar).toBeVisible({ timeout: 5000 })
    await expect(emptyDialog.getByText(/Depurando\.\.\. \d+%/)).toBeVisible()

    // Capturar barra de progreso en acción en Mobile
    await page.screenshot({
      path: path.join(outputDir, '02-mobile-empty-progress-active.png'),
      fullPage: false,
    })

    // Esperar a que culmine
    await expect(emptyDialog).not.toBeVisible({ timeout: 10_000 })

    // Abrir modal de depuración individual
    const purgeBtn = page.locator('button[title="Depurar para liberar espacio"]').first()
    await expect(purgeBtn).toBeVisible()
    await purgeBtn.click()

    const purgeDialog = page.locator('[data-slot="dialog-content"]')
    await expect(purgeDialog).toBeVisible()

    // Captura del diálogo de depuración individual en Mobile
    await page.screenshot({
      path: path.join(outputDir, '03-mobile-purge-dialog.png'),
      fullPage: false,
    })

    // Pulsar Confirmar y Liberar Espacio para ver la barra de progreso
    const confirmPurgeBtn = page.getByRole('button', { name: /Confirmar y Liberar Espacio/i })
    await confirmPurgeBtn.click()

    const purgeProgressBar = purgeDialog.locator('[data-slot="progress"]')
    await expect(purgeProgressBar).toBeVisible({ timeout: 5000 })
    await expect(purgeDialog.getByText(/Depurando\.\.\. \d+%/)).toBeVisible()

    // Captura de barra de progreso en depuración individual Mobile
    await page.screenshot({
      path: path.join(outputDir, '04-mobile-purge-progress-active.png'),
      fullPage: false,
    })

    await expect(purgeDialog).not.toBeVisible({ timeout: 10_000 })
  })

  test('2. Tablet (768x1024), FHD (1920x1080) y UHD (3840x2160): Jerarquía y responsividad limpia', async ({
    page,
  }) => {
    await setupMocks(page)

    const viewports = [
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'fhd-1080p', width: 1920, height: 1080 },
      { name: 'uhd-4k', width: 3840, height: 2160 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const adminTab = page.locator('aside button').filter({ hasText: 'Administración' }).first()
      if (await adminTab.isVisible()) {
        await adminTab.click()
        await page.waitForTimeout(400)
      }

      await page.screenshot({
        path: path.join(outputDir, `05-storage-view-${vp.name}.png`),
        fullPage: false,
      })
    }
  })

  test('3. Mobile (375x812): ChatExportDialog layout holgado, sin truncamiento y sello SHA-256', async ({
    page,
  }) => {
    await setupMocks(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Entrar al proyecto
    const projectCard = page.locator('text=Lanzamiento Estratégico App Móvil 2026').first()
    await expect(projectCard).toBeVisible({ timeout: 10_000 })
    await projectCard.click()
    await page.waitForTimeout(800)

    // Cambiar a la pestaña de Conversación
    const chatTab = page.getByRole('tab', { name: /Conversación/i })
    await expect(chatTab).toBeVisible({ timeout: 5000 })
    await chatTab.click()
    await page.waitForTimeout(500)

    // Abrir diálogo de exportación de chat
    const exportBtn = page.locator('button[aria-label="Exportar conversación"]').first()
    await expect(exportBtn).toBeVisible({ timeout: 10_000 })
    await exportBtn.click()

    const exportDialog = page.locator('[data-slot="dialog-content"]')
    await expect(exportDialog).toBeVisible({ timeout: 5000 })

    // Validar visualización de Proyecto y Custodio sin truncamiento
    await expect(exportDialog.getByText('Lanzamiento Estratégico App Móvil 2026')).toBeVisible()
    await expect(exportDialog.getByText('Valeria Quintero')).toBeVisible()

    // Captura de ChatExportDialog en Mobile
    await page.screenshot({
      path: path.join(outputDir, '05-mobile-chat-export-dialog.png'),
      fullPage: false,
    })

    // Aceptar la certificación de custodia
    const custodyCheckbox = exportDialog.locator('#custody-agreement')
    await custodyCheckbox.click()

    // Pulsar "Descargar Registro Probatorio"
    const downloadBtn = exportDialog.getByRole('button', { name: /Descargar Registro Probatorio/i })
    await downloadBtn.click()

    // Validar generación exitosa del sello SHA-256 (sin error en HTTP)
    const hashLabel = exportDialog.getByText('Sello Criptográfico Generado (SHA-256):')
    await expect(hashLabel).toBeVisible({ timeout: 10_000 })

    // Captura con el sello criptográfico generado en pantalla
    await page.screenshot({
      path: path.join(outputDir, '06-mobile-chat-export-generated.png'),
      fullPage: false,
    })
  })
})
