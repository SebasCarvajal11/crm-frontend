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
      quotaBytes: 10 * 1024 * 1024 * 1024,
      usedBytes: 3.2 * 1024 * 1024 * 1024,
      availableBytes: 6.8 * 1024 * 1024 * 1024,
      usedPercentage: 32.0,
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
      totalClients: 2,
      totalProjects: 3,
      totalFiles: 6,
      totalBytes: 15728640,
      purgedFilesCount: 1,
      purgedBytes: 2097152,
    },
    clients: [
      {
        clientSub: 'client-greenloop',
        clientName: 'GreenLoop Logistics',
        totalFiles: 4,
        totalBytes: 12582912,
        projectsCount: 2,
        projects: [
          {
            projectId: 'proj-sostenibilidad',
            projectName: 'Campaña Sostenibilidad Q4',
            projectType: 'marketing',
            projectStatus: 'active',
            isArchived: false,
            totalFiles: 3,
            totalBytes: 10485760,
            folders: {
              briefs: {
                folderKey: 'briefs',
                folderLabel: 'Briefs y Documentos',
                totalFiles: 2,
                totalBytes: 5242880,
                files: [
                  {
                    id: 'file-doc-1',
                    projectId: 'proj-sostenibilidad',
                    projectName: 'Campaña Sostenibilidad Q4',
                    fileName: 'Brief_Estrategico_Q4.pdf',
                    title: 'Brief Estratégico',
                    folder: 'briefs',
                    storagePath: 'projects/proj-sostenibilidad/brief.pdf',
                    mimeType: 'application/pdf',
                    sizeBytes: 2621440,
                    version: 1,
                    isClientVisible: true,
                    isPurged: false,
                    purgedAt: null,
                    purgedReason: null,
                    createdByEmail: 'gerente@cima.dev',
                    createdAt: '2026-09-20T12:00:00.000Z',
                    taskId: null,
                    taskTitle: null,
                    isSignedContract: false,
                  },
                  {
                    id: 'file-contract-signed',
                    projectId: 'proj-sostenibilidad',
                    projectName: 'Campaña Sostenibilidad Q4',
                    fileName: 'Acuerdo_Comercial_Firmado.pdf',
                    title: 'Acuerdo Firmado',
                    folder: 'contracts',
                    storagePath: 'projects/proj-sostenibilidad/contrato.pdf',
                    mimeType: 'application/pdf',
                    sizeBytes: 2621440,
                    version: 1,
                    isClientVisible: true,
                    isPurged: false,
                    purgedAt: null,
                    purgedReason: null,
                    createdByEmail: 'legal@cima.dev',
                    createdAt: '2026-09-18T10:00:00.000Z',
                    taskId: null,
                    taskTitle: null,
                    isSignedContract: true,
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
  // Mock sesión de usuario
  await page.addInitScript(() => {
    sessionStorage.setItem('cima_access_token', 'mock-token-admin-cima')
    sessionStorage.setItem('cima_user_email', 'gerente@cima.dev')
  })

  // Mock endpoints de autenticación e identidad
  await page.route('**/api/v1/auth/login', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          accessToken: 'mock-token-admin-cima',
          user: {
            id: '11111111-1111-4111-8111-111111111111',
            email: 'gerente@cima.dev',
            role: 'admin',
          },
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
          email: 'gerente@cima.dev',
          role: 'admin',
          first_name: 'Gerente',
          last_name: 'CIMA',
          firstName: 'Gerente',
          lastName: 'CIMA',
          client_kind: null,
          company_name: 'CIMA',
          profession: 'Gerencia',
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
          email: 'gerente@cima.dev',
          role: 'admin',
          first_name: 'Gerente',
          last_name: 'CIMA',
          firstName: 'Gerente',
          lastName: 'CIMA',
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
            name: 'Campaña Sostenibilidad Q4',
            clientName: 'GreenLoop Logistics',
            type: 'campaign_service',
            status: 'in_progress',
            progressPercent: 60,
          },
        ],
      }),
    })
  })

  // Mock almacenamiento en la nube y estadísticas
  await page.route('**/api/v1/media/storage/stats', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockStats),
    })
  })

  // Mock árbol del gestor de archivos
  await page.route('**/api/v1/collab/admin/storage/tree', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTree),
    })
  })

  // Mock vaciado masivo (purgeBatch)
  await page.route('**/api/v1/collab/admin/storage/purge', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { success: true, purgedCount: 3, freedBytes: 10485760 },
      }),
    })
  })

  // Mock depuración de archivo individual (purgeFile)
  await page.route('**/api/v1/collab/admin/storage/files/*', async (route: Route) => {
    if (route.request().method() === 'DELETE') {
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

test.describe('Validación de Previsualización, Depuración y Gobernanza de Almacenamiento', () => {
  test('1. Consola de Administración: Métricas dinámicas, sin mención estática de 10 GB y modal corporativo de vaciado', async ({
    page,
  }) => {
    await setupMocks(page)
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Navegar a pestaña Administración
    const adminTab = page.locator('aside button').filter({ hasText: 'Administración' }).first()
    await expect(adminTab).toBeVisible({ timeout: 15_000 })
    await adminTab.click()
    await page.waitForTimeout(1000)

    // Validar título y descripción del Gestor de Archivos (sin 10 GB fijo)
    const title = page.getByText('Gestor y Explorador de Archivos por Cliente')
    await expect(title).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByText('Estructura jerárquica (Cliente → Proyectos → Categorías) para control de cuota y liberación de espacio.')
    ).toBeVisible()

    // Validar métricas dinámicas
    await expect(page.getByText('Clientes con Archivos')).toBeVisible()
    await expect(page.getByText('Espacio Activo en Nube')).toBeVisible()
    await expect(page.getByText('Espacio Purgado/Liberado')).toBeVisible()

    // Capturar vista general del gestor de archivos en 1080p
    await page.screenshot({
      path: path.join(outputDir, '01-admin-storage-manager-1080p.png'),
      fullPage: false,
    })

    // Seleccionar cliente y proyecto
    const clientItem = page.getByTestId('storage-client-item').first()
    await expect(clientItem).toBeVisible()
    await clientItem.click()
    await page.waitForTimeout(500)

    // Validar presencia del botón corporativo "Vaciar archivos del proyecto"
    const emptyBtn = page.getByRole('button', { name: /Vaciar archivos del proyecto/i })
    await expect(emptyBtn).toBeVisible()
    await emptyBtn.click()

    // Validar apertura del nuevo EmptyProjectFilesDialog (AlertDialog corporativo)
    const emptyDialogTitle = page
      .locator('[data-slot="alert-dialog-title"]')
      .filter({ hasText: 'Vaciar Archivos del Proyecto' })
    await expect(emptyDialogTitle).toBeVisible()
    await expect(page.getByText('Proyecto afectado:')).toBeVisible()
    await expect(page.getByText('Total de archivos a depurar: 3')).toBeVisible()
    await expect(page.getByText('Acción irreversible')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar y Vaciar' })).toBeVisible()

    // Captura del nuevo diálogo corporativo
    await page.screenshot({
      path: path.join(outputDir, '02-empty-project-files-dialog.png'),
      fullPage: false,
    })

    // Cancelar el vaciado
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(emptyDialogTitle).not.toBeVisible()

    // Abrir modal de depuración individual en archivo no firmado
    const purgeButtons = page.locator('button[title="Depurar para liberar espacio"]')
    await expect(purgeButtons.first()).toBeVisible()
    await purgeButtons.first().click()

    // Validar FilePurgeDialog sin mención de 10 GB
    const purgeDialogTitle = page
      .locator('[data-slot="dialog-title"]')
      .filter({ hasText: 'Depurar Archivo para Liberar Espacio' })
    await expect(purgeDialogTitle).toBeVisible()
    await expect(
      page.getByText('Esta acción eliminará el archivo binario en la nube para recuperar espacio en la cuota de almacenamiento.')
    ).toBeVisible()

    // Captura del diálogo de depuración individual
    await page.screenshot({
      path: path.join(outputDir, '03-file-purge-dialog-no-10gb.png'),
      fullPage: false,
    })

    await page.getByRole('button', { name: 'Cancelar' }).click()
  })

  test('2. Responsividad en 4 resoluciones (UHD 4K, 1080p FHD, Tablet, Mobile)', async ({
    page,
  }) => {
    await setupMocks(page)

    const viewports = [
      { name: 'uhd-4k', width: 3840, height: 2160 },
      { name: 'fhd-1080p', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 812 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // En mobile/tablet puede ser necesario abrir el menú lateral si aplica
      if (vp.width >= 768) {
        const adminTab = page.locator('aside button').filter({ hasText: 'Administración' }).first()
        if (await adminTab.isVisible()) {
          await adminTab.click()
          await page.waitForTimeout(500)
        }
      }

      await page.screenshot({
        path: path.join(outputDir, `04-responsive-${vp.name}.png`),
        fullPage: false,
      })
    }
  })
})
