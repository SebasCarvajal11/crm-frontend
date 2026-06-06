import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  accessToken,
  projectId,
  column,
  tasksByColumn,
  identity,
  members,
  open,
  onClose,
  onCreated,
  onError,
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
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDeadline('')
    setClientVis(false)
    setSelectedWorkerSubs([])
    setSubtasks([])
    setNewSubtask('')
    setNewSubtaskAssignee('none')
    onClose()
  }

  const { createTask, workerMembers, selectedWorkers, columnId, getProjectMemberLabel } = useCreateTask({
    accessToken,
    projectId,
    column,
    tasksByColumn,
    members,
    selectedWorkerSubs,
    title,
    description,
    priority,
    deadline,
    clientVis,
    subtasks,
    onCreated,
    onError,
    handleClose,
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
          <DialogDescription>
            {column ? `Completa los datos para crear la tarea en ${column.title}.` : 'Completa los datos para crear la tarea en el tablero.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ct-title">Titulo <span className="text-destructive">*</span></Label>
            <Input id="ct-title" placeholder="Describe brevemente la tarea" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Columna</Label>
              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                {column?.title ?? 'Sin columna'}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ct-pri">Prioridad</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as ProjectTask['priority'])}>
                <SelectTrigger id="ct-pri"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ct-desc">Descripcion</Label>
            <Textarea id="ct-desc" placeholder="Detalla que hay que hacer..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] resize-none" />
          </div>

          {canAssign && (
            <div className="space-y-1.5">
              <Label>Trabajadores asignados</Label>
              {selectedWorkers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {selectedWorkers.map((worker) => (
                    <UserChip
                      key={worker.userSub}
                      email={getProjectMemberLabel(worker)}
                      onRemove={() => {
                        setSelectedWorkerSubs((prev) => prev.filter((sub) => sub !== worker.userSub))
                        setSubtasks((prev) => prev.map((subtask) => subtask.assignee_sub === worker.userSub ? { ...subtask, assignee_sub: null } : subtask))
                      }}
                    />
                  ))}
                </div>
              )}

              {workerMembers.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5 shrink-0" />
                  <span>Este proyecto no tiene trabajadores disponibles.</span>
                </div>
              ) : (
                <Select value="none" onValueChange={(value) => {
                  if (value === 'none') return
                  setSelectedWorkerSubs((prev) => (prev.includes(value) ? prev : [...prev, value]))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un trabajador del proyecto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seleccionar...</SelectItem>
                    {workerMembers
                      .filter((worker) => !selectedWorkerSubs.includes(worker.userSub))
                      .map((worker) => (
                        <SelectItem key={worker.userSub} value={worker.userSub}>{getProjectMemberLabel(worker)}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="ct-dead">Fecha limite</Label>
              <Input id="ct-dead" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-lg border hover:bg-muted/50 transition-colors">
              <input type="checkbox" className="rounded accent-primary size-4" checked={clientVis} onChange={(e) => setClientVis(e.target.checked)} />
              <p className="text-xs font-medium">Visible al cliente</p>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createTask.isPending}>Cancelar</Button>
          <Button disabled={!canSubmit || createTask.isPending} onClick={() => createTask.mutate()}>
            {createTask.isPending ? 'Creando...' : 'Crear tarea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}




