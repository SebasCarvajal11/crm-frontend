import { useMemo, useState } from 'react'
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
  runWorkflowNowRequest,
  previewWorkflowRequest,
  getExecutionsByWorkflowRequest,
  type Workflow,
  type CreateWorkflowInput,
  type WorkflowRunNowResult,
} from '../api/marketing-api'
import { parseApiError } from '@/shared/lib/parse-api-error'
import { workflowPayload } from './workflow.utils'
import { RunNowConfirmDialog, RunNowResultDialog, WorkflowPreviewDialog } from './workflow-run-dialogs'
import { listClientsRequest } from '../api/clients-api'
import { getEmailQuotaRequest } from '../api/notifications-api'
import { listTemplatesRequest } from '../api/templates-api'
import { EmailQuotaCard } from './email-quota-card'
import { TestEmailDialog } from './TestEmailDialog'
import { clientLabel } from './client-plans.constants'
import { WorkflowCard } from './workflow-card'
import { WorkflowFormDialog } from './workflow-form-dialog'
import { WorkflowExecutionsDialog } from './workflow-executions-dialog'
import { WorkflowStepsStrip } from './workflow-steps-strip'

interface WorkflowsManagerProps {
  accessToken: string
  preselectedCampaignId?: number | null
  /** El correo de prueba es solo para admin. */
  isAdmin?: boolean
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
  isAdmin = false,
}: WorkflowsManagerProps) {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [executionHistoryWorkflow, setExecutionHistoryWorkflow] = useState<Workflow | null>(null)
  const [executionResultMsg, setExecutionResultMsg] = useState<{
    success: boolean
    text: string
  } | null>(null)
  const [previewWorkflow, setPreviewWorkflow] = useState<Workflow | null>(null)
  const [confirmRun, setConfirmRun] = useState<Workflow | null>(null)
  const [runResult, setRunResult] = useState<{ workflow: Workflow; result: WorkflowRunNowResult } | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

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

  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients', accessToken],
    queryFn: () => listClientsRequest(accessToken),
  })
  const quotaQuery = useQuery({
    queryKey: ['marketing', 'email-quota'],
    queryFn: () => getEmailQuotaRequest(accessToken),
    staleTime: 30_000,
  })

  const templatesQuery = useQuery({
    queryKey: ['marketing', 'templates', 'all'],
    queryFn: () => listTemplatesRequest(accessToken),
  })
  const templates = useMemo(
    () => (Array.isArray(templatesQuery.data) ? templatesQuery.data : []),
    [templatesQuery.data],
  )

  const clientNames = useMemo(
    () => new Map((clientsQuery.data ?? []).map((c) => [c.clientId, clientLabel(c)])),
    [clientsQuery.data],
  )

  const executionsQuery = useQuery({
    queryKey: ['marketing', 'executions', executionHistoryWorkflow?.workflowId],
    queryFn: () =>
      executionHistoryWorkflow
        ? getExecutionsByWorkflowRequest(accessToken, executionHistoryWorkflow.workflowId)
        : Promise.resolve([]),
    enabled: !!executionHistoryWorkflow,
  })

  const previewQuery = useQuery({
    queryKey: ['marketing', 'workflows', 'preview', previewWorkflow?.workflowId ?? 0],
    queryFn: () => previewWorkflowRequest(accessToken, previewWorkflow!.workflowId),
    enabled: previewWorkflow !== null,
    staleTime: 0,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateWorkflowInput) => createWorkflowRequest(accessToken, workflowPayload(input)),
    onMutate: () => setCreateError(null),
    onError: async (error) => setCreateError(await parseApiError(error)),
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
    mutationFn: (w: Workflow) => runWorkflowNowRequest(accessToken, w.workflowId),
    onSuccess: (result, w) => {
      // Invalida también el cupo de correos, el panel Hoy y las interacciones.
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setConfirmRun(null)
      setPreviewWorkflow(null)
      setRunResult({ workflow: w, result: { executed: result?.executed ?? [], skipped: result?.skipped ?? [] } })
    },
    onError: async (error) => {
      setConfirmRun(null)
      setExecutionResultMsg({ success: false, text: `No se pudo ejecutar: ${await parseApiError(error)}` })
      setTimeout(() => setExecutionResultMsg(null), 8000)
    },
  })

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const workflows = workflowsQuery.data || []
  const campaigns = useMemo(() => campaignsQuery.data ?? [], [campaignsQuery.data])
  const sinCampanas = !campaignsQuery.isLoading && campaigns.length === 0

  // "Automatizar" desde una campaña abre directamente el formulario con esa campaña.
  const [lastPreselected, setLastPreselected] = useState<number | null | undefined>(null)
  if (preselectedCampaignId && preselectedCampaignId !== lastPreselected) {
    setLastPreselected(preselectedCampaignId)
    setFormData({ ...INITIAL_FORM_DATA, campaignId: preselectedCampaignId })
    setIsCreateOpen(true)
  }

  return (
    <div className="space-y-5">
      <div
        data-tour="marketing-workflows-action"
        className={[
          'flex flex-col gap-3.5 rounded-xl border border-border/70 bg-card p-4.5 shadow-2xs',
          'sm:flex-row sm:items-center sm:justify-between',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs',
            ].join(' ')}
          >
            <Zap className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground tracking-tight">Flujos automatizados</h2>
            <p className="text-xs text-muted-foreground">
              Actúan solo sobre la audiencia de su campaña, cuando la campaña está activa y dentro de sus fechas
            </p>
          </div>
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
          disabled={sinCampanas}
          title={sinCampanas ? 'Cree primero una campaña' : undefined}
          className="h-9 gap-2 rounded-lg font-semibold shadow-2xs shrink-0"
        >
          <Plus className="size-4" />
          Nueva Automatización
        </Button>
      </div>

      <WorkflowStepsStrip />

      <EmailQuotaCard
        quota={quotaQuery.data}
        isLoading={quotaQuery.isLoading}
        isError={quotaQuery.isError}
        action={isAdmin ? <TestEmailDialog accessToken={accessToken} /> : undefined}
      />

      {executionResultMsg && (
        <Alert
          variant={executionResultMsg.success ? 'default' : 'destructive'}
          className="shadow-xs"
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
              {sinCampanas
                ? 'Cree primero una campaña: cada automatización pertenece a una campaña.'
                : 'No tienes flujos de marketing configurados.'}
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
              disabled={sinCampanas}
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
                campaign={campaign}
                clientName={campaign?.clientId ? clientNames.get(campaign.clientId) : null}
                onPreview={setPreviewWorkflow}
                isToggling={toggleMutation.isPending}
                isRunning={runMutation.isPending && runMutation.variables?.workflowId === w.workflowId}
                onToggle={(id) => toggleMutation.mutate(id)}
                onDelete={(id, name) => {
                  if (confirm(`¿Eliminar la automatización "${name}"?`)) {
                    deleteMutation.mutate(id)
                  }
                }}
                onRun={() => setConfirmRun(w)}
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
        templates={templates}
        accessToken={accessToken}
        clients={clientsQuery.data ?? []}
        isPending={createMutation.isPending}
        error={createError}
        onClose={() => {
          setIsCreateOpen(false)
          setCreateError(null)
        }}
        onFormDataChange={setFormData}
        onSubmit={handleCreateWorkflow}
      />

      <WorkflowPreviewDialog
        workflow={previewWorkflow}
        preview={previewQuery.data}
        isLoading={previewQuery.isLoading}
        isError={previewQuery.isError}
        onRetry={() => void previewQuery.refetch()}
        onClose={() => setPreviewWorkflow(null)}
        onRunNow={previewWorkflow?.active ? () => setConfirmRun(previewWorkflow) : undefined}
      />

      <RunNowConfirmDialog
        workflow={confirmRun}
        isPending={runMutation.isPending}
        onConfirm={() => confirmRun && runMutation.mutate(confirmRun)}
        onCancel={() => setConfirmRun(null)}
      />

      <RunNowResultDialog
        workflow={runResult?.workflow ?? null}
        result={runResult?.result ?? null}
        onClose={() => setRunResult(null)}
      />

      <WorkflowExecutionsDialog
        workflow={executionHistoryWorkflow}
        executions={executionsQuery.data || []}
        isLoading={executionsQuery.isLoading}
        onClose={() => setExecutionHistoryWorkflow(null)}
        clientName={(id) => clientNames.get(id) ?? 'Cliente'}
      />
    </div>
  )
}
