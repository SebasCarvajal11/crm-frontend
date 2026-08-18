import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  History,
  Layers,
  Mail,
  MessageSquare,
  Play,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  listWorkflowsRequest,
  listCampaignsRequest,
  createWorkflowRequest,
  toggleWorkflowRequest,
  deleteWorkflowRequest,
  runWorkflowRequest,
  getExecutionsByWorkflowRequest,
  type Workflow,
  type TriggerType,
  type ActionType,
  type CreateWorkflowInput,
  type WorkflowExecution,
} from '../api/marketing-api'

interface WorkflowsManagerProps {
  accessToken: string
  preselectedCampaignId?: number | null
}

const TRIGGER_TYPES: { value: TriggerType; label: string; description: string }[] = [
  { value: 'no_contact_x_days', label: 'Sin Contacto (X días)', description: 'Se dispara si pasan X días sin interacción' },
  { value: 'scheduled_date', label: 'Fecha Programada', description: 'Se dispara en una fecha y hora específica' },
  { value: 'proposal_no_response', label: 'Propuesta sin Respuesta', description: 'Se dispara tras enviar cotización sin feedback' },
  { value: 'project_completed', label: 'Proyecto Finalizado', description: 'Se dispara al cerrar un proyecto con el cliente' },
  { value: 'manual', label: 'Disparo Manual', description: 'Activado por demanda por el equipo' },
]

const ACTION_TYPES: { value: ActionType; label: string; icon: any }[] = [
  { value: 'send_whatsapp', label: 'Mensaje WhatsApp', icon: MessageSquare },
  { value: 'send_email', label: 'Correo Electrónico', icon: Mail },
  { value: 'log_followup', label: 'Registrar Seguimiento', icon: Activity },
  { value: 'notify_admin', label: 'Notificar al Administrador', icon: Bell },
]

