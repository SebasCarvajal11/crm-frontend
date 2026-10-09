import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTaskSheetSave } from './use-task-sheet-save'
import type { ProjectTask } from '@/features/collab/model'

const mockPatchTaskRequest = vi.fn()

vi.mock('@/features/collab/api', () => ({
  patchTaskRequest: (...args: unknown[]) => mockPatchTaskRequest(...args),
}))

const baseTask: ProjectTask = {
  id: 'task-100',
  projectId: 'proj-1',
  columnId: 'col-1',
  title: 'Tarea Base',
  description: 'Descripción inicial',
  priority: 'medium',
  assigneeSub: 'user-1',
  reporterSub: 'reporter-1',
  deadline: null,
  checklistProgress: 0,
  blockedByTaskId: null,
  isClientVisible: true,
  position: 0,
  subtasks: [],
  completedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('useTaskSheetSave', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
  })

  function setupHook(task = baseTask) {
    let hookInstance: ReturnType<typeof useTaskSheetSave> | null = null
    const onSaved = vi.fn()
    const onError = vi.fn()

    function TestConsumer() {
      hookInstance = useTaskSheetSave({
        accessToken: 'test-token',
        projectId: 'proj-1',
        task,
        onSaved,
        onError,
      })
      return null
    }

    renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <TestConsumer />
      </QueryClientProvider>
    )

    return { hook: hookInstance!, onSaved, onError }
  }

  it('envía assignees: [] cuando editWorkers está vacío para desasignar trabajadores', async () => {
    mockPatchTaskRequest.mockResolvedValueOnce({ data: {} })
    const { hook, onSaved } = setupHook()

    await hook.save.mutateAsync({
      editTitle: 'Tarea sin asignados',
      editDesc: '',
      editPriority: 'low',
      editVisible: true,
      editDeadline: '',
      editColumnId: 'col-1',
      editWorkers: [],
    })

    expect(mockPatchTaskRequest).toHaveBeenCalledWith(
      'test-token',
      'task-100',
      expect.objectContaining({
        title: 'Tarea sin asignados',
        description: null,
        priority: 'low',
        client_visible: true,
        assignees: [],
      })
    )
    expect(onSaved).toHaveBeenCalled()
  })

  it('envía arreglo mapeado de assignees cuando editWorkers contiene trabajadores', async () => {
    mockPatchTaskRequest.mockResolvedValueOnce({ data: {} })
    const { hook, onSaved } = setupHook()

    await hook.save.mutateAsync({
      editTitle: 'Tarea con asignados',
      editDesc: 'Con descripción',
      editPriority: 'urgent',
      editVisible: false,
      editDeadline: '2026-12-31',
      editColumnId: 'col-1',
      editWorkers: [
        { subject: 'user-sub-1', email: 'u1@test.com' } as never,
        { subject: 'user-sub-2', email: 'u2@test.com' } as never,
      ],
    })

    expect(mockPatchTaskRequest).toHaveBeenCalledWith(
      'test-token',
      'task-100',
      expect.objectContaining({
        title: 'Tarea con asignados',
        description: 'Con descripción',
        priority: 'urgent',
        client_visible: false,
        due_date: '2026-12-31',
        assignees: [
          { user_sub: 'user-sub-1', user_email: 'u1@test.com' },
          { user_sub: 'user-sub-2', user_email: 'u2@test.com' },
        ],
      })
    )
    expect(onSaved).toHaveBeenCalled()
  })
})
