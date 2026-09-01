import type { ProjectTask } from '@/features/collab/model'

export type TaskSubtaskDraft = {
  id: string
  title: string
  is_completed: boolean
  assignee_sub: string | null
}

/**
 * A draft needs a local key while the form is open, but that key must never
 * become the persistent identifier of a subtask that does not exist yet.
 * The API owns persisted IDs when a task is first created.
 */
export function toCreateTaskSubtasks(subtasks: TaskSubtaskDraft[]) {
  return subtasks.map(({ title, is_completed, assignee_sub }) => ({
    title,
    is_completed,
    assignee_sub,
  }))
}

export function mapTaskSubtasksToDrafts(task: ProjectTask): TaskSubtaskDraft[] {
  return task.subtasks?.map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
    is_completed: subtask.isCompleted,
    assignee_sub: subtask.assigneeSub ?? null,
  })) ?? []
}
