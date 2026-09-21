import { test, expect } from '@playwright/test'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { chooseRadixSelectOption } from '../../helpers/ui-actions'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/7716f2ab-0cd2-4f33-8081-7796e156df34/screenshots'

test.describe('Coherencia de Subtareas y Progreso en Tablero', () => {
  test.setTimeout(60_000)

  test('valida invariante de tareas terminadas, bloqueo de subtareas y correspondencia de progreso', async ({
    page,
    baseURL,
  }) => {
    const frontendUrl = baseURL || 'http://155.248.207.47'
    await page.setViewportSize({ width: 1440, height: 900 })

    // 1. Iniciar sesión como administrador
    await page.goto(`${frontendUrl}/login`)
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    await page.waitForLoadState('networkidle')

    // 2. Navegar al módulo de Colaboración
    const dashboard = new DashboardPage(page)
    await dashboard.navigateToCollab()
    const collab = new CollabPage(page)
    await collab.expectLoaded()

    // 3. Abrir el proyecto de Producto
    const productCard = page.locator('button[aria-label^="Abrir proyecto"]').filter({ hasText: /Packaging retail/i }).first()
    await expect(productCard).toBeVisible({ timeout: 10_000 })
    await productCard.click()

    const project = new ProjectPage(page)
    await project.expectLoaded()
    await project.navigateToBoard()

    // 4. Localizar la columna "Terminado"
    const doneColumn = page.locator('[aria-label^="Columna Terminado"]')
    await expect(doneColumn).toBeVisible()

    // 5. Validar que las tareas en "Terminado" no tengan 0% y estén 100% consistentes
    const doneTasks = doneColumn.locator('button').filter({ hasText: /Creada:/i })
    const count = await doneTasks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const taskCard = doneTasks.nth(i)
      const text = await taskCard.innerText()
      expect(text).not.toMatch(/(?<!\d)0%/)
      expect(text).toContain('100%')
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/08-done-column-consistent-tasks.png`,
      fullPage: false,
    })

    // 6. Abrir una tarea finalizada y comprobar que sus subtareas son de solo lectura
    const completedTask = doneTasks.first()
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

    // 8. Abrir una tarea con subtareas pendientes en una columna no finalizada
    const nonDoneTaskWithPendingSubtasks = page
      .locator('[aria-label^="Columna"]:not([aria-label*="Terminado"])')
      .locator('button')
      .filter({ has: page.locator('[role="progressbar"]:not([aria-valuenow="100"])') })
      .first()
    await expect(nonDoneTaskWithPendingSubtasks).toBeVisible({ timeout: 5_000 })
    await nonDoneTaskWithPendingSubtasks.click()
    await page.waitForTimeout(800)

    // Intentar cambiar columna a "Terminado" desde el formulario de edición
    await page.getByRole('button', { name: 'Editar tarea' }).first().click()
    await page.waitForTimeout(500)

    const colSelectTrigger = page.locator('#et-col')
    await chooseRadixSelectOption(page, colSelectTrigger, 'Terminado')

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
