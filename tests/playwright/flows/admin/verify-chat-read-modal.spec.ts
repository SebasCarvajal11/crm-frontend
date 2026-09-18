import { test, expect } from '@playwright/test'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { ChatPage } from '../../page-objects/chat.page'

test('verificar flujo de visto y perfiles reales en info del mensaje', async ({ browser, baseURL }) => {
  const frontendUrl = baseURL || 'http://localhost:5173'

  // 1. Roberto (Admin/Gerente)
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
  await adminProject.navigateToChat()
  const adminChat = new ChatPage(adminPage)
  await adminChat.expectLoaded()
  await adminChat.switchToExternalChat()

  // Enviar mensaje nuevo
  const testMsg = `Prueba lectura y perfil ${Date.now()}`
  await adminChat.sendMessage(testMsg)

  const sentMessageBubble = adminPage.locator(`text="${testMsg}"`).first()
  await expect(sentMessageBubble).toBeVisible({ timeout: 10_000 })

  // 2. Valentina (Cliente)
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

  // Esperar a que el mensaje aparezca en la pantalla de Valentina
  const valMessageBubble = clientPage.locator(`text="${testMsg}"`).first()
  await expect(valMessageBubble).toBeVisible({ timeout: 10_000 })
  // Esperar a que el markRead request se procese
  await clientPage.waitForTimeout(3000)

  // 3. Volver a Roberto: el mensaje debe mostrar el recibo de lectura
  await adminPage.bringToFront()
  await adminPage.waitForTimeout(4000)

  const messageRow = sentMessageBubble.locator('xpath=ancestor::div[contains(@class, "flex-row-reverse")][1]')
  const receiptButton = messageRow.locator('button[aria-label*="Estado de lectura"]')
  await expect(receiptButton).toBeVisible({ timeout: 10_000 })

  // Clic en el recibo de lectura para abrir Info del mensaje
  await receiptButton.click()

  // 4. Verificar modal Info del mensaje
  const dialog = adminPage.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 10_000 })
  await expect(dialog.getByText('Info del mensaje')).toBeVisible()

  // Verificar que Valentina Castro aparece con su nombre real en "Leído por"
  const readSection = dialog.locator('section').first()
  await expect(readSection.getByText('Valentina Castro')).toBeVisible({ timeout: 10_000 })
  await expect(readSection.getByText(/Cliente/i)).toBeVisible()

  // Tomar captura de pantalla de evidencia
  const screenshotPath = 'C:/Users/27seb/.gemini/antigravity/brain/eb94f670-8c42-40f0-94f1-5d3670e9372d/screenshots/chat-info-dialog-verified.png'
  await adminPage.screenshot({ path: screenshotPath, fullPage: false })
  console.log('Captura tomada en:', screenshotPath)

  await adminContext.close()
  await clientContext.close()
})
