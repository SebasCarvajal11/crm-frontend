import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Filter, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  previewSegmentRequest,
  executeOnSegmentRequest,
  runSchedulerRequest,
  type SegmentCriteria,
  type SegmentPreview,
  type SchedulerRunResult,
} from '../api/segments-api'
import { listWorkflowsRequest } from '../api/marketing-api'
import { SegmentSchedulerCard } from './segment-scheduler-card'
import { SegmentPreviewCard } from './segment-preview-card'
import { TriEstado } from './tri-estado'
import {
  PLANES,
  ESTADOS_PROPUESTA,
  CRITERIOS_VACIOS,
  limpiar,
} from './segment-criteria.utils'

interface SegmentsManagerProps {
  accessToken: string
}

export function SegmentsManager({ accessToken }: SegmentsManagerProps) {
  const queryClient = useQueryClient()

  const [criteria, setCriteria] = useState<SegmentCriteria>(CRITERIOS_VACIOS)
  const [preview, setPreview] = useState<SegmentPreview | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('')
  const [schedulerResult, setSchedulerResult] = useState<SchedulerRunResult | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

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
                {PLANES.map((plan) => {
                  const sel = criteria.plans?.includes(plan)
                  return (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => togglePlan(plan)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        sel
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      Plan {plan}
                    </button>
                  )
                })}
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

            <div className="flex gap-3 border-t pt-4">
              <Button
                onClick={() => previewMutation.mutate()}
                disabled={previewMutation.isPending}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {previewMutation.isPending ? 'Calculando…' : 'Calcular segmento'}
              </Button>
              <Button variant="outline" onClick={limpiarTodo}>
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

      {mensaje && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <span>{mensaje}</span>
          <IconButton label="Cerrar aviso" onClick={() => setMensaje(null)}>
            <XCircle className="h-4 w-4" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
