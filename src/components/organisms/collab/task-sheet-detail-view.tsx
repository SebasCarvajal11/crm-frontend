import { AlertOctagon, Calendar, CheckCircle2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PRIORITY_CONFIG } from '@/components/molecules/priority-config'
import type { ProjectMember, ProjectTask } from '@/features/collab/model'
import { TaskSheetSubtasksSection } from './task-sheet-subtasks-section'
import { TaskBlockerBanner } from './task-blocker-banner'

type Props = {
  task: ProjectTask
  canEdit: boolean
  canBlock?: boolean
  canUnblock?: boolean
  isUnblocking?: boolean
  isFinalColumn?: boolean
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
  onOpenBlock?: () => void
  onOpenUnblock?: () => void
}

export function TaskSheetDetailView({
  task,
  canEdit,
  canBlock = false,
  canUnblock = false,
  isUnblocking = false,
  isFinalColumn = false,
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
  onOpenBlock,
  onOpenUnblock,
}: Props) {
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const createdAtLabel = new Date(task.createdAt).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
  const updatedAtLabel = new Date(task.updatedAt).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
  const deadlineLabel = task.deadline
    ? new Date(task.deadline).toLocaleDateString('es', { dateStyle: 'long' })
    : null

  return (
    <div className="space-y-5">
      <TaskBlockerBanner
        task={task}
        canUnblock={canUnblock}
        isUnblocking={isUnblocking}
        onOpenUnblock={onOpenUnblock ?? (() => {})}
      />

      <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 shadow-2xs">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Descripción</p>
        {task.description ? (
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">{task.description}</p>
        ) : (
          <p className="text-xs italic text-muted-foreground">Sin descripción registrada.</p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-border/50 bg-muted/15 p-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Prioridad</dt>
          <dd>
            <span
              className={
                `inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-2xs ` +
                `${priorityConfig.bg} ${priorityConfig.text}`
              }
            >
              {priorityConfig.label}
            </span>
          </dd>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/15 p-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Visible al cliente
          </dt>
          <dd className="font-bold text-foreground text-xs">{task.isClientVisible ? 'Sí' : 'No'}</dd>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/15 p-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Creada</dt>
          <dd className="text-[11px] text-muted-foreground font-medium" suppressHydrationWarning>{createdAtLabel}</dd>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/15 p-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Actualizada</dt>
          <dd className="text-[11px] text-muted-foreground font-medium" suppressHydrationWarning>{updatedAtLabel}</dd>
        </div>
        {task.deadline && (
          <div
            className={[
              'col-span-2 rounded-xl border border-border/50 bg-muted/15 p-2.5',
              'flex items-center justify-between',
            ].join(' ')}
          >
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fecha límite</dt>
            <dd className="flex items-center gap-1.5 text-xs font-bold text-foreground" suppressHydrationWarning>
              <Calendar className="size-3.5 text-primary" aria-hidden="true" />
              {deadlineLabel}
            </dd>
          </div>
        )}
      </dl>

      <Separator />

      <TaskSheetSubtasksSection
        task={task}
        canEdit={canEdit}
        isFinalColumn={isFinalColumn}
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

      {(canEdit || (canBlock && !task.blockType) || (canUnblock && task.blockType)) && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            {canUnblock && task.blockType && (
              <Button
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                disabled={isUnblocking}
                onClick={onOpenUnblock}
              >
                <CheckCircle2 className="mr-2 size-4" />
                Desbloquear tarea
              </Button>
            )}

            {canEdit && (
              <Button className="w-full rounded-xl font-semibold shadow-2xs" variant="outline" onClick={onStartEditing}>
                <Pencil className="mr-2 size-4" />
                Editar tarea
              </Button>
            )}

            {canBlock && !task.blockType && (
              <Button
                className={
                  'w-full rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 ' +
                  'dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/40 font-semibold'
                }
                variant="outline"
                onClick={onOpenBlock}
              >
                <AlertOctagon className="mr-2 size-4 text-rose-600" />
                Bloquear tarea
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
