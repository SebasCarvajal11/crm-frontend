import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Filter, FolderCheck, XCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { parseApiError } from '@/shared/lib/parse-api-error'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  previewSegmentRequest,
  executeOnSegmentRequest,
  runSchedulerRequest,
  listSavedSegmentsRequest,
  createSavedSegmentRequest,
  updateSavedSegmentRequest,
  setSavedSegmentActiveRequest,
  getSavedSegmentClientsRequest,
  savedSegmentsKey,
  type SavedSegment,
  type SegmentCriteria,
  type SegmentPreview,
  type SchedulerRunResult,
} from '../api/segments-api'
import { listWorkflowsRequest } from '../api/marketing-api'
import { listClientsRequest } from '../api/clients-api'
import { clientLabel } from './client-plans.constants'
import { SegmentSchedulerCard } from './segment-scheduler-card'
import { SegmentPreviewCard } from './segment-preview-card'
import { TriEstado } from './tri-estado'
import { usePlans } from '../hooks/use-plans'
import { planChipStyle } from './plans.utils'
import {
  ESTADOS_PROPUESTA,
  CRITERIOS_VACIOS,
  limpiar,
  toEditableCriteria,
} from './segment-criteria.utils'
import { SaveSegmentDialog } from './save-segment-dialog'
import { SavedSegmentsSection, SegmentClientsList } from './saved-segments-section'
import { clientCountLabel } from './audience.utils'

interface SegmentsManagerProps {
  accessToken: string
}

