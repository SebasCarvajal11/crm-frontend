import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { UserChip } from '@/components/molecules/user-chip'
import { getProjectMemberLabel } from '@/features/collab/lib/member-display'
import type { ProjectMember, ProjectTask, ProjectTaskColumn } from '@/features/collab/model'
import type { ClientSearchResult } from '@/shared/types'

type Props = {
  columns: ProjectTaskColumn[]
  assignableMembers: ProjectMember[]
  editTitle: string
  editDesc: string
  editPriority: ProjectTask['priority']
  editVisible: boolean
  editDeadline: string
  editColumnId: string
  editWorkers: ClientSearchResult[]
  isSaving: boolean
  onEditTitleChange: (value: string) => void
  onEditDescChange: (value: string) => void
  onEditPriorityChange: (value: ProjectTask['priority']) => void
  onEditVisibleChange: (value: boolean) => void
  onEditDeadlineChange: (value: string) => void
  onEditColumnIdChange: (value: string) => void
  onRemoveWorker: (subject: string) => void
  onAddWorker: (subject: string) => void
  onSave: () => void
  onCancel: () => void
}

export function TaskSheetEditForm({
  columns,
  assignableMembers,
  editTitle,
  editDesc,
  editPriority,
  editVisible,
  editDeadline,
  editColumnId,
  editWorkers,
  isSaving,
  onEditTitleChange,
  onEditDescChange,
  onEditPriorityChange,
  onEditVisibleChange,
  onEditDeadlineChange,
  onEditColumnIdChange,
  onRemoveWorker,
  onAddWorker,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="et-title" className="text-xs font-medium">Titulo <span className="text-destructive">*</span></Label>
        <Input id="et-title" value={editTitle} onChange={(event) => onEditTitleChange(event.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="et-desc" className="text-xs font-medium">Descripcion</Label>
        <Textarea id="et-desc" value={editDesc} onChange={(event) => onEditDescChange(event.target.value)} className="min-h-[100px] resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="et-col" className="text-xs font-medium">Columna</Label>
          <Select value={editColumnId} onValueChange={onEditColumnIdChange}>
            <SelectTrigger id="et-col"><SelectValue /></SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column.id} value={column.id}>{column.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="et-pri" className="text-xs font-medium">Prioridad</Label>
          <Select value={editPriority} onValueChange={(value) => onEditPriorityChange(value as ProjectTask['priority'])}>
            <SelectTrigger id="et-pri"><SelectValue /></SelectTrigger>
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
        <Label htmlFor="et-dead" className="text-xs font-medium">Fecha limite</Label>
        <Input id="et-dead" type="date" value={editDeadline} onChange={(event) => onEditDeadlineChange(event.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Trabajadores asignados</Label>
        <p className="text-[11px] text-muted-foreground">Solo puedes asignar trabajadores del proyecto.</p>
        {editWorkers.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1.5">
            {editWorkers.map((worker) => (
              <UserChip key={worker.subject} email={worker.email} onRemove={() => onRemoveWorker(worker.subject)} />
            ))}
          </div>
        )}

        {assignableMembers.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
            <Lock className="size-3.5 shrink-0" />
            <span>Este proyecto no tiene trabajadores disponibles.</span>
          </div>
        ) : (
          <Select value="none" onValueChange={(value) => {
            if (value !== 'none') onAddWorker(value)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona trabajador del proyecto..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Seleccionar...</SelectItem>
              {assignableMembers
                .filter((member) => !editWorkers.some((worker) => worker.subject === member.userSub))
                .map((member) => (
                  <SelectItem key={member.userSub} value={member.userSub}>
                    {getProjectMemberLabel(member)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
        <input
          type="checkbox"
          className="size-4 rounded accent-primary"
          checked={editVisible}
          onChange={(event) => onEditVisibleChange(event.target.checked)}
        />
        <div>
          <p className="text-sm font-medium">Visible para el cliente</p>
          <p className="text-xs text-muted-foreground">El cliente podra ver esta tarea</p>
        </div>
      </label>

      <Separator />
      <div className="flex gap-2">
        <Button className="flex-1" disabled={editTitle.trim().length < 2 || isSaving} onClick={onSave}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  )
}
