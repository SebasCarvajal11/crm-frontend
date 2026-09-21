import type { ProjectMember, ProjectTask } from '@/features/collab/model'
import type { ClientSearchResult } from '@/shared/types'
import { getProjectMemberLabel } from '@/features/collab/lib/member-display'

export function workersFromTask(task: ProjectTask, members: ProjectMember[]): ClientSearchResult[] {
  if (!task.assigneeSub) return []
  const member = members.find((entry) => entry.userSub === task.assigneeSub)
  if (!member) return []
  return [{ subject: member.userSub, email: member.email ?? getProjectMemberLabel(member), role: 'worker' }]
}

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

export function toggleTaskSubtask(
  subtasks: ProjectTask['subtasks'],
  subtaskId: string,
  isCompleted: boolean
) {
  if (!subtasks) return []
  return subtasks.map((s) => ({
    id: s.id,
    title: s.title,
    is_completed: s.id === subtaskId ? isCompleted : s.isCompleted,
    assignee_sub: s.assigneeSub ?? null,
  }))
}

export function deleteTaskSubtask(subtasks: ProjectTask['subtasks'], subtaskId: string) {
  if (!subtasks) return []
  return subtasks
    .filter((s) => s.id !== subtaskId)
    .map((s) => ({
      id: s.id,
      title: s.title,
      is_completed: s.isCompleted,
      assignee_sub: s.assigneeSub ?? null,
    }))
}