export function SegmentsManager({ accessToken }: SegmentsManagerProps) {
  const queryClient = useQueryClient()
  const { plans, activePlans, isLoading: plansLoading } = usePlans(accessToken)

  const [criteria, setCriteria] = useState<SegmentCriteria>(CRITERIOS_VACIOS)
  const [preview, setPreview] = useState<SegmentPreview | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('')
  const [schedulerResult, setSchedulerResult] = useState<SchedulerRunResult | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  // Segmentos guardados
  const [saveOpen, setSaveOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState<SavedSegment | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<SavedSegment | null>(null)
  const [toggleError, setToggleError] = useState<{ segmentId: string; message: string } | null>(null)

  const savedQuery = useQuery({
    queryKey: savedSegmentsKey,
    queryFn: () => listSavedSegmentsRequest(accessToken),
  })
  const segmentClientsQuery = useQuery({
    queryKey: [...savedSegmentsKey, 'clients', viewing?.segmentId ?? 'none'],
    queryFn: () => getSavedSegmentClientsRequest(accessToken, viewing!.segmentId),
    enabled: viewing !== null,
  })

  const saveMutation = useMutation({
    mutationFn: async (v: { name: string; description: string; replaceCriteria: boolean }) => {
      if (editingSegment) {
        return updateSavedSegmentRequest(accessToken, editingSegment.segmentId, {
          name: v.name,
          description: v.description || null,
          criteria: v.replaceCriteria ? limpiar(criteria) : editingSegment.criteria,
        })
      }
      return createSavedSegmentRequest(accessToken, {
        name: v.name,
        description: v.description || null,
        criteria: limpiar(criteria),
      })
    },
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: savedSegmentsKey })
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'campaigns'] })
      setMensaje(
        `${editingSegment ? 'Segmento actualizado' : 'Segmento guardado'}: “${saved.name}” · ${clientCountLabel(saved.clientCount)}. Ya puede usarlo como audiencia de una campaña.`
      )
      setSaveOpen(false)
      setEditingSegment(null)
    },
    onError: async (error) => setSaveError(await parseApiError(error)),
  })

  const toggleMutation = useMutation({
    mutationFn: (s: SavedSegment) => setSavedSegmentActiveRequest(accessToken, s.segmentId, !s.active),
    onMutate: () => setToggleError(null),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: savedSegmentsKey }),
    onError: async (error, s) => setToggleError({ segmentId: s.segmentId, message: await parseApiError(error) }),
  })

  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients', accessToken],
    queryFn: () => listClientsRequest(accessToken),
  })
  const clientNames = useMemo(
    () => new Map((clientsQuery.data ?? []).map((c) => [c.clientId, clientLabel(c)])),
    [clientsQuery.data],
  )

  const workflowsQuery = useQuery({
    queryKey: ['marketing', 'workflows'],
    queryFn: () => listWorkflowsRequest(accessToken),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['marketing'] })
    void queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }

  const previewMutation = useMutation({
    mutationFn: () => previewSegmentRequest(accessToken, limpiar(criteria)),
    onSuccess: (data) => {
      setPreview(data)
      setMensaje(null)
    },
    onError: () => setMensaje('No se pudo calcular el segmento.'),
  })

  const executeMutation = useMutation({
    mutationFn: () => executeOnSegmentRequest(accessToken, selectedWorkflow, limpiar(criteria)),
    onSuccess: (data) => {
      invalidate()
      setMensaje(
        `Flujo ejecutado sobre el segmento: ${Array.isArray(data) ? data.length : 0} ejecución(es) generada(s).`
      )
    },
    onError: () => setMensaje('No se pudo ejecutar el flujo sobre el segmento.'),
  })

  const schedulerMutation = useMutation({
    mutationFn: () => runSchedulerRequest(accessToken),
    onSuccess: (data) => {
      invalidate()
      setSchedulerResult(data)
    },
    onError: () => setMensaje('No se pudo ejecutar el planificador.'),
  })

  const workflows = workflowsQuery.data ?? []
  const activos = workflows.filter((w) => w.active)

  function togglePlan(plan: string) {
    const actuales = criteria.plans ?? []
    setCriteria({
      ...criteria,
      plans: actuales.includes(plan) ? actuales.filter((p) => p !== plan) : [...actuales, plan],
    })
  }

  function toggleEstado(estado: string) {
    const actuales = criteria.proposalStatuses ?? []
    setCriteria({
      ...criteria,
      proposalStatuses: actuales.includes(estado)
        ? actuales.filter((e) => e !== estado)
        : [...actuales, estado],
    })
  }

  function limpiarTodo() {
    setCriteria(CRITERIOS_VACIOS)
    setPreview(null)
    setMensaje(null)
  }

  return (
    <div className="space-y-6">
      <SegmentSchedulerCard
        schedulerResult={schedulerResult}
        isPending={schedulerMutation.isPending}
        activeWorkflowsCount={activos.length}
        onRunScheduler={() => schedulerMutation.mutate()}
        clientName={(id) => clientNames.get(id) ?? 'Cliente'}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-primary" />
              Segmentador de clientes
            </CardTitle>
            <CardDescription>
              Filtre la cartera por múltiples criterios combinados para encontrar el público
              adecuado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Plan de cliente (clasificación comercial)</Label>
              <div className="flex flex-wrap gap-2">
                {activePlans.map(({ planId, name: plan, color }) => {
                  const sel = criteria.plans?.includes(plan)
                  return (
                    <button
                      key={planId}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => togglePlan(plan)}
                      style={sel ? planChipStyle(color) : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        sel
                          ? 'text-foreground ring-2 ring-offset-1 ring-offset-background ring-primary/30'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                      Plan {plan}
                    </button>
                  )
                })}
                {!plansLoading && activePlans.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay planes activos. Un administrador puede crearlos en la pestaña Planes.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TriEstado
                label="¿Tiene proyectos activos?"
                value={criteria.hasProjects ?? null}
                onChange={(v) => setCriteria({ ...criteria, hasProjects: v })}
              />
              <TriEstado
                label="¿Ha interactuado antes?"
                value={criteria.hasInteractions ?? null}
                onChange={(v) => setCriteria({ ...criteria, hasInteractions: v })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Días mínimos sin contacto</Label>
              <Input
                id="days"
                type="number"
                min={0}
                placeholder="Ej. 30 (clientes sin contactar en el último mes)"
                value={criteria.minDaysWithoutContact ?? ''}
                onChange={(e) =>
                  setCriteria({
                    ...criteria,
                    minDaysWithoutContact: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Estado de propuesta comercial</Label>
              <div className="flex flex-wrap gap-2">
                {ESTADOS_PROPUESTA.map((ep) => {
                  const sel = criteria.proposalStatuses?.includes(ep.value)
                  return (
                    <button
                      key={ep.value}
                      type="button"
                      onClick={() => toggleEstado(ep.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        sel
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      {ep.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t pt-4">
              <Button
                onClick={() => previewMutation.mutate()}
                disabled={previewMutation.isPending}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {previewMutation.isPending ? 'Calculando…' : 'Calcular segmento'}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                disabled={!preview}
                title={preview ? undefined : 'Primero calcule el segmento'}
                onClick={() => {
                  setEditingSegment(null)
                  setSaveError(null)
                  setSaveOpen(true)
                }}
                data-tour="marketing-save-segment-btn"
              >
                <FolderCheck className="h-4 w-4" />
                Guardar como segmento
              </Button>
              <Button variant="ghost" onClick={limpiarTodo}>
                Limpiar criterios
              </Button>
            </div>
          </CardContent>
        </Card>

        <SegmentPreviewCard
          isPending={previewMutation.isPending}
          preview={preview}
          activeWorkflows={activos}
          selectedWorkflow={selectedWorkflow}
          isExecuting={executeMutation.isPending}
          onSelectWorkflow={setSelectedWorkflow}
          onExecute={() => executeMutation.mutate()}
        />
      </div>

      <SavedSegmentsSection
        segments={savedQuery.data ?? []}
        isLoading={savedQuery.isLoading}
        isError={savedQuery.isError}
        onRetry={() => void savedQuery.refetch()}
        onViewClients={setViewing}
        onEdit={(s) => {
          setEditingSegment(s)
          setSaveError(null)
          setSaveOpen(true)
        }}
        onToggleActive={(s) => toggleMutation.mutate(s)}
        onLoadCriteria={(s) => {
          setCriteria(toEditableCriteria(s.criteria))
          setPreview(null)
          setMensaje(`Criterios de “${s.name}” cargados en el segmentador. Pulse “Calcular segmento” para ver el público.`)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        togglingId={toggleMutation.isPending ? toggleMutation.variables?.segmentId : null}
        toggleError={toggleError}
      />

      <SaveSegmentDialog
        open={saveOpen}
        editing={editingSegment}
        criteria={limpiar(criteria)}
        canReplaceCriteria={preview !== null}
        isPending={saveMutation.isPending}
        error={saveError}
        onSubmit={(v) => {
          setSaveError(null)
          saveMutation.mutate(v)
        }}
        onClose={() => {
          setSaveOpen(false)
          setEditingSegment(null)
        }}
      />

      <Sheet open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent side="right" className="w-full gap-0 sm:data-[side=right]:max-w-lg">
          <SheetHeader className="pr-12 sm:px-5">
            <SheetTitle className="text-lg font-bold tracking-tight">{viewing?.name ?? 'Segmento'}</SheetTitle>
            <SheetDescription>
              Clientes que hoy cumplen el criterio{viewing ? ` · ${clientCountLabel(viewing.clientCount)}` : ''}.
            </SheetDescription>
          </SheetHeader>
          {viewing && (
            <SegmentClientsList
              clients={segmentClientsQuery.data}
              isLoading={segmentClientsQuery.isLoading}
              isError={segmentClientsQuery.isError}
              plans={plans}
              onRetry={() => void segmentClientsQuery.refetch()}
            />
          )}
        </SheetContent>
      </Sheet>

      {mensaje && (
        <div
          className={[
            'flex items-start justify-between gap-3 rounded-lg border',
            'border-primary/30 bg-primary/5 p-4 text-sm',
          ].join(' ')}
        >
          <span>{mensaje}</span>
          <IconButton label="Cerrar aviso" onClick={() => setMensaje(null)}>
            <XCircle className="h-4 w-4" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
