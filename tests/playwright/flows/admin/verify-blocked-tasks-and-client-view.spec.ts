import { test, expect } from '@playwright/test'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { USERS } from '../../fixtures/auth.fixture'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/03046ff1-479c-4bea-8455-5c5363517ca4/screenshots'

test.describe('Collab - Tareas Bloqueadas y Vista de Cliente', () => {
  test('verificar 4 columnas de cliente, bloqueo por impedimento y permisos RBAC', async ({
    browser,
    baseURL,
  }) => {
    const frontendUrl = baseURL || 'http://localhost:5173'

    // ==========================================
    // PARTE 1: VERIFICAR 4 COLUMNAS DEL CLIENTE
    // ==========================================
    const clientContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const clientPage = await clientContext.newPage()

    await clientPage.goto(`${frontendUrl}/login`)
    await clientPage.getByLabel('Correo').fill(USERS.client.email)
    await clientPage.locator('#password').fill(USERS.client.password)
    await clientPage.getByRole('button', { name: 'Entrar' }).click()
    await clientPage.waitForURL('**/dashboard', { timeout: 15_000 })

    const clientDashboard = new DashboardPage(clientPage)
    await clientDashboard.navigateToCollab()
    const clientCollab = new CollabPage(clientPage)
    await clientCollab.expectLoaded()

    // Abrir proyecto de tipo Campaña (lifecycle estándar con 6 columnas internas)
    const campaignCard = clientPage.locator('button[aria-label*="Campaña QA"]').first()
    await expect(campaignCard).toBeVisible()
    await campaignCard.click()

    const clientProject = new ProjectPage(clientPage)
    await clientProject.expectLoaded()
    await clientProject.navigateToBoard()

    // Comprobar que el tablero de cliente contiene exactamente 4 columnas
    const clientColumns = clientPage.locator('[aria-label^="Columna "]')
    await expect(clientColumns).toHaveCount(4)

    // Validar las 4 columnas de ciclo de vida visibles para el cliente
    await expect(clientPage.locator('[aria-label^="Columna En Curso"]')).toBeVisible()
    await expect(clientPage.locator('[aria-label*="Columna En Aprobación"]')).toBeVisible()
    await expect(clientPage.locator('[aria-label^="Columna Bloqueado"]')).toBeVisible()
    await expect(clientPage.locator('[aria-label^="Columna Terminado"]')).toBeVisible()

    // Validar que las columnas internas 'Pendiente' y 'Revisión Interna' están estrictamente ocultas
    await expect(clientPage.locator('[aria-label^="Columna Pendiente"]')).toHaveCount(0)
    await expect(clientPage.locator('[aria-label*="Columna En Revisión Interna"]')).toHaveCount(0)

    // Captura 1: Tablero Kanban de Cliente con 4 columnas
    await clientPage.screenshot({
      path: `${SCREENSHOT_DIR}/01-client-kanban-4-columns.png`,
      fullPage: false,
    })

    // ==========================================
    // PARTE 2: ADMIN CREA Y BLOQUEA TAREA
    // ==========================================
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const adminPage = await adminContext.newPage()

    await adminPage.goto(`${frontendUrl}/login`)
    await adminPage.getByLabel('Correo').fill(USERS.admin.email)
    await adminPage.locator('#password').fill(USERS.admin.password)
    await adminPage.getByRole('button', { name: 'Entrar' }).click()
    await adminPage.waitForURL('**/dashboard', { timeout: 15_000 })

    const adminDashboard = new DashboardPage(adminPage)
    await adminDashboard.navigateToCollab()
    const adminCollab = new CollabPage(adminPage)
    await adminCollab.expectLoaded()

    // Admin abre el mismo proyecto
    const adminCampaignCard = adminPage.locator('button[aria-label*="Campaña QA"]').first()
    await expect(adminCampaignCard).toBeVisible()
    await adminCampaignCard.click()

    const adminProject = new ProjectPage(adminPage)
    await adminProject.expectLoaded()
    await adminProject.navigateToBoard()

    // Admin debe ver las 6 columnas completas
    const adminColumns = adminPage.locator('[aria-label^="Columna "]')
    await expect(adminColumns).toHaveCount(6)

    // Crear tarea en columna En Curso
    const taskTitle = `Tarea Bloqueo E2E ${Date.now()}`
    const createBtn = adminPage.locator('button[aria-label^="Crear tarea en En Curso"]')
    await createBtn.click()
    await adminPage.locator('#ct-title').fill(taskTitle)
    await adminPage.locator('#ct-desc').fill('Tarea para validar bloqueo y RBAC')
    await adminPage.getByText('Visible al cliente').click()
    await adminPage.locator('button[form="create-task-form"]').click()
    await expect(adminPage.locator('#ct-title')).not.toBeVisible({ timeout: 8_000 })

    // Abrir detalle de la tarea creada
    const taskCard = adminPage.locator('button', { hasText: taskTitle }).first()
    await expect(taskCard).toBeVisible({ timeout: 8_000 })
    await taskCard.click()

    const taskSheet = adminPage.locator('[role="dialog"]').first()
    await expect(taskSheet).toBeVisible({ timeout: 8_000 })

    // Click en Bloquear tarea
    const blockBtn = taskSheet.getByRole('button', { name: /bloquear tarea/i })
    await expect(blockBtn).toBeVisible()
    await blockBtn.click()

    // Validar modal de bloqueo y longitud mínima
    const blockDialog = adminPage.locator('[role="dialog"]').last()
    await expect(blockDialog).toBeVisible()
    const blockReasonInput = blockDialog.locator('#block-reason')
    const confirmBlockBtn = blockDialog.getByRole('button', { name: /confirmar bloqueo/i })

    await blockReasonInput.fill('abc') // Menos de 5 caracteres
    await expect(confirmBlockBtn).toBeDisabled()

    const blockReasonText = 'Esperando confirmación de credenciales del proveedor externo'
    await blockReasonInput.fill(blockReasonText)
    await expect(confirmBlockBtn).toBeEnabled()
    await confirmBlockBtn.click()

    // Verificar que el modal se cierra
    await expect(blockDialog).not.toBeVisible({ timeout: 5_000 })

    // Verificar que la tarea aparece en la columna Bloqueado con distintivo "Bloqueada"
    const blockedColumn = adminPage.locator('[aria-label^="Columna Bloqueado"]')
    const blockedCard = blockedColumn.locator('button', { hasText: taskTitle }).first()
    await expect(blockedCard).toBeVisible({ timeout: 8_000 })
    await expect(blockedCard.getByText(/Bloqueada/i)).toBeVisible()

    // Abrir detalle de la tarea bloqueada para inspeccionar el Banner
    await blockedCard.click()
    await expect(taskSheet).toBeVisible({ timeout: 8_000 })
    await expect(taskSheet.getByText('Bloqueo por Impedimento Interno del Equipo')).toBeVisible({ timeout: 5_000 })
    await expect(taskSheet.getByText(blockReasonText)).toBeVisible()

    // Captura 2: Detalle de tarea bloqueada con Banner y Causa
    await adminPage.screenshot({
      path: `${SCREENSHOT_DIR}/02-admin-blocked-task-banner.png`,
      fullPage: false,
    })

    // Cerrar Task Sheet en admin
    await adminPage.getByLabel('Cerrar panel').click()
    await expect(taskSheet).not.toBeVisible({ timeout: 5_000 })

    // ==========================================
    // PARTE 3: CLIENTE NO PUEDE DESBLOQUEAR
    // ==========================================
    await clientPage.reload()
    await clientProject.expectLoaded()
    await clientProject.navigateToBoard()

    const clientBlockedColumn = clientPage.locator('[aria-label^="Columna Bloqueado"]')
    const clientBlockedCard = clientBlockedColumn.locator('button', { hasText: taskTitle }).first()
    await expect(clientBlockedCard).toBeVisible({ timeout: 8_000 })
    await clientBlockedCard.click()

    const clientTaskSheet = clientPage.locator('[role="dialog"]').first()
    await expect(clientTaskSheet).toBeVisible({ timeout: 8_000 })
    await expect(clientTaskSheet.getByText('Bloqueo por Impedimento Interno del Equipo')).toBeVisible()
    await expect(clientTaskSheet.getByText(blockReasonText)).toBeVisible()

    // Cliente NO tiene botón para desbloquear impedimento interno
    await expect(clientTaskSheet.getByRole('button', { name: /desbloquear/i })).toHaveCount(0)

    // Captura 3: Vista de Cliente sin permisos para desbloquear
    await clientPage.screenshot({
      path: `${SCREENSHOT_DIR}/03-client-cannot-unblock.png`,
      fullPage: false,
    })

    await clientPage.getByLabel('Cerrar panel').click()

    // ==========================================
    // PARTE 4: ADMIN DESBLOQUEA LA TAREA
    // ==========================================
    const adminBlockedCard = adminPage.locator('[aria-label^="Columna Bloqueado"]').locator('button', { hasText: taskTitle }).first()
    await adminBlockedCard.click()
    await expect(taskSheet).toBeVisible({ timeout: 8_000 })

    const unblockBtn = taskSheet.getByRole('button', { name: /desbloquear tarea/i })
    await expect(unblockBtn).toBeVisible()
    await unblockBtn.click()

    const unblockDialog = adminPage.locator('[role="dialog"]').last()
    await expect(unblockDialog).toBeVisible()

    const unblockCommentInput = unblockDialog.locator('#unblock-comment')
    await unblockCommentInput.fill('Credenciales recibidas y validadas con éxito')

    const confirmUnblockBtn = unblockDialog.getByRole('button', { name: /desbloquear tarea/i })
    await confirmUnblockBtn.click()
    await expect(unblockDialog).not.toBeVisible({ timeout: 5_000 })

    // Verificar que la tarea vuelve a estar en la columna En Curso sin distintivo de bloqueo
    const doingColumn = adminPage.locator('[aria-label^="Columna En Curso"]')
    const restoredCard = doingColumn.locator('button', { hasText: taskTitle }).first()
    await expect(restoredCard).toBeVisible({ timeout: 8_000 })
    await expect(restoredCard.getByText(/Bloqueada/i)).toHaveCount(0)

    // Abrir la tarea restaurada para verificar que el banner desapareció
    await restoredCard.click()
    await expect(taskSheet).toBeVisible({ timeout: 8_000 })
    await expect(taskSheet.getByText('Bloqueo por Impedimento Interno del Equipo')).toHaveCount(0)
    await expect(taskSheet.getByRole('button', { name: /bloquear tarea/i })).toBeVisible()

    // Captura 4: Tarea desbloqueada y restaurada
    await adminPage.screenshot({
      path: `${SCREENSHOT_DIR}/04-task-unblocked-success.png`,
      fullPage: false,
    })

    await adminPage.getByLabel('Cerrar panel').click()

    await clientContext.close()
    await adminContext.close()
  })
})
