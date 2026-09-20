import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type {
  Campaign,
  TriggerType,
  ActionType,
  CreateWorkflowInput,
} from '../api/marketing-api'
import { TRIGGER_TYPES, ACTION_TYPES } from './workflow.constants'

interface WorkflowFormDialogProps {
  open: boolean
  formData: CreateWorkflowInput
  campaigns: Campaign[]
  isPending: boolean
  onClose: () => void
  onFormDataChange: (data: CreateWorkflowInput) => void
  onSubmit: (e: FormEvent) => void
}

export function WorkflowFormDialog({
  open,
  formData,
  campaigns,
  isPending,
  onClose,
  onFormDataChange,
  onSubmit,
}: WorkflowFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-foreground">
              Nueva Automatización
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configura el disparador, la acción y la plantilla de mensaje
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <Label htmlFor="wfName" className="text-xs font-semibold">
                Nombre del Flujo *
              </Label>
              <Input
                id="wfName"
                required
                placeholder="Ej. Recordatorio de propuesta 7 días"
                value={formData.workflowName}
                onChange={(e) =>
                  onFormDataChange({ ...formData, workflowName: e.target.value })
                }
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="campaignSelect" className="text-xs font-semibold">
                Campaña Vinculada *
              </Label>
              <NativeSelect
                id="campaignSelect"
                value={formData.campaignId}
                onChange={(e) =>
                  onFormDataChange({ ...formData, campaignId: Number(e.target.value) })
                }
              >
                {campaigns.map((c) => (
                  <option key={c.campaignId} value={c.campaignId}>
                    {c.campaignName}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="triggerType" className="text-xs font-semibold">
                  Disparador
                </Label>
                <NativeSelect
                  id="triggerType"
                  value={formData.triggerType}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      triggerType: e.target.value as TriggerType,
                    })
                  }
                >
                  {TRIGGER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div>
                <Label htmlFor="actionType" className="text-xs font-semibold">
                  Acción a Ejecutar
                </Label>
                <NativeSelect
                  id="actionType"
                  value={formData.actionType}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      actionType: e.target.value as ActionType,
                    })
                  }
                >
                  {ACTION_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            {formData.triggerType === 'no_contact_x_days' && (
              <div>
                <Label htmlFor="noContactDays" className="text-xs font-semibold">
                  Días sin contacto antes de disparar
                </Label>
                <Input
                  id="noContactDays"
                  type="number"
                  min={1}
                  max={180}
                  value={formData.noContactDays || 15}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      noContactDays: Number(e.target.value),
                    })
                  }
                  className="mt-1 text-xs"
                />
              </div>
            )}

            <div>
              <Label htmlFor="msgTemplate" className="text-xs font-semibold">
                Plantilla de Mensaje
              </Label>
              <Textarea
                id="msgTemplate"
                rows={3}
                value={formData.messageTemplate || ''}
                onChange={(e) =>
                  onFormDataChange({ ...formData, messageTemplate: e.target.value })
                }
                placeholder="Usa {nombre} y {workflow} para personalización automática…"
                className="mt-1 min-h-24 resize-y text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Variables disponibles: <code className="font-bold">{'{nombre}'}</code>,{' '}
                <code className="font-bold">{'{workflow}'}</code>
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="font-semibold"
            >
              {isPending ? 'Guardando…' : 'Crear Flujo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
