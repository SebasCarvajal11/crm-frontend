import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const outputDir = path.resolve(
  'C:/Users/27seb/.gemini/antigravity/brain/44ea48bf-982d-4b61-8139-950a86d14ae2/screenshots/audit'
)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

test.describe('Auditoría Integral de Interactividad, Pestañas y Sub-pestañas', () => {
  test('Recorrido completo por todas las pestañas y sub-pestañas como Admin', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.getByLabel('Correo').fill('admin@cima.dev')
    await page.getByLabel(/contrase(?:n|ñ)a/i).fill('Admin123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard**')
    await page.waitForTimeout(2000)

    // 1. Pestaña Resumen
    await expect(page.getByText('Tu cuenta')).toBeVisible()
    await page.screenshot({ path: path.join(outputDir, '01-tab-overview.png') })

    // 2. Pestaña Colaboración
    await page.getByRole('button', { name: 'Colaboración' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outputDir, '02-tab-collab-parent.png') })

    // Abrir primer proyecto disponible si existe
    const firstProject = page.locator('button[aria-label*="Abrir proyecto"]').first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.waitForTimeout(1500)

      // Sub-pestaña Tablero
      await page.screenshot({ path: path.join(outputDir, '03-collab-subtab-board.png') })

      // Sub-pestaña Conversación
      await page.getByRole('tab', { name: /Conversacion|Conversación/i }).click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(outputDir, '04-collab-subtab-chat.png') })

      // Sub-pestaña Brief
      await page.getByRole('tab', { name: 'Brief' }).click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(outputDir, '05-collab-subtab-brief.png') })

      // Sub-pestaña Contrato
      await page.getByRole('tab', { name: 'Contrato' }).click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(outputDir, '06-collab-subtab-contract.png') })

      // Sub-pestaña Integrantes
      await page.getByRole('tab', { name: 'Integrantes' }).click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(outputDir, '07-collab-subtab-members.png') })
    }

    // 3. Pestaña Marketing
    await page.getByRole('button', { name: 'Marketing' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outputDir, '08-tab-marketing-clients.png') })

    // Sub-pestaña Campañas
    await page.getByRole('button', { name: 'Campañas' }).click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(outputDir, '09-tab-marketing-campaigns.png') })

    // 4. Pestaña Analítica
    await page.getByRole('button', { name: 'Analítica' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outputDir, '10-tab-analytics.png') })

    // 5. Pestaña Administración
    await page.getByRole('button', { name: 'Administración' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outputDir, '11-tab-admin.png') })

    // 6. Pestaña Notificaciones
    await page.goto('/dashboard?tab=notifications')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outputDir, '12-tab-notifications.png') })

    // 7. Pestaña Mi Cuenta / Perfil
    await page.goto('/dashboard?tab=account')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outputDir, '13-tab-account.png') })
  })
})
