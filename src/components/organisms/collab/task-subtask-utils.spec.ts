import { describe, expect, it } from 'vitest'
import {
  deleteTaskSubtask,
  toCreateTaskSubtasks,
  toggleTaskSubtask,
  workersFromTask,
} from './task-subtask-utils'

describe('toCreateTaskSubtasks', () => {
  it('no envía identificadores temporales al crear una tarea', () => {
    expect(toCreateTaskSubtasks([
      {
        id: '4fbf4aed-4bf7-4a3e-bdc1-b65cab2315e5',
        title: 'Revisar propuesta',
        is_completed: false,
        assignee_sub: null,
      },
    ])).toEqual([
      {
        title: 'Revisar propuesta',
        is_completed: false,
        assignee_sub: null,
      },
    ])
  })

  it('alterna y elimina subtareas correctamente', () => {
    const subtasks = [
      { id: 'sub-1', title: 'Sub 1', isCompleted: false, assigneeSub: 'w-1' },
      { id: 'sub-2', title: 'Sub 2', isCompleted: true, assigneeSub: null },
    ]

    const toggled = toggleTaskSubtask(subtasks, 'sub-1', true)
    expect(toggled).toEqual([
      { id: 'sub-1', title: 'Sub 1', is_completed: true, assignee_sub: 'w-1' },
      { id: 'sub-2', title: 'Sub 2', is_completed: true, assignee_sub: null },
    ])

    const deleted = deleteTaskSubtask(subtasks, 'sub-2')
    expect(deleted).toEqual([
      { id: 'sub-1', title: 'Sub 1', is_completed: false, assignee_sub: 'w-1' },
    ])
  })

  it('resuelve los trabajadores asignados de la tarea', () => {
    const task = {
      assigneeSub: 'w-1',
    } as any
    const members = [
      { userSub: 'w-1', email: 'worker@cima.dev' },
    ] as any

    expect(workersFromTask(task, members)).toEqual([
      { subject: 'w-1', email: 'worker@cima.dev', role: 'worker' },
    ])
    expect(workersFromTask({ assigneeSub: null } as any, members)).toEqual([])
  })
})
