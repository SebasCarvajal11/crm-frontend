import { expect, test } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'
import * as path from 'node:path'

const ARTIFACT_DIR = 'C:\\Users\\27seb\\.gemini\\antigravity\\brain\\05b58026-516b-4210-ac41-baaf780d7a26'

test.describe('Captura Visual del Sistema de Avatares CIMA', () => {
  test('Flujo completo de personalización de avatar con capturas de pantalla', async ({
    page,
  }) => {
    await setupDashboard(page, 'admin')

    let presetSavedPayload: { avatarId?: number; color?: string } | null = null
    await page.route('**/api/v1/media/avatars/preset', async (route) => {
      presetSavedPayload = route.request().postDataJSON()
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            version: 2,
            urls: {
              '512': `/avatars/avatar-${presetSavedPayload?.avatarId ?? 0}.webp`,
              '256': `/avatars/avatar-${presetSavedPayload?.avatarId ?? 0}.webp`,
              '64': `/avatars/avatar-${presetSavedPayload?.avatarId ?? 0}.webp`,
            },
          },
        },
      })
    })

    // Navegar al perfil de cuenta
    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    // 1. Abrir menú de foto de perfil
    const avatarMenuBtn = page.getByLabel('Opciones de foto de perfil')
    await expect(avatarMenuBtn).toBeVisible()
    await avatarMenuBtn.click()

    // 2. Clic en "Cambiar foto de perfil"
    const changePhotoOption = page.getByText('Cambiar foto de perfil')
    await expect(changePhotoOption).toBeVisible()
    await changePhotoOption.click()

    // 3. Verificar diálogo de catálogo abierto
    const dialogTitle = page.getByText('Catálogo de Avatares CIMA')
    await expect(dialogTitle).toBeVisible()

    // Captura 1: Catálogo completo abierto (Todos)
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot-01-catalog-modal.png'),
      fullPage: false,
    })

    // 4. Seleccionar color Azul Marino
    const navyColorBtn = page.getByLabel('Azul Marino')
    await expect(navyColorBtn).toBeVisible()
    await navyColorBtn.click()

    // 5. Filtrar por categoría "Con Gafas"
    const conGafasTab = page.getByRole('button', { name: 'Con Gafas' })
    await expect(conGafasTab).toBeVisible()
    await conGafasTab.click()

    // 6. Seleccionar avatar con gafas (#11)
    const avatarSelectBtn = page.getByLabel('Seleccionar avatar #11')
    await expect(avatarSelectBtn).toBeVisible()
    await avatarSelectBtn.click()

    await page.waitForTimeout(400)
    // Captura 2: Avatar seleccionado con filtro activo y color personalizado
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot-02-avatar-selected.png'),
      fullPage: false,
    })

    // 7. Guardar cambios
    const saveButton = page.getByRole('button', { name: 'Guardar avatar' })
    await expect(saveButton).toBeVisible()
    await saveButton.click()
    await expect(dialogTitle).not.toBeVisible()

    // Captura 3: Perfil con avatar guardado
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot-03-profile-saved.png'),
      fullPage: false,
    })

    // 8. Flujo de Invitación: Navegar a /accept-invite
    await page.route('**/api/v1/auth/accept-invite/**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            email: 'carlos.mora@cima.dev',
            first_name: 'Carlos',
            last_name: 'Mora',
            company_name: 'CIMA Studio',
          },
        },
      })
    })

    await page.goto('/accept-invite/token-demo-456')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Tu avatar oficial CIMA')).toBeVisible()

    // Captura 4: Vista de Aceptación de Invitación con Avatar Dinámico
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot-04-invite-view.png'),
      fullPage: false,
    })

    // 9. Abrir personalizador desde la invitacion
    const customizeInviteBtn = page.getByRole('button', { name: 'Personalizar' })
    await expect(customizeInviteBtn).toBeVisible()
    await customizeInviteBtn.click()

    await expect(page.getByText('Catálogo de Avatares CIMA')).toBeVisible()
    await page.waitForTimeout(400)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot-05-invite-customizer-modal.png'),
      fullPage: false,
    })
  })

  test('Captura en vista móvil (Mobile Safari iOS)', async ({ page }) => {
    // Configurar viewport movil iPhone 14
    await page.setViewportSize({ width: 390, height: 844 })
    await setupDashboard(page, 'admin')

    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    const avatarMenuBtn = page.getByLabel('Opciones de foto de perfil')
    await expect(avatarMenuBtn).toBeVisible()
    await avatarMenuBtn.click()

    const changePhotoOption = page.getByText('Cambiar foto de perfil')
    await expect(changePhotoOption).toBeVisible()
    await changePhotoOption.click()

    await expect(page.getByText('Catálogo de Avatares CIMA')).toBeVisible()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot-06-mobile-modal.png'),
      fullPage: false,
    })
  })
})
