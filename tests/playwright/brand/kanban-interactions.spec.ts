import { expect, test, type Page } from '@playwright/test'
import { projectId, setupDashboard } from '../tour/fixtures'

const mockBoardTasks = [
  {
    id: 'task-1',
    projectId,
    columnId: 'col-1',
    title: 'Microinteracciones hápticas en Kanban',
    description: 'Implementar aceleración GPU y elevación con tilt orgánico',
    priority: 'high',
    position: 0,
    assigneeSub: null,
    reporterSub: 'test-user',
    blockedByTaskId: null,
    isClientVisible: true,
    blockType: null,
    blockReason: null,
    blockedAt: null,
    blockedBySub: null,
    deadline: '2026-05-15T00:00:00Z',
    subtasks: [
      { id: 'sub-1', title: 'Especificar tokens', isCompleted: true },
      { id: 'sub-2', title: 'Integrar vitest', isCompleted: false },
    ],
    checklistProgress: 50,
    completedAt: null,
    createdAt: '2026-04-01T12:00:00Z',
    updatedAt: '2026-04-02T15:30:00Z',
  },
]

const mockBoardColumns = [
  { id: 'col-1', projectId, key: 'pending', title: 'Pendiente', position: 0, isClientVisible: true, isDefault: true },
  { id: 'col-2', projectId, key: 'doing', title: 'En progreso', position: 1, isClientVisible: true, isDefault: true },
]

async function mockCollabBoard(page: Page) {
  await page.route('**/collab/projects/*/board**', async (route) => {
    const project = {
      id: projectId, name: 'Proyecto de prueba', clientName: 'Cliente CIMA',
      type: 'campaign_service', status: 'in_progress', progressPercent: 60,
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { data: { project, members: [], board: { columns: mockBoardColumns, tasks: mockBoardTasks } } },
    })
  })
}

test.describe('Kanban Tactile Tilt & Lift y Borde Reactivo (Virtualizer-Safe)', () => {
  test('TaskCard aplica aceleración GPU, clase kanban-task-card y shimmer en progreso', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockCollabBoard(page)

    await page.goto(`/dashboard?tab=collab&project_id=${projectId}`)
    await page.waitForLoadState('networkidle')

    const taskCard = page.locator('[data-testid="task-card-task-1"]').first()
    await expect(taskCard).toBeVisible()

    // 1. Verificar clase de tarjeta háptica con aceleración GPU
    await expect(taskCard).toHaveClass(/kanban-task-card/)

    // 2. Verificar shimmer continuo en barra de progreso
    const shimmer = taskCard.locator('.animate-progress-shimmer')
    await expect(shimmer).toBeVisible()

    // 3. Simular dragstart y verificar estado data-dragging
    await taskCard.dispatchEvent('dragstart', {
      dataTransfer: await page.evaluateHandle(() => new DataTransfer()),
    })
    await expect(taskCard).toHaveAttribute('data-dragging', 'true')

    // 4. Finalizar arrastre con dragend y verificar restauración
    await taskCard.dispatchEvent('dragend')
    await expect(taskCard).toHaveAttribute('data-dragging', 'false')

    // 5. Cero desbordamiento global en la ventana
    const noWindowOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    expect(noWindowOverflow).toBe(true)
    expect(errors).toEqual([])
  })

  test('TaskColumn activa Reactive Boundary Glow en dragover sin romper virtualización', async ({
    page,
  }) => {
    const { errors } = await setupDashboard(page, 'admin')
    await mockCollabBoard(page)

    await page.goto(`/dashboard?tab=collab&project_id=${projectId}`)
    await page.waitForLoadState('networkidle')

    const targetColumn = page.locator('[data-testid="kanban-column-col-2"]')
    await expect(targetColumn).toBeVisible()
    await expect(targetColumn).toHaveAttribute('data-drag-over', 'false')

    // 1. Simular evento dragover sobre la columna destino
    await targetColumn.dispatchEvent('dragover', {
      dataTransfer: await page.evaluateHandle(() => new DataTransfer()),
    })
    await expect(targetColumn).toHaveAttribute('data-drag-over', 'true')
    await expect(targetColumn).toHaveClass(/kanban-column-dropzone/)

    // 2. Simular cancelación global de arrastre (dragend) y verificar recuperación inmediata
    await page.evaluate(() => window.dispatchEvent(new Event('dragend')))
    await expect(targetColumn).toHaveAttribute('data-drag-over', 'false')

    // 3. Simular dragover y luego salida (dragleave)
    await targetColumn.dispatchEvent('dragover', {
      dataTransfer: await page.evaluateHandle(() => new DataTransfer()),
    })
    await expect(targetColumn).toHaveAttribute('data-drag-over', 'true')
    await targetColumn.dispatchEvent('dragleave')
    await expect(targetColumn).toHaveAttribute('data-drag-over', 'false')

    // 4. Verificar que la columna conserva virtualización con translateY absoluto
    const sourceColumn = page.locator('[data-testid="kanban-column-col-1"]')
    const virtualWrapper = sourceColumn.locator('div[style*="position: absolute"]')
    await expect(virtualWrapper).toBeAttached()
    const transformStyle = await virtualWrapper.getAttribute('style')
    expect(transformStyle).toContain('translateY')

    expect(errors).toEqual([])
  })

  test('Respeta strictly prefers-reduced-motion suprimiendo rotaciones y animación shimmer', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { errors } = await setupDashboard(page, 'admin')
    await mockCollabBoard(page)

    await page.goto(`/dashboard?tab=collab&project_id=${projectId}`)
    await page.waitForLoadState('networkidle')

    const taskCard = page.locator('[data-testid="task-card-task-1"]').first()
    await expect(taskCard).toBeVisible()

    // 1. Verificar que transform espacial en reduced-motion se anula a 'none'
    const computedTransform = await taskCard.evaluate((el) => window.getComputedStyle(el).transform)
    expect(computedTransform).toBe('none')

    // 2. Verificar que animación shimmer se anula en reduced-motion
    const shimmer = taskCard.locator('.animate-progress-shimmer')
    const animationName = await shimmer.evaluate((el) => window.getComputedStyle(el).animationName)
    expect(['none', ''].includes(animationName) || animationName.length === 0).toBe(true)

    // 3. Verificar que se conservan transiciones simples de opacidad y borde
    const transitionProp = await taskCard.evaluate((el) => window.getComputedStyle(el).transitionProperty)
    expect(transitionProp.includes('opacity') || transitionProp.includes('border')).toBe(true)

    expect(errors).toEqual([])
  })
})
