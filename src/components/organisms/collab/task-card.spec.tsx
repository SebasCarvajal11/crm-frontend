import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TaskCard } from './task-card'
import type { ProjectTask } from '@/features/collab/model'

const baseTask: ProjectTask = {
  id: 'task-101',
  projectId: 'proj-1',
  columnId: 'col-1',
  title: 'Diseñar interfaz de onboarding',
  description: 'Crear maquetas en Figma y validar con el cliente',
  priority: 'high',
  position: 0,
  assigneeSub: null,
  reporterSub: 'reporter-1',
  blockedByTaskId: null,
  isClientVisible: true,
  blockType: null,
  blockReason: null,
  blockedAt: null,
  blockedBySub: null,
  deadline: '2026-05-15T00:00:00Z',
  subtasks: [
    { id: 'sub-1', title: 'Bocetos iniciales', isCompleted: true },
    { id: 'sub-2', title: 'Prototipo interactivo', isCompleted: false },
  ],
  checklistProgress: 50,
  completedAt: null,
  createdAt: '2026-04-01T12:00:00Z',
  updatedAt: '2026-04-02T15:30:00Z',
}

describe('TaskCard', () => {
  it('renderiza título, descripción, badges y barra de progreso con shimmer', () => {
    const markup = renderToStaticMarkup(
      <TaskCard
        task={baseTask}
        isSelected={false}
        canDrag={true}
        onClick={vi.fn()}
      />
    )

    expect(markup).toContain('Diseñar interfaz de onboarding')
    expect(markup).toContain('Crear maquetas en Figma')
    expect(markup).toContain('kanban-task-card')
    expect(markup).toContain('animate-progress-shimmer')
    expect(markup).toContain('50%')
    expect(markup).toContain('1/2')
    expect(markup).toContain('draggable="true"')
  })

  it('deshabilita draggable cuando canDrag es false y oculta el tirador de arrastre', () => {
    const markup = renderToStaticMarkup(
      <TaskCard
        task={baseTask}
        isSelected={false}
        canDrag={false}
        onClick={vi.fn()}
      />
    )

    expect(markup).toContain('draggable="false"')
    expect(markup).not.toContain('cursor-grab')
  })

  it('aplica clase visual de foco/selección cuando isSelected es true', () => {
    const markup = renderToStaticMarkup(
      <TaskCard
        task={baseTask}
        isSelected={true}
        canDrag={true}
        onClick={vi.fn()}
      />
    )

    expect(markup).toContain('ring-2 ring-primary')
    expect(markup).toContain('aria-pressed="true"')
  })

  it('muestra badge de bloqueo y bordes rojizos cuando task está bloqueada', () => {
    const blockedTask: ProjectTask = {
      ...baseTask,
      blockType: 'client_timeout',
      blockReason: 'Sin respuesta del cliente tras 48h',
    }

    const markup = renderToStaticMarkup(
      <TaskCard
        task={blockedTask}
        isSelected={false}
        canDrag={true}
        onClick={vi.fn()}
      />
    )

    expect(markup).toContain('Timeout 48h')
    expect(markup).toContain('border-rose-500/50')
  })
})
