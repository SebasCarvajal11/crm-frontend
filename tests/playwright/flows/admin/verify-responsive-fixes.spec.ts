import { test, expect, type Page, type Route } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve(
  'C:/Users/27seb/.gemini/antigravity/brain/08be4eea-124e-46c0-9b97-1def1d528678/screenshots'
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
      totalClients: 1,
      totalProjects: 1,
      totalFiles: 2,
      totalBytes: 15728640,
      purgedFilesCount: 0,
      purgedBytes: 0,
    },
    clients: [
      {
        clientSub: 'client-greenloop',
        clientName: 'GreenLoop Logistics',
        totalFiles: 2,
        totalBytes: 12582912,
        projectsCount: 1,
        projects: [
          {
            projectId: 'proj-sostenibilidad',
            projectName: 'Campaña Sostenibilidad Q4',
            projectType: 'marketing',
            projectStatus: 'active',
            isArchived: false,
            totalFiles: 2,
            totalBytes: 10485760,
            folders: {
              briefs: {
                folderKey: 'briefs',
                folderLabel: 'Briefs y Requerimientos',
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

const mockUsers = {
  data: {
    items: [
      {
        id: '11111111-2222-4111-8111-111111111111',
        email: 'anderson.gremoto@gmail.com',
        first_name: 'Anderson',
        last_name: 'Gremoto',
        role: 'client',
        is_active: true,
        deleted_at: null,
        client_kind: null,
        company_name: null,
        profession: null,
        force_password_change: false,
        created_at: '2026-01-15T10:00:00Z',
      },
      {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'gerente@cima.dev',
        first_name: 'Valeria',
        last_name: 'Quintero',
        role: 'admin',
        is_active: true,
        deleted_at: null,
        client_kind: null,
        company_name: null,
        profession: null,
        force_password_change: false,
        created_at: '2026-01-10T10:00:00Z',
      },
    ],
    page: 1,
    limit: 10,
    total: 2,
    total_pages: 1,
  },
}

async function setupMocks(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('cima_access_token', 'mock-token-admin-cima')
    sessionStorage.setItem('cima_user_email', 'gerente@cima.dev')
  })

  await page.route('**/api/**', async (route: Route) => {
    const url = route.request().url()

    if (url.includes('/auth/login')) {
      return route.fulfill({
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
    }

    if (url.includes('/identity/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '11111111-1111-4111-8111-111111111111',
            email: 'gerente@cima.dev',
            role: 'admin',
            first_name: 'Valeria',
            last_name: 'Quintero',
            firstName: 'Valeria',
            lastName: 'Quintero',
            client_kind: null,
            company_name: 'CIMA',
            profession: 'Gerencia',
            emailVerifiedAt: '2026-01-01T00:00:00.000Z',
            mustChangePassword: false,
            isActive: true,
          },
        }),
      })
    }

    if (url.includes('/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '11111111-1111-4111-8111-111111111111',
            email: 'gerente@cima.dev',
            role: 'admin',
            first_name: 'Valeria',
            last_name: 'Quintero',
            firstName: 'Valeria',
            lastName: 'Quintero',
          },
        }),
      })
    }

    if (url.includes('/collab/admin/storage/tree')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTree),
      })
    }

    if (url.includes('/media/storage/stats')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStats),
      })
    }

    if (url.includes('/admin/users')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUsers),
      })
    }

    if (url.includes('/collab/projects')) {
      return route.fulfill({
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
    }

    if (url.includes('/media/avatars/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { urls: {} } }),
      })
    }

    if (url.includes('/collab/notifications/sync')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { unread_count: 0, items: [] } }),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })
}

test.describe('Verificación de Correcciones de Responsividad Móvil', () => {
  test('1. Saludo en Dashboard Overview sin corte de cabecera en móvil (375x812)', async ({ page }) => {
    await setupMocks(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard?tab=overview')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)

    // Validar saludo completo
    const greeting = page.locator('text=Hola Valeria')
    await expect(greeting).toBeVisible({ timeout: 15_000 })
    const welcome = page.locator('text=Bienvenido a')
    await expect(welcome).toBeVisible()

    // Validar que la cabecera sticky no corte el saludo
    const header = page.locator('header.sticky').first()
    await expect(header).toBeVisible()
    const headerBox = await header.boundingBox()
    const greetingBox = await greeting.boundingBox()

    expect(headerBox).not.toBeNull()
    expect(greetingBox).not.toBeNull()
    if (headerBox && greetingBox) {
      expect(greetingBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height)
    }

    // Capturar screenshot del saludo móvil
    await page.screenshot({
      path: path.join(outputDir, '08-mobile-dashboard-overview-greeting.png'),
      fullPage: false,
    })
  })

  test('2. Gestor de Archivos en Móvil: Vista de tarjetas sin desincronización de columnas (375x812)', async ({ page }) => {
    await setupMocks(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)

    // Seleccionar cliente
    const clientItem = page.getByTestId('storage-client-item').first()
    await expect(clientItem).toBeVisible({ timeout: 15_000 })
    await clientItem.click()
    await page.waitForTimeout(500)

    // Validar tarjeta móvil visible
    const mobileCard = page.locator('.block.sm\\:hidden').getByText('Brief_Estrategico_Q4.pdf')
    await expect(mobileCard).toBeVisible()

    // Capturar screenshot del gestor en móvil
    const fileManagerCard = page
      .locator('.rounded-2xl')
      .filter({ hasText: 'Gestor y Explorador de Archivos por Cliente' })
      .first()

    await fileManagerCard.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await fileManagerCard.screenshot({
      path: path.join(outputDir, '09-mobile-admin-file-manager-cards.png'),
    })
  })

  test('3. Directorio de Usuarios en Móvil: Acciones colapsadas sin colisión sobre el estado (375x812)', async ({ page }) => {
    await setupMocks(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)

    // Ubicar la sección del directorio de usuarios
    const userCard = page
      .locator('.rounded-2xl')
      .filter({ hasText: 'Directorio de Usuarios' })
      .first()

    await userCard.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)

    // Validar que el badge Activo está visible y no solapado
    const activeBadge = page.locator('text=Activo').first()
    await expect(activeBadge).toBeVisible()

    // En móvil, los botones de texto Desactivar/Archivar deben estar ocultos en la fila principal
    const extendedDesactivar = page.locator('button.hidden.sm\\:inline-flex:has-text("Desactivar")').first()
    await expect(extendedDesactivar).toBeHidden()

    // Abrir menú de acciones móviles
    const moreBtn = page.getByRole('button', { name: /Acciones para/i }).first()
    await expect(moreBtn).toBeVisible()
    await moreBtn.click()
    await page.waitForTimeout(300)

    // Validar opciones en el dropdown
    await expect(page.getByText('Gestión de usuario')).toBeVisible()
    await expect(page.getByText('Desactivar usuario')).toBeVisible()
    await expect(page.getByText('Archivar usuario')).toBeVisible()

    // Capturar screenshot de las acciones móviles limpias
    await page.screenshot({
      path: path.join(outputDir, '10-mobile-admin-user-table-actions.png'),
      fullPage: false,
    })
  })
})
