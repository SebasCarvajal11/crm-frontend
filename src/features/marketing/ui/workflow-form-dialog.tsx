import type { FormEvent } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
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
      <DialogContent size="lg">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogMedia variant="default">
              <Zap className="size-5" />
            </DialogMedia>
            <div className="flex flex-col gap-1 text-left min-w-0">
              <DialogTitle>
                Nueva Automatización
              </DialogTitle>
              <DialogDescription>
                Configura el disparador, la acción y la plantilla de mensaje
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="wfName" className="text-xs font-medium text-foreground/90">
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
                className="h-9 rounded-xl border-border/70 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaignSelect" className="text-xs font-medium text-foreground/90">
                Campaña Vinculada *
              </Label>
              <NativeSelect
                id="campaignSelect"
                value={formData.campaignId}
                onChange={(e) =>
                  onFormDataChange({ ...formData, campaignId: Number(e.target.value) })
                }
                className="rounded-xl border-border/70 text-xs"
              >
                {campaigns.map((c) => (
                  <option key={c.campaignId} value={c.campaignId}>
                    {c.campaignName}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="triggerType" className="text-xs font-medium text-foreground/90">
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
                  className="rounded-xl border-border/70 text-xs"
                >
                  {TRIGGER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="actionType" className="text-xs font-medium text-foreground/90">
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
                  className="rounded-xl border-border/70 text-xs"
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
              <div className="space-y-1.5">
                <Label htmlFor="noContactDays" className="text-xs font-medium text-foreground/90">
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
                  className="h-9 rounded-xl border-border/70 text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="msgTemplate" className="text-xs font-medium text-foreground/90">
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
                className="min-h-24 resize-y rounded-xl border-border/70 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Variables disponibles: <code className="font-semibold">{'{nombre}'}</code>,{' '}
                <code className="font-semibold">{'{workflow}'}</code>
              </p>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="rounded-xl text-xs font-medium shadow-xs"
            >
              {isPending ? 'Guardando…' : 'Crear Flujo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
