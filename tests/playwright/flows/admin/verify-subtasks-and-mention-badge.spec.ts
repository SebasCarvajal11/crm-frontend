import { test, expect } from '@playwright/test'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ChatPage } from '../../page-objects/chat.page'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/eb94f670-8c42-40f0-94f1-5d3670e9372d/screenshots'

test('verificar subtareas en tablero y distintivo de menciones en chat', async ({ browser, baseURL }) => {
  const frontendUrl = baseURL || 'http://localhost:5173'

  // ==========================================
  // PARTE 1: FLUJO DE SUBTAREAS EN TABLERO
  // ==========================================
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const adminPage = await adminContext.newPage()

  await adminPage.goto(`${frontendUrl}/login`)
  await adminPage.getByLabel('Correo').fill('gerente@cima.dev')
  await adminPage.locator('input#password').fill('Demo123!')
  await adminPage.getByRole('button', { name: 'Entrar' }).click()
  await adminPage.waitForURL('**/dashboard', { timeout: 15_000 })

  const adminDashboard = new DashboardPage(adminPage)
  await adminDashboard.navigateToCollab()
  const adminCollab = new CollabPage(adminPage)
  await adminCollab.expectLoaded()
  await adminPage.getByRole('button', { name: /^Abrir proyecto Contrat,/i }).click()

  const adminProject = new ProjectPage(adminPage)
  await adminProject.expectLoaded()
  await adminProject.navigateToBoard()

  // 1. Crear tarea con subtareas iniciales desde el modal de creación
  const taskTitle = `Tarea Checklist ${Date.now()}`
  const createButton = adminPage.locator('button[aria-label^="Crear tarea en "]').first()
  await createButton.click()
  await adminPage.locator('#ct-title').fill(taskTitle)

  // Agregar Subtarea 1 en modal usando Enter
  const subtaskInputModal = adminPage.getByPlaceholder('Descripcion de la subtarea...')
  await subtaskInputModal.fill('Subtarea Alpha inicial')
  await subtaskInputModal.press('Enter')
  await expect(adminPage.locator('text="Subtarea Alpha inicial"')).toBeVisible({ timeout: 5_000 })

  // Agregar Subtarea 2 en modal usando Enter
  await subtaskInputModal.fill('Subtarea Beta inicial')
  await subtaskInputModal.press('Enter')
  await expect(adminPage.locator('text="Subtarea Beta inicial"')).toBeVisible({ timeout: 5_000 })

  // Guardar tarea
  await adminPage.locator('button[form="create-task-form"]').click()
  await expect(adminPage.locator('#ct-title')).not.toBeVisible({ timeout: 10_000 })

  // 2. Filtrar y abrir la tarea recién creada en el Task Sheet
  const searchInput = adminPage.getByPlaceholder(/Buscar tareas por nombre/i)
  await searchInput.fill(taskTitle)
  const taskCard = adminPage.locator(`text="${taskTitle}"`).first()
  await expect(taskCard).toBeVisible({ timeout: 10_000 })
  await taskCard.click()

  const taskSheet = adminPage.locator('[role="dialog"]').first()
  await expect(taskSheet).toBeVisible({ timeout: 8_000 })

  // Verificar que las dos subtareas iniciales se muestran con progreso 0%
  await expect(taskSheet.locator('text="Subtarea Alpha inicial"')).toBeVisible()
  await expect(taskSheet.locator('text="Subtarea Beta inicial"')).toBeVisible()
  await expect(taskSheet.locator('text="0%"')).toBeVisible()

  // 3. Agregar una tercera subtarea desde el Task Sheet
  const subtaskInputSheet = taskSheet.getByPlaceholder('Describe la subtarea...')
  await subtaskInputSheet.fill('Subtarea Gamma agregada en sheet')
  await subtaskInputSheet.press('Enter')
  await expect(taskSheet.locator('text="Subtarea Gamma agregada en sheet"')).toBeVisible({ timeout: 8_000 })

  // 4. Marcar Subtarea Alpha como completada (toggle checkbox)
  const firstCheckbox = taskSheet.locator('input[type="checkbox"]').first()
  await firstCheckbox.click()
  // Esperar a que el progreso se actualice a 33%
  await expect(taskSheet.locator('text="33%"')).toBeVisible({ timeout: 8_000 })

  // Captura de pantalla de evidencia para subtareas
  await adminPage.screenshot({
    path: `${SCREENSHOT_DIR}/board-subtasks-sheet-verified.png`,
    fullPage: false,
  })

  // Cerrar Task Sheet y limpiar búsqueda
  await adminPage.getByLabel('Cerrar panel').click()
  await expect(taskSheet).not.toBeVisible({ timeout: 5_000 })
  await searchInput.clear()

  // ==========================================
  // PARTE 2: CHAT BADGE & DISTINTIVO DE MENCIÓN
  // ==========================================
  const chatTab = adminPage.getByRole('tab', { name: /conversaci(?:o|ó)n/i })
  const boardTab = adminPage.getByRole('tab', { name: /tablero/i })

  // Roberto entra a Conversación para limpiar notificaciones anteriores
  await chatTab.click()
  const adminChat = new ChatPage(adminPage)
  await adminChat.expectLoaded()
  await adminChat.switchToExternalChat()
  await adminPage.waitForTimeout(2000)

  // Roberto regresa al Tablero
  await boardTab.click()
  await adminPage.waitForTimeout(1000)

  // Cliente Valentina
  const clientContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const clientPage = await clientContext.newPage()

  await clientPage.goto(`${frontendUrl}/login`)
  await clientPage.getByLabel('Correo').fill('info@modabella.com')
  await clientPage.locator('input#password').fill('Demo123!')
  await clientPage.getByRole('button', { name: 'Entrar' }).click()
  await clientPage.waitForURL('**/dashboard', { timeout: 15_000 })

  const clientDashboard = new DashboardPage(clientPage)
  await clientDashboard.navigateToCollab()
  const clientCollab = new CollabPage(clientPage)
  await clientCollab.expectLoaded()
  await clientPage.getByRole('button', { name: /^Abrir proyecto Contrat,/i }).click()

  const clientProject = new ProjectPage(clientPage)
  await clientProject.expectLoaded()
  await clientProject.navigateToChat()
  const clientChat = new ChatPage(clientPage)
  await clientChat.expectLoaded()
  await clientChat.switchToExternalChat()

  // 1. Valentina envía mensaje normal (sin mención)
  const regularMsg = `Mensaje regular de prueba ${Date.now()}`
  await clientChat.sendMessage(regularMsg)
  await expect(clientPage.locator(`text="${regularMsg}"`).first()).toBeVisible({ timeout: 10_000 })

  // Esperar a que la notificación llegue a la pestaña de Roberto
  const regularBadge = chatTab.locator('[role="status"]')
  await expect(regularBadge).toBeVisible({ timeout: 20_000 })
  await expect(regularBadge).not.toHaveText(/@/)

  await adminPage.screenshot({
    path: `${SCREENSHOT_DIR}/chat-badge-regular-desktop.png`,
    fullPage: false,
  })

  // 2. Valentina envía mensaje CON mención a Roberto (@admin)
  const mentionMsg = `@admin Revisa este punto prioritario ${Date.now()}`
  await clientChat.sendMessage(mentionMsg)
  await expect(clientPage.locator(`text="${mentionMsg}"`).first()).toBeVisible({ timeout: 10_000 })

  // En la sesión de Roberto: el badge se actualiza con el prefijo @ y borde ámbar
  const mentionBadge = chatTab.locator('[role="status"]')
  await expect(mentionBadge).toContainText('@', { timeout: 20_000 })
  await expect(mentionBadge).toHaveAttribute('title', 'Tienes menciones directas pendientes')

  // Evidencia 1080p Desktop del distintivo de mención
  await adminPage.screenshot({
    path: `${SCREENSHOT_DIR}/chat-badge-mention-desktop.png`,
    fullPage: false,
  })

  // Evidencia Mobile (390x844 iPhone viewport)
  await adminPage.setViewportSize({ width: 390, height: 844 })
  const toastCloseButtons = adminPage.locator('button:has(.lucide-x)')
  const toastCount = await toastCloseButtons.count()
  for (let i = 0; i < toastCount; i++) {
    await toastCloseButtons.nth(0).click().catch(() => {})
    await adminPage.waitForTimeout(150)
  }
  await adminPage.waitForTimeout(500)
  await adminPage.screenshot({
    path: `${SCREENSHOT_DIR}/chat-badge-mention-mobile.png`,
    fullPage: false,
  })

  // 3. Roberto entra a Conversación -> el badge desaparece al marcarse como leído
  await adminPage.setViewportSize({ width: 1440, height: 900 })
  await chatTab.click()
  await expect(chatTab.locator('[role="status"]')).not.toBeVisible({ timeout: 15_000 })

  await adminContext.close()
  await clientContext.close()
})
