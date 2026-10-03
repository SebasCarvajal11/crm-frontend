import { useState } from 'react'
import { ListTodo, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogBody,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { UserChip } from '@/components/molecules/user-chip'
import { useCreateTask } from '@/features/collab/hooks'
import type { ProjectMember, ProjectTask, ProjectTaskColumn } from '@/features/collab/model'
import type { MeResponse } from '@/shared/types'
import { CreateTaskSubtasksEditor } from './create-task-subtasks-editor'
import type { TaskSubtaskDraft } from './task-subtask-utils'

type Props = {
  accessToken: string
  projectId: string
  column: ProjectTaskColumn | null
  tasksByColumn: Record<string, ProjectTask[]>
  identity: MeResponse['data']
  members: ProjectMember[]
  open: boolean
  onClose: () => void
  onCreated: () => void
  onError: (msg: string) => void
}

export function CreateTaskModal({
  accessToken, projectId, column, tasksByColumn, identity,
  members, open, onClose, onCreated, onError,
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<ProjectTask['priority']>('medium')
  const [deadline, setDeadline] = useState('')
  const [clientVis, setClientVis] = useState(false)
  const [selectedWorkerSubs, setSelectedWorkerSubs] = useState<string[]>([])
  const [subtasks, setSubtasks] = useState<TaskSubtaskDraft[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState<string>('none')

  const canAssign = identity.role === 'admin' || identity.role === 'worker'

  const handleClose = () => {
    setTitle(''); setDescription(''); setPriority('medium'); setDeadline('')
    setClientVis(false); setSelectedWorkerSubs([]); setSubtasks([]); setNewSubtask('')
    setNewSubtaskAssignee('none'); onClose()
  }

  const { createTask, workerMembers, selectedWorkers, columnId, getProjectMemberLabel } = useCreateTask({
    accessToken, projectId, column, tasksByColumn, members,
    selectedWorkerSubs, title, description, priority, deadline,
    clientVis, subtasks, onCreated, onError, handleClose,
  })

  const canSubmit = title.trim().length >= 2 && !!columnId

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    setSubtasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newSubtask.trim(),
        is_completed: false,
        assignee_sub: newSubtaskAssignee === 'none' ? null : newSubtaskAssignee,
      },
    ])
    setNewSubtask('')
    setNewSubtaskAssignee('none')
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose() }}>
      <DialogContent size="xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogMedia variant="default">
              <ListTodo className="size-5" />
            </DialogMedia>
            <div>
              <DialogTitle>Nueva tarea</DialogTitle>
              <DialogDescription>
                {column
                  ? `Completa los datos para crear la tarea en ${column.title}.`
                  : 'Completa los datos para crear la tarea en el tablero.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          id="create-task-form"
          className="flex flex-col flex-1 min-h-0"
          onSubmit={(event) => {
            event.preventDefault()
            createTask.mutate()
          }}
        >
          <DialogBody className="space-y-4 max-h-[65vh]">
          <div className="space-y-1.5">
            <Label htmlFor="ct-title" className="text-xs font-semibold text-foreground/90">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ct-title"
              placeholder="Describe brevemente la tarea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 rounded-lg border-border/70 focus-visible:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/90">Columna de destino</Label>
              <div
                className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground"
              >
                {column?.title ?? 'Sin columna'}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ct-pri" className="text-xs font-semibold text-foreground/90">Prioridad</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as ProjectTask['priority'])}>
                <SelectTrigger id="ct-pri" className="h-9 rounded-lg border-border/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs">Baja</SelectItem>
                  <SelectItem value="medium" className="text-xs">Media</SelectItem>
                  <SelectItem value="high" className="text-xs">Alta</SelectItem>
                  <SelectItem value="urgent" className="text-xs font-semibold text-rose-600">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ct-desc" className="text-xs font-semibold text-foreground/90">Descripción</Label>
            <Textarea
              id="ct-desc"
              placeholder="Detalla qué hay que hacer, requisitos y contexto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] rounded-lg border-border/70 text-xs resize-none focus-visible:ring-primary/20"
            />
          </div>

          {canAssign && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/90">Trabajadores asignados</Label>
              {selectedWorkers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {selectedWorkers.map((worker) => (
                    <UserChip
                      key={worker.userSub}
                      email={getProjectMemberLabel(worker)}
                      onRemove={() => {
                        setSelectedWorkerSubs((prev) => prev.filter((sub) => sub !== worker.userSub))
                        setSubtasks((prev) =>
                          prev.map((subtask) =>
                            subtask.assignee_sub === worker.userSub ? { ...subtask, assignee_sub: null } : subtask,
                          ),
                        )
                      }}
                    />
                  ))}
                </div>
              )}

              {workerMembers.length === 0 ? (
                <div
                  className={
                    'flex items-center gap-2 rounded-lg border border-dashed border-border/70 ' +
                    'px-3 py-2.5 text-xs text-muted-foreground bg-muted/20'
                  }
                >
                  <Lock className="size-3.5 shrink-0" />
                  <span>Este proyecto no tiene trabajadores disponibles.</span>
                </div>
              ) : (
                <Select
                  value="none"
                  onValueChange={(value) => {
                    if (value === 'none') return
                    setSelectedWorkerSubs((prev) => (prev.includes(value) ? prev : [...prev, value]))
                  }}
                >
                  <SelectTrigger className="h-9 rounded-lg border-border/70 text-xs">
                    <SelectValue placeholder="Selecciona un trabajador del proyecto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">Seleccionar...</SelectItem>
                    {workerMembers
                      .filter((worker) => !selectedWorkerSubs.includes(worker.userSub))
                      .map((worker) => (
                        <SelectItem key={worker.userSub} value={worker.userSub} className="text-xs">
                          {getProjectMemberLabel(worker)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ct-dead" className="text-xs font-semibold text-foreground/90">Fecha límite</Label>
              <Input
                id="ct-dead"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-9 rounded-lg border-border/70 text-xs"
              />
            </div>
            <label
              className={
                'flex items-center gap-2.5 cursor-pointer select-none px-3 py-2 rounded-lg ' +
                'border border-border/70 hover:bg-muted/40 transition-colors bg-muted/10 h-9'
              }
            >
              <input
                type="checkbox"
                className="rounded accent-primary size-4"
                checked={clientVis}
                onChange={(e) => setClientVis(e.target.checked)}
              />
              <span className="text-xs font-medium text-foreground">Visible para el cliente</span>
            </label>
          </div>

          <CreateTaskSubtasksEditor
            canAssign={canAssign}
            workerMembers={workerMembers}
            selectedWorkers={selectedWorkers}
            subtasks={subtasks}
            newSubtask={newSubtask}
            newSubtaskAssignee={newSubtaskAssignee}
            onNewSubtaskChange={setNewSubtask}
            onNewSubtaskAssigneeChange={setNewSubtaskAssignee}
            onAddSubtask={handleAddSubtask}
            onRemoveSubtask={(subtaskId) => setSubtasks((prev) => prev.filter((entry) => entry.id !== subtaskId))}
          />
          </DialogBody>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={createTask.isPending}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            form="create-task-form"
            disabled={!canSubmit || createTask.isPending}
            className="text-xs font-semibold shadow-2xs"
          >
            {createTask.isPending ? 'Creando...' : 'Crear tarea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
