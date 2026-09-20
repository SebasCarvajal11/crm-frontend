import { PlayCircle, Target, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { SegmentPreview } from '../api/segments-api'
import type { Workflow } from '../api/marketing-api'

interface SegmentPreviewCardProps {
  isPending: boolean
  preview: SegmentPreview | null
  activeWorkflows: Workflow[]
  selectedWorkflow: string
  isExecuting: boolean
  onSelectWorkflow: (id: string) => void
  onExecute: () => void
}

export function SegmentPreviewCard({
  isPending,
  preview,
  activeWorkflows,
  selectedWorkflow,
  isExecuting,
  onSelectWorkflow,
  onExecute,
}: SegmentPreviewCardProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">Público objetivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
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
                  onChange={(e) => onSelectWorkflow(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Seleccione un flujo…</option>
                  {activeWorkflows.map((w) => (
                    <option key={w.workflowId} value={w.workflowId}>
                      {w.workflowName}
                    </option>
                  ))}
                </select>
                <Button
                  className="w-full gap-2"
                  disabled={!selectedWorkflow || isExecuting}
                  onClick={onExecute}
                >
                  <PlayCircle className="h-4 w-4" />
                  {isExecuting ? 'Ejecutando…' : 'Ejecutar sobre el segmento'}
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
  )
}
