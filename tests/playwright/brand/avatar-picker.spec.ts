import { expect, test } from '@playwright/test'
import { setupDashboard } from '../tour/fixtures'

test.describe('Catálogo Oficial de Avatares CIMA', () => {
  test('Diálogo de selección de avatar corporativo permite cambiar color, filtrar por categoría y guardar selección', async ({
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

    // Navegar a panel de cuenta
    await page.goto('/dashboard?tab=account')
    await page.waitForLoadState('networkidle')

    // 1. Abrir diálogo de selección de avatar directamente
    const changeAvatarBtn = page.getByRole('button', { name: 'Cambiar avatar' })
    await expect(changeAvatarBtn).toBeVisible()
    await changeAvatarBtn.click()

    // 2. Verificar que se despliega el modal del catálogo
    const dialogTitle = page.getByText('Catálogo de Avatares CIMA')
    await expect(dialogTitle).toBeVisible()

    // 4. Probar selección de color corporativo (ej. Azul Marino)
    const navyColorBtn = page.getByLabel('Azul Marino')
    await expect(navyColorBtn).toBeVisible()
    await navyColorBtn.click()

    // Verificar texto descriptivo del fondo corporativo
    await expect(page.getByText('Fondo corporativo:')).toContainText('Azul Marino')

    // 5. Probar filtro rápido de categorías
    const conGafasTab = page.getByRole('button', { name: 'Con Gafas' })
    await expect(conGafasTab).toBeVisible()
    await conGafasTab.click()

    // Comprobar contador filtrado de disponibles
    await expect(page.getByText('14 disponibles')).toBeVisible()

    // 6. Seleccionar un avatar específico dentro del catálogo con gafas (#11)
    const avatarSelectBtn = page.getByLabel('Seleccionar avatar #11')
    await expect(avatarSelectBtn).toBeVisible()
    await avatarSelectBtn.click()

    // 7. Guardar selección de avatar
    const saveButton = page.getByRole('button', { name: 'Guardar avatar' })
    await expect(saveButton).toBeVisible()
    await saveButton.click()

    // 8. Confirmar que el diálogo se cierra y el endpoint recibió el payload correcto
    await expect(dialogTitle).not.toBeVisible()
    expect(presetSavedPayload).not.toBeNull()
    expect(presetSavedPayload?.avatarId).toBe(11)
    expect(presetSavedPayload?.color?.toLowerCase()).toBe('#1e3a8a')
  })


  test('Flujo de aceptación de invitación permite personalizar avatar oficial y color corporativo', async ({
    page,
  }) => {
    // Interceptar vista previa de invitación
    await page.route('**/api/v1/auth/accept-invite/**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            email: 'nuevo.usuario@cima.dev',
            first_name: 'Carlos',
            last_name: 'CIMA',
            company_name: 'CIMA Studio',
          },
        },
      })
    })

    await page.goto('/accept-invite/token-valido-123')
    await page.waitForLoadState('networkidle')

    // Verificar tarjeta de preview de avatar
    await expect(page.getByText('Tu avatar oficial CIMA')).toBeVisible()

    // Abrir modal de personalización de avatar
    const customizeBtn = page.getByRole('button', { name: 'Personalizar' })
    await expect(customizeBtn).toBeVisible()
    await customizeBtn.click()

    const dialogTitle = page.getByText('Catálogo de Avatares CIMA')
    await expect(dialogTitle).toBeVisible()

    // Seleccionar color Verde Bosque
    const forestColorBtn = page.getByLabel('Verde Bosque')
    await expect(forestColorBtn).toBeVisible()
    await forestColorBtn.click()

    // Filtrar por categoría Casual
    const casualTab = page.getByRole('button', { name: 'Casual' })
    await expect(casualTab).toBeVisible()
    await casualTab.click()

    // Seleccionar avatar #1
    const avatar0Btn = page.getByLabel('Seleccionar avatar #1', { exact: true })
    await expect(avatar0Btn).toBeVisible()
    await avatar0Btn.click()

    // Guardar selección
    const saveButton = page.getByRole('button', { name: 'Guardar avatar' })
    await expect(saveButton).toBeVisible()
    await saveButton.click()

    // Verificar que el diálogo se cierra y la tarjeta refleja el fondo seleccionado
    await expect(dialogTitle).not.toBeVisible()
    await expect(page.getByText('Fondo:')).toContainText('Verde Bosque')
  })

  test('Flujo de invitación recurre a avatar aleatorio y emite advertencia en dashboard si la selección falla', async ({
    page,
  }) => {
    let presetCallCount = 0

    // Mock endpoints requeridos por Dashboard tras la redirección
    await page.route('**/api/v1/identity/me', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            id: '11111111-1111-4111-8111-111111111111',
            email: 'fallo.avatar@cima.dev',
            role: 'worker',
            first_name: 'Elena',
            last_name: 'Vargas',
            emailVerifiedAt: '2026-09-28T00:00:00Z',
          },
        },
      })
    })

    await page.route('**/api/v1/identity/presence', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { data: { heartbeat_interval_seconds: 60 } },
      })
    })

    await page.route('**/api/v1/collab/projects', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { data: { items: [], total: 0, page: 1, limit: 100, total_pages: 1 } },
      })
    })

    await page.route('**/api/v1/notifications/unread/count', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { data: { unread_count: 0 } },
      })
    })

    await page.route('**/api/v1/media/avatars/current', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            version: 1,
            urls: {
              '512': '/avatars/avatar-10.webp',
              '256': '/avatars/avatar-10.webp',
              '64': '/avatars/avatar-10.webp',
            },
          },
        },
      })
    })

    // Sobrescribir rutas para flujo de invitación
    await page.route(/\/api\/v1\/auth\/accept-invite/, async (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: {
            data: {
              email: 'fallo.avatar@cima.dev',
              first_name: 'Elena',
              last_name: 'Vargas',
              company_name: 'CIMA Studio',
            },
          },
        })
      }
      if (method === 'POST') {
        const token = `fixture.${Buffer.from(JSON.stringify({ role: 'worker', sub: 'test-user' })).toString('base64url')}.fixture`
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: {
            data: {
              access_token: token,
              user: {
                id: '11111111-1111-4111-8111-111111111111',
                email: 'fallo.avatar@cima.dev',
                role: 'worker',
              },
            },
          },
        })
      }
      return route.continue()
    })

    // Simular que el primer guardado de avatar falla, pero el fallback aleatorio se intenta
    await page.route(/\/api\/v1\/media\/avatars\/preset/, async (route) => {
      presetCallCount++
      if (presetCallCount === 1) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          json: { error: 'Error simulado al guardar preset original' },
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            version: 1,
            urls: {
              '512': '/avatars/avatar-10.webp',
              '256': '/avatars/avatar-10.webp',
              '64': '/avatars/avatar-10.webp',
            },
          },
        },
      })
    })

    await page.goto('/accept-invite/token-prueba-fallback')
    await page.waitForLoadState('networkidle')

    // Completar formulario de activación
    await page.locator('input#password').fill('ClaveSegura123!')
    await page.locator('input#confirm').fill('ClaveSegura123!')
    await page.getByLabel('Aceptar términos y política de datos').check()

    // Enviar formulario
    const submitBtn = page.getByRole('button', { name: 'Activar cuenta y acceder' })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Confirmar que llega a /dashboard
    await page.waitForURL('**/dashboard**')

    // Comprobar que se muestra la advertencia informando al usuario sobre el avatar provisional
    const warningAlert = page.getByText('Aviso sobre tu avatar')
    await expect(warningAlert).toBeVisible()
    await expect(
      page.getByText('Hubo un inconveniente al guardar tu avatar seleccionado. Se asignó uno provisional')
    ).toBeVisible()

    // Descartar aviso
    const dismissBtn = page.getByRole('button', { name: 'Entendido' })
    await expect(dismissBtn).toBeVisible()
    await dismissBtn.click()

    await expect(warningAlert).not.toBeVisible()
    expect(presetCallCount).toBeGreaterThanOrEqual(2)
  })
})

