import { test, expect } from '@playwright/test'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/7716f2ab-0cd2-4f33-8081-7796e156df34/screenshots'

test.describe('Coherencia de Subtareas y Progreso en Tablero', () => {
  test('valida invariante de tareas terminadas, bloqueo de subtareas y correspondencia de progreso', async ({
    page,
    baseURL,
  }) => {
    const frontendUrl = baseURL || 'http://155.248.207.47'

    // 1. Iniciar sesión como administrador
    await page.goto(`${frontendUrl}/login`)
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    await page.waitForLoadState('networkidle')

    // 2. Navegar al módulo de Colaboración
    await page.getByRole('link', { name: 'Colaboración' }).click()
    await page.waitForTimeout(1000)

    // 3. Abrir el proyecto de Producto (Packaging retail y despliegue digital Sierra Alta Reserva)
    const productProjectCard = page.locator('button').filter({ hasText: /Packaging retail/i }).first()
    await expect(productProjectCard).toBeVisible({ timeout: 10_000 })
    await productProjectCard.click()
    await page.waitForTimeout(1000)

    // 4. Localizar la columna "Terminado"
    const doneColumn = page.locator('[data-column-key="done"], div').filter({ hasText: /^Terminado/i }).first()
    await expect(doneColumn).toBeVisible()

    // 5. Validar que ninguna tarea en "Terminado" tenga 0% de avance
    const doneTasks = doneColumn.locator('button[role="button"], [data-task-id]')
    const count = await doneTasks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const taskCard = doneTasks.nth(i)
      const text = await taskCard.innerText()
      // No debe contener "0%" en la columna Terminado
      expect(text).not.toContain('0%')
      // Si tiene subtareas, debe decir "3/3" y "100%"
      if (text.includes('subtareas')) {
        expect(text).toContain('100%')
      }
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/08-done-column-consistent-tasks.png`,
      fullPage: false,
    })

    // 6. Abrir una tarea finalizada y comprobar que sus subtareas son de solo lectura
    const completedTask = doneColumn.locator('button').filter({ hasText: /Definir especificaciones/i }).first()
    await completedTask.click()
    await page.waitForTimeout(800)

    // Validar mensaje informativo en la sección de subtareas
    const finalizedNotice = page.locator('text=Tarea finalizada. Para modificar o desmarcar subtareas')
    await expect(finalizedNotice).toBeVisible()

    // Validar que los checkboxes de subtareas estén deshabilitados
    const subtaskCheckboxes = page.locator('input[type="checkbox"]:disabled')
    const disabledCount = await subtaskCheckboxes.count()
    expect(disabledCount).toBeGreaterThan(0)

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/09-finalized-task-read-only-subtasks.png`,
      fullPage: false,
    })

    // 7. Cerrar panel de tarea
    await page.getByRole('button', { name: 'Cerrar panel' }).click()
    await page.waitForTimeout(500)

    // 8. Abrir una tarea en curso con subtareas pendientes
    const doingColumn = page.locator('div').filter({ hasText: /^En Curso/i }).first()
    const doingTask = doingColumn.locator('button').filter({ hasText: /subtareas/i }).first()
    await doingTask.click()
    await page.waitForTimeout(800)

    // Intentar cambiar columna a "Terminado" desde el formulario de edición
    await page.getByRole('button', { name: 'Editar tarea' }).click()
    await page.waitForTimeout(500)

    const colSelect = page.locator('#et-col')
    await colSelect.click()
    await page.getByRole('option', { name: 'Terminado' }).click()

    // Intentar guardar
    await page.getByRole('button', { name: 'Guardar' }).click()
    await page.waitForTimeout(500)

    // Validar mensaje de error bloqueando el paso a Terminado
    const errorAlert = page.locator('text=No puedes mover la tarea a la columna final sin completar todas las subtareas')
    await expect(errorAlert).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/10-blocked-move-to-done-with-incomplete-subtasks.png`,
      fullPage: false,
    })
  })
})
