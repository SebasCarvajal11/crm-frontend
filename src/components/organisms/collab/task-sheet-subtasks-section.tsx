import { AlertCircle, CheckSquare, Lock, Plus, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProjectMember, ProjectTask } from '@/features/collab/model'
import { getProjectMemberLabel } from '@/features/collab/lib/member-display'

type Props = {
  task: ProjectTask
  canEdit: boolean
  assignableMembers: ProjectMember[]
  subtaskAssignees: ProjectMember[]
  newSubtask: string
  newSubtaskAssignee: string
  isPending: boolean
  onNewSubtaskChange: (value: string) => void
  onNewSubtaskAssigneeChange: (value: string) => void
  onAddSubtask: () => void
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void
  onDeleteSubtask: (subtaskId: string) => void
}

export function TaskSheetSubtasksSection({
  task,
  canEdit,
  assignableMembers,
  subtaskAssignees,
  newSubtask,
  newSubtaskAssignee,
  isPending,
  onNewSubtaskChange,
  onNewSubtaskAssigneeChange,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: Props) {
  const canAddSubtask = newSubtask.trim().length > 0

  const getMemberLabel = (sub: string | null | undefined) => {
    if (!sub) return null
    const member = assignableMembers.find((entry) => entry.userSub === sub)
    return member?.email ? member.email.split('@')[0] : sub.slice(0, 8)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <CheckSquare className="size-3.5" />
          Subtareas
        </p>
        {task.subtasks && task.subtasks.length > 0 && (
          <span className="text-xs font-medium text-muted-foreground">
            {task.checklistProgress}%
          </span>
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${task.checklistProgress}%` }}
          />
        </div>
      )}

      <div className="mt-1 space-y-2">
        {task.subtasks?.map((subtask) => (
          <div key={subtask.id} className="group flex items-start gap-2 rounded-md py-1">
            <input
              type="checkbox"
              checked={subtask.isCompleted}
              disabled={!canEdit || isPending}
              onChange={(event) => onToggleSubtask(subtask.id, event.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-primary"
            />
            <div className="min-w-0 flex-1">
              <span className={`break-words text-sm transition-colors ${subtask.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {subtask.title}
              </span>
              {subtask.assigneeSub && (
                <div className="mt-0.5 flex items-center gap-1">
                  <User className="size-2.5 text-muted-foreground" />
                  <span className="truncate text-[10px] text-muted-foreground">
                    {getMemberLabel(subtask.assigneeSub)}
                  </span>
                </div>
              )}
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                onClick={() => onDeleteSubtask(subtask.id)}
                disabled={isPending}
                title="Eliminar subtarea"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}

        {canEdit && (
          subtaskAssignees.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
              <Lock className="size-3.5 shrink-0" />
              <span>No hay trabajadores asignados a esta tarea.</span>
            </div>
          ) : (
            <div className="mt-2 space-y-2 border-t pt-1">
              <Select value={newSubtaskAssignee} onValueChange={onNewSubtaskAssigneeChange}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <User className="mr-1 size-3 shrink-0" />
                  <SelectValue placeholder="Asignar trabajador (opcional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {subtaskAssignees.map((member) => (
                    <SelectItem key={member.userSub} value={member.userSub}>
                      {getProjectMemberLabel(member)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Describe la subtarea..."
                  value={newSubtask}
                  onChange={(event) => onNewSubtaskChange(event.target.value)}
                  className="h-8 text-sm"
                  disabled={isPending}
                />
                <Button
                  type="button"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={onAddSubtask}
                  disabled={!canAddSubtask || isPending}
                  title="Agregar subtarea"
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <AlertCircle className="size-3 shrink-0" />
                El asignado de la subtarea es opcional.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
