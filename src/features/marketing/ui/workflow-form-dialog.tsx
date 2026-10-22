import type { FormEvent } from 'react'
import { AlertTriangle, Users, Zap } from 'lucide-react'
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
import { audienceReach, campaignRunsToday } from './audience.utils'
import {
  DEFAULT_DAYS,
  actionMeta,
  actionUsesTemplate,
  fromDateTimeLocal,
  toDateTimeLocal,
  triggerMeta,
  triggerUsesDays,
  triggerUsesSchedule,
  validateWorkflowForm,
} from './workflow.utils'

function Help({ children, id }: { children: string; id?: string }) {
  return (
    <p id={id} className="text-[11px] leading-snug text-muted-foreground">
      {children}
    </p>
  )
}

interface WorkflowFormDialogProps {
  open: boolean
  formData: CreateWorkflowInput
  campaigns: Campaign[]
  /** Biblioteca de plantillas; se ofrecen solo las activas del canal de la acción. */
  templates?: MessageTemplate[]
  accessToken?: string
  clients?: MarketingClient[]
  isPending: boolean
  /** Error del servidor al crear (p. ej. 400). */
  error?: string | null
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
  error,
  onClose,
  onFormDataChange,
  onSubmit,
}: WorkflowFormDialogProps) {
  const errors = validateWorkflowForm(formData)

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
                Elige la campaña (a quién le llega), el disparador (cuándo) y la acción (qué hace)
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-3.5 text-xs">
            <WorkflowFormFields
              formData={formData}
              campaigns={campaigns}
              templates={templates}
              accessToken={accessToken}
              clients={clients}
              error={error}
              onFormDataChange={onFormDataChange}
            />
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || Object.keys(errors).length > 0}
              title={Object.values(errors)[0]}
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

export interface WorkflowFormFieldsProps {
  formData: CreateWorkflowInput
  campaigns: Campaign[]
  templates?: MessageTemplate[]
  accessToken?: string
  clients?: MarketingClient[]
  error?: string | null
  onFormDataChange: (data: CreateWorkflowInput) => void
}

/** Campos del formulario de automatización (exportados para probarlos sin el diálogo). */
export function WorkflowFormFields({
  formData,
  campaigns,
  templates = [],
  accessToken,
  clients = [],
  error,
  onFormDataChange,
}: WorkflowFormFieldsProps) {
  const disponibles = templatesForAction(templates, formData.actionType)
  const canal = channelForAction(formData.actionType)
  const seleccionada = disponibles.find((t) => t.templateId === formData.templateId) ?? null
  const campaign = campaigns.find((c) => c.campaignId === formData.campaignId) ?? null
  const runs = campaign ? campaignRunsToday(campaign) : null
  const clientName = (id?: string | null) => {
    const c = id ? clients.find((cl) => cl.clientId === id) : undefined
    return c ? c.additionalInfo || c.contactInfo || null : null
  }
  const errors = validateWorkflowForm(formData)
  const usaPlantilla = actionUsesTemplate(formData.actionType)

  return (
    <>
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
        {campaign && (
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80" data-testid="workflow-audience">
            <Users className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Le llegará a: {audienceReach(campaign, clientName(campaign.clientId))}
          </p>
        )}
        {runs && !runs.ok && (
          <p
            className="flex items-start gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-800 dark:text-amber-300"
            role="status"
            data-testid="workflow-campaign-warning"
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {runs.reason}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="triggerType" className="text-xs font-medium text-foreground/90">
            Disparador
          </Label>
          <NativeSelect
            id="triggerType"
            value={formData.triggerType}
            onChange={(e) => {
              const triggerType = e.target.value as TriggerType
              onFormDataChange({
                ...formData,
                triggerType,
                noContactDays: triggerUsesDays(triggerType) ? formData.noContactDays || DEFAULT_DAYS : null,
                scheduledAt: triggerUsesSchedule(triggerType) ? formData.scheduledAt ?? null : null,
              })
            }}
            aria-describedby="triggerType-help"
            className="rounded-xl border-border/70 text-xs"
          >
            {TRIGGER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </NativeSelect>
          <Help id="triggerType-help">{triggerMeta(formData.triggerType)?.help ?? ''}</Help>
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
            aria-describedby="actionType-help"
            className="rounded-xl border-border/70 text-xs"
          >
            {ACTION_TYPES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </NativeSelect>
          <Help id="actionType-help">{actionMeta(formData.actionType)?.help ?? ''}</Help>
        </div>
      </div>

      {triggerUsesSchedule(formData.triggerType) && (
        <div className="space-y-1.5">
          <Label htmlFor="scheduledAt" className="text-xs font-medium text-foreground/90">
            Fecha y hora de envío *
          </Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            required
            value={toDateTimeLocal(formData.scheduledAt)}
            onChange={(e) => onFormDataChange({ ...formData, scheduledAt: fromDateTimeLocal(e.target.value) })}
            aria-invalid={errors.scheduledAt ? true : undefined}
            className="h-9 rounded-xl border-border/70 text-xs"
          />
          <Help>Se envía una vez cuando llegue esa fecha y hora (hora de Colombia).</Help>
        </div>
      )}

      {triggerUsesDays(formData.triggerType) && (
        <div className="space-y-1.5">
          <Label htmlFor="noContactDays" className="text-xs font-medium text-foreground/90">
            {formData.triggerType === 'proposal_no_response'
              ? 'Días sin respuesta a la propuesta (X)'
              : 'Días sin contacto (X)'}
          </Label>
          <Input
            id="noContactDays"
            type="number"
            min={1}
            max={365}
            value={formData.noContactDays ?? DEFAULT_DAYS}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                noContactDays: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            aria-invalid={errors.noContactDays ? true : undefined}
            className="h-9 rounded-xl border-border/70 text-xs"
          />
          <Help>Se repite como máximo una vez cada X días por cliente.</Help>
        </div>
      )}

      {usaPlantilla && (
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
      )}

      <div className="space-y-1.5">
        <Label htmlFor="msgTemplate" className="text-xs font-medium text-foreground/90">
          {seleccionada
            ? 'Mensaje de respaldo'
            : formData.actionType === 'log_followup'
              ? 'Nota del seguimiento'
              : formData.actionType === 'notify_admin'
                ? 'Mensaje de la alerta'
                : 'Mensaje'}
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
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
