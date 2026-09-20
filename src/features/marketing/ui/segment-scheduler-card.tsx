import { CheckCircle2, Filter, Mail, PlayCircle, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SchedulerRunResult } from '../api/segments-api'

interface SegmentSchedulerCardProps {
  schedulerResult: SchedulerRunResult | null
  isPending: boolean
  activeWorkflowsCount: number
  onRunScheduler: () => void
}

export function SegmentSchedulerCard({
  schedulerResult,
  isPending,
  activeWorkflowsCount,
  onRunScheduler,
}: SegmentSchedulerCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Planificador de flujos automáticos
        </CardTitle>
        <CardDescription>
          Evalúa todos los flujos activos y ejecuta los que cumplan su condición de disparo. Se
          ejecuta solo cada hora; este botón permite lanzarlo bajo demanda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="gap-2" onClick={onRunScheduler} disabled={isPending}>
            <PlayCircle className={`h-5 w-5 ${isPending ? 'animate-pulse' : ''}`} />
            {isPending ? 'Evaluando flujos…' : 'Ejecutar planificador ahora'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {activeWorkflowsCount} flujo(s) activo(s) serán evaluados
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
                      </div>
                    ))}
                    {schedulerResult.executions.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        + {schedulerResult.executions.length - 5} ejecuciones más
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
  )
}
