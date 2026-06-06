import { CheckSquare, Plus, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProjectMember } from '@/features/collab/model'
import { getProjectMemberLabel } from '@/features/collab/lib/member-display'
import type { TaskSubtaskDraft } from './task-subtask-utils'

type Props = {
  canAssign: boolean
  workerMembers: ProjectMember[]
  selectedWorkers: ProjectMember[]
  subtasks: TaskSubtaskDraft[]
  newSubtask: string
  newSubtaskAssignee: string
  onNewSubtaskChange: (value: string) => void
  onNewSubtaskAssigneeChange: (value: string) => void
  onAddSubtask: () => void
  onRemoveSubtask: (subtaskId: string) => void
}

export function CreateTaskSubtasksEditor({
  canAssign,
  workerMembers,
  selectedWorkers,
  subtasks,
  newSubtask,
  newSubtaskAssignee,
  onNewSubtaskChange,
  onNewSubtaskAssigneeChange,
  onAddSubtask,
  onRemoveSubtask,
}: Props) {
  const getWorkerLabel = (sub: string | null) => {
    if (!sub) return null
    const worker = workerMembers.find((member) => member.userSub === sub)
    return worker ? getProjectMemberLabel(worker) : sub
  }

  return (
    <div className="space-y-2 border-t pt-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <CheckSquare className="size-3.5 text-muted-foreground" />
          Subtareas (Checklist)
        </Label>
        {!canAssign && <span className="text-[10px] text-muted-foreground">Solo admin/worker</span>}
      </div>

      {!canAssign ? null : (
        <>
          {subtasks.length > 0 && (
            <div className="mb-1 space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="group flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <CheckSquare className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 break-words">{subtask.title}</span>
                  {subtask.assignee_sub && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      <User className="size-2.5" />
                      {getWorkerLabel(subtask.assignee_sub)?.split('@')[0]}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={() => onRemoveSubtask(subtask.id)}
                    title="Eliminar subtarea"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              placeholder="Descripcion de la subtarea..."
              value={newSubtask}
              onChange={(event) => onNewSubtaskChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onAddSubtask()
                }
              }}
              className="h-8 text-sm"
            />
            <Select value={newSubtaskAssignee} onValueChange={onNewSubtaskAssigneeChange}>
              <SelectTrigger className="h-8 w-36 shrink-0 text-xs">
                <User className="mr-1 size-3 shrink-0" />
                <SelectValue placeholder="Asignar a..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {selectedWorkers.map((worker) => (
                  <SelectItem key={worker.userSub} value={worker.userSub}>
                    {worker.email?.split('@')[0] ?? worker.userSub.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="secondary" size="icon" className="size-8 shrink-0" disabled={!newSubtask.trim()} onClick={onAddSubtask}>
              <Plus className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
