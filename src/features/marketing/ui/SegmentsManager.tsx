import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Filter,
  Mail,
  PlayCircle,
  Target,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  previewSegmentRequest,
  executeOnSegmentRequest,
  runSchedulerRequest,
  type SegmentCriteria,
  type SegmentPreview,
  type SchedulerRunResult,
} from '../api/segments-api'
import { listWorkflowsRequest } from '../api/marketing-api'

interface SegmentsManagerProps {
  accessToken: string
}

const PLANES = ['Oro', 'Esmeralda', 'Premium'] as const

const ESTADOS_PROPUESTA = [
  { value: 'Sent', label: 'Enviada' },
  { value: 'In_negotiation', label: 'En negociación' },
  { value: 'In_diagnosis', label: 'En diagnóstico' },
  { value: 'Approved', label: 'Aprobada' },
  { value: 'Rejected', label: 'Rechazada' },
]

const CRITERIOS_VACIOS: SegmentCriteria = {
  plans: [],
  hasProjects: null,
  hasInteractions: null,
  minDaysWithoutContact: null,
  proposalStatuses: [],
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
      {/* Planificador */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Planificador de flujos automáticos
          </CardTitle>
          <CardDescription>
            Evalúa todos los flujos activos y ejecuta los que cumplan su condición de
            disparo. Se ejecuta solo cada hora; este botón permite lanzarlo bajo demanda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => schedulerMutation.mutate()}
              disabled={schedulerMutation.isPending}
            >
              <PlayCircle className={`h-5 w-5 ${schedulerMutation.isPending ? 'animate-pulse' : ''}`} />
              {schedulerMutation.isPending ? 'Evaluando flujos…' : 'Ejecutar planificador ahora'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {activos.length} flujo(s) activo(s) serán evaluados
            </span>
          </div>

          {schedulerResult && (
            <div
              className={`rounded-lg border p-4 ${
                schedulerResult.executionsGenerated > 0
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-border bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {schedulerResult.executionsGenerated > 0 ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Filter className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {schedulerResult.executionsGenerated} ejecución(es) generada(s)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {schedulerResult.executionsGenerated > 0
                      ? 'Se envió la acción configurada a cada cliente que cumplía la condición.'
                      : 'Ningún cliente cumple las condiciones en este momento. Un flujo no se ejecuta dos veces sobre el mismo cliente.'}
                  </p>

                  {schedulerResult.executions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {schedulerResult.executions.slice(0, 5).map((ex, i) => (
                        <div
                          key={ex.executionId ?? i}
                          className="rounded-md border border-border bg-background p-3 text-xs"
                        >
                          <div className="flex items-center gap-2 font-medium">
                            <Mail className="h-3.5 w-3.5 text-primary" />
                            Cliente {ex.clientId?.slice(0, 13)}…
                            <span
                              className={
                                ex.result === 'success' ? 'text-emerald-700' : 'text-destructive'
                              }
                            >
                              · {ex.result}
                            </span>
                          </div>
                          {ex.sentMessage && (
                            <p className="mt-1 italic text-muted-foreground">"{ex.sentMessage}"</p>
                          )}
                          {ex.errorDetail && (
                            <p className="mt-1 text-destructive">{ex.errorDetail}</p>
                          )}
                        </div>
                      ))}
                      {schedulerResult.executions.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          y {schedulerResult.executions.length - 5} más…
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segmentación */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Target className="h-6 w-6 text-primary" />
          SEGMENTACIÓN DE CLIENTES
        </h2>
        <p className="text-sm text-muted-foreground">
          Construya el público objetivo combinando criterios comerciales antes de lanzar
          una campaña
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Criterios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Criterios</CardTitle>
            <CardDescription>
              Se combinan con Y lógico. Los criterios que deje vacíos no filtran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Plan contratado</Label>
              <div className="flex flex-wrap gap-2">
                {PLANES.map((plan) => {
                  const activo = (criteria.plans ?? []).includes(plan)
                  return (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => togglePlan(plan)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        activo
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      {plan}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minDays">Sin contacto desde hace (días)</Label>
              <Input
                id="minDays"
                type="number"
                min={0}
                value={criteria.minDaysWithoutContact ?? ''}
                onChange={(e) =>
                  setCriteria({
                    ...criteria,
                    minDaysWithoutContact: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">
                Los clientes nunca contactados también cumplen este criterio.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TriEstado
                label="Tiene proyectos"
                value={criteria.hasProjects ?? null}
                onChange={(v) => setCriteria({ ...criteria, hasProjects: v })}
              />
              <TriEstado
                label="Ya fue contactado"
                value={criteria.hasInteractions ?? null}
                onChange={(v) => setCriteria({ ...criteria, hasInteractions: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Con propuesta en estado</Label>
              <div className="flex flex-wrap gap-2">
                {ESTADOS_PROPUESTA.map((estado) => {
                  const activo = (criteria.proposalStatuses ?? []).includes(estado.value)
                  return (
                    <button
                      key={estado.value}
                      type="button"
                      onClick={() => toggleEstado(estado.value)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        activo
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      {estado.label}
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

        {/* Resultado */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Público objetivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewMutation.isPending ? (
              <Skeleton className="h-40 w-full rounded-lg" />
            ) : preview ? (
              <>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                  <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-4xl font-bold leading-none">{preview.total}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    cliente(s) cumplen los criterios
                  </p>
                </div>

                {preview.clients.length > 0 && (
                  <div className="max-h-56 space-y-1.5 overflow-y-auto">
                    {preview.clients.map((c) => (
                      <div
                        key={c.clientId}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-xs"
                      >
                        <span className="truncate">
                          {c.contactInfo || c.additionalInfo || c.clientId}
                        </span>
                        {c.plan && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5">
                            {c.plan}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {preview.total > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <Label htmlFor="workflow">Ejecutar un flujo sobre este segmento</Label>
                    <select
                      id="workflow"
                      value={selectedWorkflow}
                      onChange={(e) => setSelectedWorkflow(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Seleccione un flujo…</option>
                      {activos.map((w) => (
                        <option key={w.workflowId} value={w.workflowId}>
                          {w.workflowName}
                        </option>
                      ))}
                    </select>
                    <Button
                      className="w-full gap-2"
                      disabled={!selectedWorkflow || executeMutation.isPending}
                      onClick={() => executeMutation.mutate()}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {executeMutation.isPending ? 'Ejecutando…' : 'Ejecutar sobre el segmento'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Marketing dirigido: la acción llega solo a estos clientes, no a toda la
                      cartera.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 text-center">
                <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Defina los criterios y pulse «Calcular segmento» para ver cuántos clientes
                  cumplen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {mensaje && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <span>{mensaje}</span>
          <button onClick={() => setMensaje(null)} className="text-muted-foreground">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function TriEstado({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}) {
  const opciones: { label: string; valor: boolean | null }[] = [
    { label: 'Indiferente', valor: null },
    { label: 'Sí', valor: true },
    { label: 'No', valor: false },
  ]

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1 rounded-md border border-input p-1">
        {opciones.map((op) => (
          <button
            key={String(op.valor)}
            type="button"
            onClick={() => onChange(op.valor)}
            className={`flex-1 rounded px-2 py-1 text-xs transition-colors ${
              value === op.valor
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function limpiar(criteria: SegmentCriteria): SegmentCriteria {
  return {
    plans: criteria.plans?.length ? criteria.plans : undefined,
    proposalStatuses: criteria.proposalStatuses?.length ? criteria.proposalStatuses : undefined,
    hasProjects: criteria.hasProjects ?? undefined,
    hasInteractions: criteria.hasInteractions ?? undefined,
    minDaysWithoutContact: criteria.minDaysWithoutContact ?? undefined,
  }
}
