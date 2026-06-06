import { Calendar, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PRIORITY_CONFIG } from '@/components/molecules/priority-config'
import type { ProjectMember, ProjectTask } from '@/features/collab/model'
import { TaskSheetSubtasksSection } from './task-sheet-subtasks-section'

type Props = {
  task: ProjectTask
  canEdit: boolean
  assignableMembers: ProjectMember[]
  subtaskAssignees: ProjectMember[]
  newSubtask: string
  newSubtaskAssignee: string
  isSubtaskPending: boolean
  onNewSubtaskChange: (value: string) => void
  onNewSubtaskAssigneeChange: (value: string) => void
  onAddSubtask: () => void
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void
  onDeleteSubtask: (subtaskId: string) => void
  onStartEditing: () => void
}

export function TaskSheetDetailView({
  task,
  canEdit,
  assignableMembers,
  subtaskAssignees,
  newSubtask,
  newSubtaskAssignee,
  isSubtaskPending,
  onNewSubtaskChange,
  onNewSubtaskAssigneeChange,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartEditing,
}: Props) {
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const createdAtLabel = new Date(task.createdAt).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
  const updatedAtLabel = new Date(task.updatedAt).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
  const deadlineLabel = task.deadline
    ? new Date(task.deadline).toLocaleDateString('es', { dateStyle: 'long' })
    : null

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descripcion</p>
        {task.description
          ? <p className="text-sm leading-relaxed">{task.description}</p>
          : <p className="text-sm italic text-muted-foreground">Sin descripcion.</p>}
      </div>

      <Separator />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <div>
          <dt className="mb-1 text-xs text-muted-foreground">Prioridad</dt>
          <dd><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityConfig.bg} ${priorityConfig.text}`}>{priorityConfig.label}</span></dd>
        </div>
        <div>
          <dt className="mb-1 text-xs text-muted-foreground">Visible al cliente</dt>
          <dd className="font-medium">{task.isClientVisible ? 'Si' : 'No'}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs text-muted-foreground">Creada</dt>
          <dd className="text-xs text-muted-foreground" suppressHydrationWarning>{createdAtLabel}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs text-muted-foreground">Actualizada</dt>
          <dd className="text-xs text-muted-foreground" suppressHydrationWarning>{updatedAtLabel}</dd>
        </div>
        {task.deadline && (
          <div className="col-span-2">
            <dt className="mb-1 text-xs text-muted-foreground">Fecha limite</dt>
            <dd className="flex items-center gap-1.5" suppressHydrationWarning>
              <Calendar className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {deadlineLabel}
            </dd>
          </div>
        )}
      </dl>

      <Separator />

      <TaskSheetSubtasksSection
        task={task}
        canEdit={canEdit}
        assignableMembers={assignableMembers}
        subtaskAssignees={subtaskAssignees}
        newSubtask={newSubtask}
        newSubtaskAssignee={newSubtaskAssignee}
        isPending={isSubtaskPending}
        onNewSubtaskChange={onNewSubtaskChange}
        onNewSubtaskAssigneeChange={onNewSubtaskAssigneeChange}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onDeleteSubtask={onDeleteSubtask}
      />

      {canEdit && (
        <>
          <Separator />
          <Button className="w-full" variant="outline" onClick={onStartEditing}>
            <Pencil className="mr-2 size-4" />
            Editar tarea
          </Button>
        </>
      )}
    </div>
  )
}
