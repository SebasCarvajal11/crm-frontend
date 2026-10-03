import { test, expect } from '../../fixtures/auth.fixture'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve(
  'C:/Users/27seb/.gemini/antigravity/brain/d918f262-f0a5-475e-92f6-f97f5def471c/screenshots/collab'
)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test('Inspeccionar todas las subpestañas de Colaboración', async ({ adminPage }) => {
  await adminPage.setViewportSize({ width: 1920, height: 1080 })
  await adminPage.goto('/dashboard?tab=collab')
  await adminPage.waitForLoadState('networkidle')
  await adminPage.waitForTimeout(1500)

  // 1. Tablero principal de proyectos
  await adminPage.screenshot({
    path: path.join(outputDir, '01-collab-projects-board.png'),
    fullPage: true,
  })

  // Abrir el primer proyecto disponible
  const firstProject = adminPage.locator('[aria-label*="Abrir proyecto"]').first()
  await expect(firstProject).toBeVisible({ timeout: 10_000 })
  await firstProject.click()
  await adminPage.waitForLoadState('networkidle')
  await adminPage.waitForTimeout(1500)

  // 2. Subpestaña: Tablero de tareas
  await adminPage.screenshot({
    path: path.join(outputDir, '02-collab-subtab-board.png'),
    fullPage: true,
  })

  // 3. Subpestaña: Conversación
  await adminPage.getByRole('tab', { name: /Conversación/i }).click()
  await adminPage.waitForTimeout(1000)
  await adminPage.screenshot({
    path: path.join(outputDir, '03-collab-subtab-chat.png'),
    fullPage: true,
  })

  // 4. Subpestaña: Brief
  await adminPage.getByRole('tab', { name: /Brief/i }).click()
  await adminPage.waitForTimeout(1000)
  await adminPage.screenshot({
    path: path.join(outputDir, '04-collab-subtab-brief.png'),
    fullPage: true,
  })

  // 5. Subpestaña: Contrato
  await adminPage.getByRole('tab', { name: /Contrato/i }).click()
  await adminPage.waitForTimeout(1000)
  await adminPage.screenshot({
    path: path.join(outputDir, '05-collab-subtab-contract.png'),
    fullPage: true,
  })

  // 6. Subpestaña: Solicitud de cambios
  await adminPage.getByRole('tab', { name: /Solicitud de cambios/i }).click()
  await adminPage.waitForTimeout(1000)
  await adminPage.screenshot({
    path: path.join(outputDir, '06-collab-subtab-change-requests.png'),
    fullPage: true,
  })

  // 7. Subpestaña: Integrantes
  await adminPage.getByRole('tab', { name: /Integrantes/i }).click()
  await adminPage.waitForTimeout(1000)
  await adminPage.screenshot({
    path: path.join(outputDir, '07-collab-subtab-members.png'),
    fullPage: true,
  })
})
