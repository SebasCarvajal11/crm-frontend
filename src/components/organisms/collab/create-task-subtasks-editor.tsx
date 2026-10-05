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

  const assignableWorkers = selectedWorkers.length > 0 ? selectedWorkers : workerMembers

  return (
    <div className="space-y-2.5 border-t border-border/60 pt-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
          <CheckSquare className="size-3.5 text-primary" />
          Subtareas (Checklist del entregable)
        </Label>
        {!canAssign && <span className="text-[10px] text-muted-foreground">Solo administradores y trabajadores</span>}
      </div>

      {!canAssign ? null : (
        <>
          {subtasks.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={
                    'group flex items-center gap-2.5 rounded-lg border border-border/70 bg-card ' +
                    'px-3 py-2 text-xs shadow-2xs transition-colors hover:border-primary/30 hover:bg-muted/20'
                  }
                >
                  <CheckSquare className="size-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="flex-1 break-words font-medium text-foreground">{subtask.title}</span>
                  {subtask.assignee_sub && (
                    <span
                      className={
                        'flex shrink-0 items-center gap-1 rounded-full bg-primary/10 border ' +
                        'border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary'
                      }
                    >
                      <User className="size-2.5" />
                      {getWorkerLabel(subtask.assignee_sub)?.split('@')[0]}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={
                      'size-6 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100 ' +
                      'hover:text-destructive hover:bg-destructive/10 transition-all rounded-md'
                    }
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
              id="ct-subtask-input"
              data-testid="task-subtask-input"
              placeholder="Descripción de la subtarea..."
              value={newSubtask}
              onChange={(event) => onNewSubtaskChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onAddSubtask()
                }
              }}
              className="h-8 rounded-lg border-border/70 text-xs focus-visible:ring-primary/20"
            />
            <Select value={newSubtaskAssignee} onValueChange={onNewSubtaskAssigneeChange}>
              <SelectTrigger className="h-8 w-36 shrink-0 rounded-lg border-border/70 text-xs">
                <User className="mr-1 size-3 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Asignar a..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">Sin asignar</SelectItem>
                {assignableWorkers.map((worker) => (
                  <SelectItem key={worker.userSub} value={worker.userSub} className="text-xs">
                    {worker.email?.split('@')[0] ?? worker.userSub.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-8 shrink-0 rounded-lg shadow-2xs hover:bg-primary hover:text-white transition-colors"
              disabled={!newSubtask.trim()}
              onClick={onAddSubtask}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
