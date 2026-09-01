import { describe, expect, it } from 'vitest'
import { toCreateTaskSubtasks } from './task-subtask-utils'

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
})
