import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Layers, Plus, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
  type CreateWorkflowInput,
} from '../api/marketing-api'
import { WorkflowCard } from './workflow-card'
import { WorkflowFormDialog } from './workflow-form-dialog'
import { WorkflowExecutionsDialog } from './workflow-executions-dialog'

interface WorkflowsManagerProps {
  accessToken: string
  preselectedCampaignId?: number | null
}

const INITIAL_FORM_DATA: CreateWorkflowInput = {
  campaignId: 1,
  workflowName: '',
  description: '',
  triggerType: 'no_contact_x_days',
  noContactDays: 15,
  actionType: 'send_whatsapp',
  messageTemplate: 'Hola {nombre}, te recordamos que tienes una propuesta pendiente en CIMA.',
  active: true,
}

export function WorkflowsManager({
  accessToken,
  preselectedCampaignId,
}: WorkflowsManagerProps) {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [executionHistoryWorkflow, setExecutionHistoryWorkflow] = useState<Workflow | null>(null)
  const [executionResultMsg, setExecutionResultMsg] = useState<{
    success: boolean
    text: string
  } | null>(null)

  const [formData, setFormData] = useState<CreateWorkflowInput>({
    ...INITIAL_FORM_DATA,
    campaignId: preselectedCampaignId || 1,
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
    queryKey: ['marketing', 'executions', executionHistoryWorkflow?.workflowId],
    queryFn: () =>
      executionHistoryWorkflow
        ? getExecutionsByWorkflowRequest(accessToken, executionHistoryWorkflow.workflowId)
        : Promise.resolve([]),
    enabled: !!executionHistoryWorkflow,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateWorkflowInput) => createWorkflowRequest(accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      setIsCreateOpen(false)
      setFormData({
        ...INITIAL_FORM_DATA,
        campaignId: preselectedCampaignId || 1,
      })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => toggleWorkflowRequest(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWorkflowRequest(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
    },
  })

  const runMutation = useMutation({
    mutationFn: (id: number) => runWorkflowRequest(accessToken, id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      setExecutionResultMsg({
        success: true,
        text: `Flujo ejecutado: ${res.length} acciones realizadas para clientes coincidentes.`,
      })
      setTimeout(() => setExecutionResultMsg(null), 6000)
    },
    onError: () => {
      setExecutionResultMsg({
        success: false,
        text: 'Error al ejecutar el flujo. Verifica la conectividad.',
      })
      setTimeout(() => setExecutionResultMsg(null), 6000)
    },
  })

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const workflows = workflowsQuery.data || []
  const campaigns = campaignsQuery.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            Flujos Automatizados
          </h2>
          <p className="text-xs text-muted-foreground">
            Disparadores automáticos por inactividad, eventos de cliente y notificaciones
          </p>
        </div>

        <Button
          data-tour="marketing-new-workflow-btn"
          onClick={() => {
            setFormData({
              ...INITIAL_FORM_DATA,
              campaignId: preselectedCampaignId || (campaigns[0]?.campaignId ?? 1),
            })
            setIsCreateOpen(true)
          }}
          className="gap-2 font-semibold shadow-sm"
        >
          <Plus className="size-4" />
          Nueva Automatización
        </Button>
      </div>

      {executionResultMsg && (
        <Alert
          variant={executionResultMsg.success ? 'default' : 'destructive'}
          className="border-l-4"
        >
          {executionResultMsg.success ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          <AlertTitle className="text-xs font-bold">
            {executionResultMsg.success ? 'Ejecución Completa' : 'Aviso de Ejecución'}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {executionResultMsg.text}
          </AlertDescription>
        </Alert>
      )}

      {workflowsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : workflowsQuery.isError ? (
        <Card className="border-destructive/30 bg-destructive/5 text-center p-6">
          <p className="text-sm font-semibold text-destructive">
            Error al consultar las reglas de automatización.
          </p>
        </Card>
      ) : workflows.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <CardContent className="space-y-3">
            <Layers className="mx-auto size-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">
              No tienes flujos de marketing configurados.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData({
                  ...INITIAL_FORM_DATA,
                  campaignId: preselectedCampaignId || (campaigns[0]?.campaignId ?? 1),
                })
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
            return (
              <WorkflowCard
                key={w.workflowId}
                workflow={w}
                campaignName={campaign?.campaignName}
                isToggling={toggleMutation.isPending}
                isRunning={runMutation.isPending}
                onToggle={(id) => toggleMutation.mutate(id)}
                onDelete={(id, name) => {
                  if (confirm(`¿Eliminar la automatización "${name}"?`)) {
                    deleteMutation.mutate(id)
                  }
                }}
                onRun={(id) => runMutation.mutate(id)}
                onViewHistory={(wf) => setExecutionHistoryWorkflow(wf)}
              />
            )
          })}
        </div>
      )}

      <WorkflowFormDialog
        open={isCreateOpen}
        formData={formData}
        campaigns={campaigns}
        isPending={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onFormDataChange={setFormData}
        onSubmit={handleCreateWorkflow}
      />

      <WorkflowExecutionsDialog
        workflow={executionHistoryWorkflow}
        executions={executionsQuery.data || []}
        isLoading={executionsQuery.isLoading}
        onClose={() => setExecutionHistoryWorkflow(null)}
      />
    </div>
  )
}
