import { useCallback, useMemo, useState } from 'react'
import { FileText, MessageSquare, Paperclip, Pencil, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { PriorityBadge } from '@/components/molecules/priority-badge'
import { useBlockTask, useSubtaskMutate, useTaskSheetSave } from '@/features/collab/hooks'
import { getProjectMemberLabel, projectWorkers } from '@/features/collab/lib/member-display'
import type { ProjectMember, ProjectTask, ProjectTaskColumn } from '@/features/collab/model'
import type { ClientSearchResult, MeResponse } from '@/shared/types'
import { isoToLocalDate } from '@/shared/lib'
import { TaskComments } from './task-comments'
import { TaskSheetDetailView } from './task-sheet-detail-view'
import { TaskSheetEditForm } from './task-sheet-edit-form'
import { TaskFilesTab } from './task-files-tab'
import { BlockTaskDialog } from './block-task-dialog'
import { UnblockTaskDialog } from './unblock-task-dialog'
import {
  deleteTaskSubtask,
  mapTaskSubtasksToDrafts,
  toggleTaskSubtask,
  workersFromTask,
} from './task-subtask-utils'
import { FINALIZATION_COLUMN_KEYS } from './project-workspace.types'

type Tab = 'info' | 'comments' | 'files'

type Props = {
  task: ProjectTask
  canEdit: boolean
  accessToken: string
  projectId: string
  identity: MeResponse['data']
  members: ProjectMember[]
  columns: ProjectTaskColumn[]
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

export function TaskSheet({
  task, canEdit, accessToken, projectId, identity, members, columns,
  onClose, onSaved, onError,
}: Props) {
  const [tab, setTab] = useState<Tab>('info')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description ?? '')
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editVisible, setEditVisible] = useState(task.isClientVisible)
  const [editDeadline, setEditDeadline] = useState(isoToLocalDate(task.deadline))
  const [editColumnId, setEditColumnId] = useState(task.columnId)
  const [editWorkers, setEditWorkers] = useState<ClientSearchResult[]>(() => workersFromTask(task, members))
  const [newSubtask, setNewSubtask] = useState('')
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState<string>('none')
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false)

  const currentColumn = columns.find((c) => c.id === task.columnId)
  const isFinalColumn = Boolean(currentColumn && FINALIZATION_COLUMN_KEYS.has(currentColumn.key))

  const isAdmin = identity.role === 'admin'
  const isClient = identity.role === 'client'
  const isWorker = identity.role === 'worker'
  const isAssignee =
    task.assigneeSub === identity.id ||
    Boolean(task.subtasks?.some((s) => s.assigneeSub === identity.id))

  const canBlock = isAdmin || (isWorker && canEdit)
  const canUnblock =
    isAdmin ||
    (task.blockType === 'client_timeout' && isClient) ||
    (task.blockType === 'internal_impediment' && isWorker && isAssignee)

  const assignableMembers = projectWorkers(members)

  const subtaskAssignees = useMemo(() => {
    if (!task.assigneeSub) return assignableMembers
    const assigned = assignableMembers.filter((m) => m.userSub === task.assigneeSub)
    return assigned.length > 0 ? assigned : assignableMembers
  }, [assignableMembers, task.assigneeSub])

  const startEditing = useCallback(() => {
    setEditTitle(task.title)
    setEditDesc(task.description ?? '')
    setEditPriority(task.priority)
    setEditVisible(task.isClientVisible)
    setEditDeadline(isoToLocalDate(task.deadline))
    setEditColumnId(task.columnId)
    setEditWorkers(workersFromTask(task, members))
    setEditing(true)
  }, [task, members])

  const { save } = useTaskSheetSave({
    accessToken,
    projectId,
    task,
    onSaved: () => {
      setEditing(false)
      onSaved()
    },
    onError,
  })

  const { blockTask, isBlocking, unblockTask, isUnblocking } = useBlockTask({
    accessToken,
    projectId,
    taskId: task.id,
    onSuccess: () => {
      setIsBlockDialogOpen(false)
      setIsUnblockDialogOpen(false)
      onSaved()
    },
    onError,
  })

  const subtaskMutate = useSubtaskMutate({
    accessToken,
    projectId,
    taskId: task.id,
    onError,
  })

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return

    const updated = [
      ...mapTaskSubtasksToDrafts(task),
      {
        title: newSubtask.trim(),
        is_completed: false,
        assignee_sub: newSubtaskAssignee === 'none' ? null : newSubtaskAssignee,
      },
    ]

    subtaskMutate.mutate(updated)
    setNewSubtask('')
    setNewSubtaskAssignee('none')
  }

  const handleToggleSubtask = (subtaskId: string, isCompleted: boolean) => {
    subtaskMutate.mutate(toggleTaskSubtask(task.subtasks, subtaskId, isCompleted))
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    subtaskMutate.mutate(deleteTaskSubtask(task.subtasks, subtaskId))
  }

  return (
    <>
      <SheetHeader className="border-b px-5 pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SheetTitle className="line-clamp-2 text-base font-semibold leading-snug">{task.title}</SheetTitle>
            <SheetDescription className="mt-1 flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} size="xs" />
              {task.isClientVisible && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] text-violet-700">
                  <User className="size-3" aria-hidden="true" />
                  Visible al cliente
                </span>
              )}
            </SheetDescription>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {canEdit && !editing && (
              <Button variant="ghost" size="icon" className="size-8" onClick={startEditing} aria-label="Editar tarea">
                <Pencil className="size-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="size-8" onClick={onClose} aria-label="Cerrar panel">
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="-mx-5 mt-2 flex gap-0.5 border-b px-5 pb-0" role="tablist" aria-label="Secciones de la tarea">
          {([
            { key: 'info' as const, label: 'Detalle', icon: <FileText className="size-3.5" /> },
            { key: 'comments' as const, label: 'Comentarios', icon: <MessageSquare className="size-3.5" /> },
            { key: 'files' as const, label: 'Archivos', icon: <Paperclip className="size-3.5" /> },
          ]).map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={[
                '-mb-px flex items-center gap-1.5 whitespace-nowrap rounded-t border-b-2 px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none',
                tab === item.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {tab === 'info' && (
          editing ? (
            <TaskSheetEditForm
              columns={columns}
              assignableMembers={assignableMembers}
              editTitle={editTitle}
              editDesc={editDesc}
              editPriority={editPriority}
              editVisible={editVisible}
              editDeadline={editDeadline}
              editColumnId={editColumnId}
              editWorkers={editWorkers}
              isSaving={save.isPending}
              onEditTitleChange={setEditTitle}
              onEditDescChange={setEditDesc}
              onEditPriorityChange={setEditPriority}
              onEditVisibleChange={setEditVisible}
              onEditDeadlineChange={setEditDeadline}
              onEditColumnIdChange={setEditColumnId}
              onRemoveWorker={(subject) => setEditWorkers((previous) => previous.filter((entry) => entry.subject !== subject))}
              onAddWorker={(subject) => {
                const worker = assignableMembers.find((entry) => entry.userSub === subject)
                if (!worker) return

                setEditWorkers((previous) => (
                  previous.some((entry) => entry.subject === worker.userSub)
                    ? previous
                    : [...previous, { subject: worker.userSub, email: worker.email ?? getProjectMemberLabel(worker), role: 'worker' }]
                ))
              }}
              onSave={() => {
                const targetColumn = columns.find((c) => c.id === editColumnId)
                const isTargetFinal = Boolean(targetColumn && FINALIZATION_COLUMN_KEYS.has(targetColumn.key))
                const hasUnfinishedSubtasks = (task.subtasks ?? []).some((s) => !s.isCompleted)
                if (isTargetFinal && hasUnfinishedSubtasks) {
                  onError('No puedes mover la tarea a la columna final sin completar todas las subtareas')
                  return
                }
                save.mutate({
                  editTitle,
                  editDesc,
                  editPriority,
                  editVisible,
                  editDeadline,
                  editColumnId,
                  editWorkers,
                })
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <TaskSheetDetailView
              task={task}
              canEdit={canEdit}
              canBlock={canBlock}
              canUnblock={canUnblock}
              isUnblocking={isUnblocking}
              isFinalColumn={isFinalColumn}
              assignableMembers={assignableMembers}
              subtaskAssignees={subtaskAssignees}
              newSubtask={newSubtask}
              newSubtaskAssignee={newSubtaskAssignee}
              isSubtaskPending={subtaskMutate.isPending}
              onNewSubtaskChange={setNewSubtask}
              onNewSubtaskAssigneeChange={setNewSubtaskAssignee}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              onStartEditing={startEditing}
              onOpenBlock={() => setIsBlockDialogOpen(true)}
              onOpenUnblock={() => setIsUnblockDialogOpen(true)}
            />
          )
        )}

        {tab === 'comments' && (
          <TaskComments accessToken={accessToken} projectId={projectId} taskId={task.id} onError={onError} />
        )}

        {tab === 'files' && (
          <TaskFilesTab accessToken={accessToken} projectId={projectId} taskId={task.id} canUpload={canEdit} onError={onError} />
        )}
      </div>

      <BlockTaskDialog
        open={isBlockDialogOpen}
        taskTitle={task.title}
        isPending={isBlocking}
        onClose={() => setIsBlockDialogOpen(false)}
        onConfirm={(reason) => blockTask(reason)}
      />

      <UnblockTaskDialog
        open={isUnblockDialogOpen}
        taskTitle={task.title}
        blockType={task.blockType}
        blockReason={task.blockReason}
        columns={columns}
        isPending={isUnblocking}
        onClose={() => setIsUnblockDialogOpen(false)}
        onConfirm={(payload) => unblockTask({
          target_column_id: payload.targetColumnId,
          resolution_comment: payload.resolutionComment,
        })}
      />
    </>
  )
}
