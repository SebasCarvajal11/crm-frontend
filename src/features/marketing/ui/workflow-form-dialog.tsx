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
import type { MarketingClient } from '../api/clients-api'
import type { MessageTemplate } from '../api/templates-api'
import { TRIGGER_TYPES, ACTION_TYPES } from './workflow.constants'
import { TemplatePreviewPanel } from './template-preview-panel'
import { channelForAction, channelLabel, templatesForAction } from './templates.utils'

interface WorkflowFormDialogProps {
  open: boolean
  formData: CreateWorkflowInput
  campaigns: Campaign[]
  /** Biblioteca de plantillas; se ofrecen solo las activas del canal de la acción. */
  templates?: MessageTemplate[]
  accessToken?: string
  clients?: MarketingClient[]
  isPending: boolean
  onClose: () => void
  onFormDataChange: (data: CreateWorkflowInput) => void
  onSubmit: (e: FormEvent) => void
}

export function WorkflowFormDialog({
  open,
  formData,
  campaigns,
  templates = [],
  accessToken,
  clients = [],
  isPending,
  onClose,
  onFormDataChange,
  onSubmit,
}: WorkflowFormDialogProps) {
  const disponibles = templatesForAction(templates, formData.actionType)
  const canal = channelForAction(formData.actionType)
  const seleccionada = disponibles.find((t) => t.templateId === formData.templateId) ?? null

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
                  onChange={(e) => {
                    const actionType = e.target.value as ActionType
                    // Una plantilla de otro canal deja de servir al cambiar la acción.
                    const sigueValida = templatesForAction(templates, actionType).some(
                      (t) => t.templateId === formData.templateId
                    )
                    onFormDataChange({
                      ...formData,
                      actionType,
                      templateId: sigueValida ? formData.templateId : null,
                    })
                  }}
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

            <div className="space-y-1.5" data-tour="marketing-workflow-template-select">
              <Label htmlFor="wfTemplateId" className="text-xs font-medium text-foreground/90">
                Plantilla de la biblioteca (opcional)
              </Label>
              <NativeSelect
                id="wfTemplateId"
                value={seleccionada?.templateId ?? ''}
                onChange={(e) =>
                  onFormDataChange({ ...formData, templateId: e.target.value || null })
                }
                className="rounded-xl border-border/70 text-xs"
              >
                <option value="">Sin plantilla: usar el mensaje de abajo</option>
                {disponibles.map((t) => (
                  <option key={t.templateId} value={t.templateId}>
                    {t.name}
                    {t.plan ? ` · ${t.plan}` : ''}
                  </option>
                ))}
              </NativeSelect>
              <p className="text-[10px] text-muted-foreground">
                {disponibles.length === 0
                  ? `No hay plantillas activas del canal ${channelLabel(canal)}. Créelas en la pestaña Plantillas.`
                  : `Se muestran las plantillas activas del canal ${channelLabel(canal)}.`}
              </p>
              {seleccionada && accessToken && (
                <TemplatePreviewPanel
                  key={seleccionada.templateId}
                  accessToken={accessToken}
                  templateId={seleccionada.templateId}
                  clients={clients}
                  showSubject={seleccionada.channel === 'EMAIL'}
                  idPrefix="wf-template-preview"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="msgTemplate" className="text-xs font-medium text-foreground/90">
                {seleccionada ? 'Mensaje de respaldo' : 'Plantilla de Mensaje'}
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
                {seleccionada
                  ? 'Se usa si la plantilla elegida se desactiva. '
                  : ''}
                Variables disponibles: <code className="font-semibold">{'{nombre}'}</code>,{' '}
                <code className="font-semibold">{'{plan}'}</code>,{' '}
                <code className="font-semibold">{'{empresa}'}</code>,{' '}
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