export function WorkflowsManager({ accessToken, preselectedCampaignId }: WorkflowsManagerProps) {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [executionHistoryWorkflow, setExecutionHistoryWorkflow] = useState<Workflow | null>(null)
  const [executionResultMsg, setExecutionResultMsg] = useState<{ success: boolean; text: string } | null>(null)

  const [formData, setFormData] = useState<CreateWorkflowInput>({
    campaignId: preselectedCampaignId || 1,
    workflowName: '',
    description: '',
    triggerType: 'no_contact_x_days',
    noContactDays: 15,
    actionType: 'send_whatsapp',
    messageTemplate: 'Hola {nombre}, te escribimos desde CIMA para dar continuidad a tu proyecto.',
    active: true,
  })

  const workflowsQuery = useQuery({
    queryKey: ['marketing', 'workflows', accessToken],
    queryFn: () => listWorkflowsRequest(accessToken),
  })

  const campaignsQuery = useQuery({
    queryKey: ['marketing', 'campaigns', accessToken],
    queryFn: () => listCampaignsRequest(accessToken),
  })

  const executionsQuery = useQuery({
    queryKey: ['marketing', 'executions', executionHistoryWorkflow?.workflowId, accessToken],
    queryFn: () => getExecutionsByWorkflowRequest(accessToken, executionHistoryWorkflow!.workflowId),
    enabled: Boolean(executionHistoryWorkflow),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateWorkflowInput) => createWorkflowRequest(accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (workflowId: number) => toggleWorkflowRequest(accessToken, workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing', 'workflows'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (workflowId: number) => deleteWorkflowRequest(accessToken, workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing', 'workflows'] })
    },
  })

  const runMutation = useMutation({
    mutationFn: (workflowId: number) => runWorkflowRequest(accessToken, workflowId),
    onSuccess: (executions: WorkflowExecution[]) => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      setExecutionResultMsg({
        success: true,
        text: `¡Automatización ejecutada exitosamente! Se procesaron ${executions.length} clientes calificados.`,
      })
      setTimeout(() => setExecutionResultMsg(null), 6000)
    },
    onError: (err: any) => {
      setExecutionResultMsg({
        success: false,
        text: `Error al ejecutar: ${err.message || 'El workflow no pudo ser procesado'}`,
      })
    },
  })

  const resetForm = () => {
    setFormData({
      campaignId: preselectedCampaignId || campaignsQuery.data?.[0]?.campaignId || 1,
      workflowName: '',
      description: '',
      triggerType: 'no_contact_x_days',
      noContactDays: 15,
      actionType: 'send_whatsapp',
      messageTemplate: 'Hola {nombre}, te escribimos desde CIMA para dar continuidad a tu proyecto.',
      active: true,
    })
  }

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const workflows = workflowsQuery.data || []
  const campaigns = campaignsQuery.data || []

  return (
    <div className="space-y-6">
      {/* ── Notificación de Ejecución ────────────────────────────────────────── */}
      {executionResultMsg && (
        <Alert variant={executionResultMsg.success ? 'default' : 'destructive'} className="animate-in fade-in">
          {executionResultMsg.success ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          <AlertTitle>{executionResultMsg.success ? 'Ejecución Completa' : 'Aviso'}</AlertTitle>
          <AlertDescription className="text-xs">{executionResultMsg.text}</AlertDescription>
        </Alert>
      )}

      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            Automatizaciones & Workflows
          </h2>
          <p className="text-xs text-muted-foreground">
            Reglas de activación automática y secuencias de contacto multicanal
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setIsCreateOpen(true)
          }}
          className="gap-2 font-semibold shadow-sm"
        >
          <Plus className="size-4" />
          Nueva Automatización
        </Button>
      </div>

      {/* ── Listado de Workflows ─────────────────────────────────────────────── */}
      {workflowsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : workflows.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <Zap className="mx-auto size-10 text-muted-foreground/50" />
            <h3 className="text-base font-bold text-foreground">No hay automatizaciones activas</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Crea flujos automáticos para reactivar clientes o enviar notificaciones según eventos clave.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm()
                setIsCreateOpen(true)
              }}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Crear Automatización
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {workflows.map((w) => {
            const campaign = campaigns.find((c) => c.campaignId === w.campaignId)
            const triggerInfo = TRIGGER_TYPES.find((t) => t.value === w.triggerType)
            const actionInfo = ACTION_TYPES.find((a) => a.value === w.actionType)
            const ActionIcon = actionInfo?.icon || MessageSquare

            return (
              <Card
                key={w.workflowId}
                className={`overflow-hidden shadow-sm hover:shadow-md transition-all border ${
                  w.active ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-muted-foreground/40 opacity-75'
                }`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground leading-tight">{w.workflowName}</h3>
                        <Badge variant={w.active ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                          {w.active ? 'Activo' : 'Pausado'}
                        </Badge>
                      </div>
                      {campaign && (
                        <p className="text-[11px] font-semibold text-primary flex items-center gap-1">
                          <Layers className="size-3" />
                          Campaña: {campaign.campaignName}
                        </p>
                      )}
                    </div>

                    {/* Interruptor Toggle y Acciones Rápidas */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMutation.mutate(w.workflowId)}
                        disabled={toggleMutation.isPending}
                        className={`text-xs px-2.5 h-7 rounded-full font-bold ${
                          w.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {w.active ? 'ON' : 'OFF'}
                      </Button>
                    </div>
                  </div>

                  {w.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{w.description}</p>
                  )}

                  {/* Disparador y Acción en Bloque Visual */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Disparador</span>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="size-3 text-primary" />
                        {triggerInfo?.label || w.triggerType}
                        {w.noContactDays ? ` (${w.noContactDays}d)` : ''}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Acción</span>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <ActionIcon className="size-3 text-primary" />
                        {actionInfo?.label || w.actionType}
                      </p>
                    </div>
                  </div>

                  {/* Plantilla de Mensaje Preview */}
                  {w.messageTemplate && (
                    <div className="rounded-md border bg-card p-2 text-[11px] text-muted-foreground italic">
                      "{w.messageTemplate}"
                    </div>
                  )}

                  {/* Barra de Acciones: Ejecutar Ahora & Historial */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExecutionHistoryWorkflow(w)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <History className="size-3.5" />
                      Historial
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (confirm(`¿Eliminar la automatización "${w.workflowName}"?`)) {
                            deleteMutation.mutate(w.workflowId)
                          }
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => runMutation.mutate(w.workflowId)}
                        disabled={!w.active || runMutation.isPending}
                        className="text-xs h-8 gap-1.5 font-bold shadow-sm"
                      >
                        <Play className="size-3 fill-current" />
                        {runMutation.isPending ? 'Ejecutando…' : 'Ejecutar Ahora'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Modal de Creación de Automatización ──────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateWorkflow} className="space-y-4">
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
                  onChange={(e) => setFormData({ ...formData, workflowName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="campaignSelect" className="text-xs font-semibold">
                  Campaña Vinculada *
                </Label>
                <select
                  id="campaignSelect"
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium"
                >
                  {campaigns.map((c) => (
                    <option key={c.campaignId} value={c.campaignId}>
                      {c.campaignName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="triggerType" className="text-xs font-semibold">
                    Disparador
                  </Label>
                  <select
                    id="triggerType"
                    value={formData.triggerType}
                    onChange={(e) => setFormData({ ...formData, triggerType: e.target.value as TriggerType })}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium"
                  >
                    {TRIGGER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="actionType" className="text-xs font-semibold">
                    Acción a Ejecutar
                  </Label>
                  <select
                    id="actionType"
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value as ActionType })}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium"
                  >
                    {ACTION_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
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
                    onChange={(e) => setFormData({ ...formData, noContactDays: Number(e.target.value) })}
                    className="mt-1 text-xs"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="msgTemplate" className="text-xs font-semibold">
                  Plantilla de Mensaje
                </Label>
                <textarea
                  id="msgTemplate"
                  rows={3}
                  value={formData.messageTemplate || ''}
                  onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                  placeholder="Usa {nombre} y {workflow} para personalización automática…"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Variables disponibles: <code className="font-bold">{'{nombre}'}</code>, <code className="font-bold">{'{workflow}'}</code>
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={createMutation.isPending} className="font-semibold">
                {createMutation.isPending ? 'Guardando…' : 'Crear Flujo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal de Historial de Ejecuciones ────────────────────────────────── */}
      <Dialog
        open={executionHistoryWorkflow !== null}
        onOpenChange={(open) => {
          if (!open) setExecutionHistoryWorkflow(null)
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase flex items-center gap-2">
              <History className="size-4 text-primary" />
              Historial: {executionHistoryWorkflow?.workflowName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registro de mensajes y acciones ejecutadas para clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {executionsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (executionsQuery.data || []).length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Este flujo aún no registra ejecuciones históricas.
              </p>
            ) : (
              <div className="divide-y text-xs">
                {(executionsQuery.data || []).map((ex) => (
                  <div key={ex.executionId} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Cliente ID: {ex.clientId || 'Global'}</span>
                      <Badge
                        variant={ex.result === 'success' ? 'default' : 'destructive'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {ex.result}
                      </Badge>
                    </div>
                    {ex.sentMessage && (
                      <p className="text-muted-foreground italic text-[11px] bg-muted/30 p-1.5 rounded">
                        "{ex.sentMessage}"
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {new Date(ex.executedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button size="sm" onClick={() => setExecutionHistoryWorkflow(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
