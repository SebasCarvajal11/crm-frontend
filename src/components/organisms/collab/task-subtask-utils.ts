import type { ProjectTask } from '@/features/collab/model'

export type TaskSubtaskDraft = {
  id: string
  title: string
  is_completed: boolean
  assignee_sub: string | null
}

export function mapTaskSubtasksToDrafts(task: ProjectTask): TaskSubtaskDraft[] {
  return task.subtasks?.map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
    is_completed: subtask.isCompleted,
    assignee_sub: subtask.assigneeSub ?? null,
  })) ?? []
}
