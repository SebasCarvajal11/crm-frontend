import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TaskColumn } from './task-column'
import type { ProjectTask, ProjectTaskColumn } from '@/features/collab/model'

const baseColumn: ProjectTaskColumn = {
  id: 'col-1',
  projectId: 'proj-1',
  key: 'doing',
  title: 'En Desarrollo',
  position: 0,
  isClientVisible: true,
  isDefault: false,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
}

const sampleTask: ProjectTask = {
  id: 'task-1',
  projectId: 'proj-1',
  columnId: 'col-1',
  title: 'Configurar variables de entorno',
  description: 'Documentar .env.example',
  priority: 'medium',
  position: 0,
  assigneeSub: null,
  reporterSub: 'reporter-1',
  blockedByTaskId: null,
  isClientVisible: true,
  blockType: null,
  blockReason: null,
  blockedAt: null,
  blockedBySub: null,
  deadline: null,
  subtasks: [],
  checklistProgress: 0,
  completedAt: null,
  createdAt: '2026-04-01T10:00:00Z',
  updatedAt: '2026-04-01T10:00:00Z',
}

describe('TaskColumn', () => {
  it('renderiza encabezado con título, contador de tareas e indicador de cliente', () => {
    const markup = renderToStaticMarkup(
      <TaskColumn
        column={baseColumn}
        tasks={[sampleTask]}
        selectedTaskId={null}
        canDrag={true}
        canCreateTask={true}
        onSelectTask={vi.fn()}
        onDropTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    )

    expect(markup).toContain('En Desarrollo')
    expect(markup).toContain('Visible para el cliente')
    expect(markup).toContain('kanban-column-dropzone')
    expect(markup).toContain('data-drag-over="false"')
    expect(markup).toContain('Crear tarea en En Desarrollo')
  })

  it('muestra estado vacío receptivo para arrastre cuando no tiene tareas y canDrag es true', () => {
    const markup = renderToStaticMarkup(
      <TaskColumn
        column={baseColumn}
        tasks={[]}
        selectedTaskId={null}
        canDrag={true}
        canCreateTask={false}
        onSelectTask={vi.fn()}
        onDropTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    )

    expect(markup).toContain('Arrastra tareas aquí')
    expect(markup).toContain('border-dashed')
  })

  it('muestra estado vacío informativo cuando no tiene tareas y canDrag es false', () => {
    const markup = renderToStaticMarkup(
      <TaskColumn
        column={baseColumn}
        tasks={[]}
        selectedTaskId={null}
        canDrag={false}
        canCreateTask={false}
        onSelectTask={vi.fn()}
        onDropTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    )

    expect(markup).toContain('Sin tareas')
  })
})
