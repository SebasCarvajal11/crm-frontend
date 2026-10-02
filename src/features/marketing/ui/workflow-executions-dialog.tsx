import { Clock, History } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Workflow, WorkflowExecution } from '../api/marketing-api'

interface WorkflowExecutionsDialogProps {
  workflow: Workflow | null
  executions: WorkflowExecution[]
  isLoading: boolean
  onClose: () => void
  clientName?: (clientId: string) => string
}

export function WorkflowExecutionsDialog({
  workflow,
  executions,
  isLoading,
  onClose,
  clientName,
}: WorkflowExecutionsDialogProps) {
  return (
    <Dialog open={workflow !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden border-border/60 shadow-xl flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={[
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs',
              ].join(' ')}
            >
              <History className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                Historial: {workflow?.workflowName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Registro de mensajes y acciones ejecutadas para clientes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : executions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              Este flujo aún no registra ejecuciones históricas.
            </p>
          ) : (
            <div className="divide-y divide-border/60 text-xs">
              {executions.map((ex) => (
                <div key={ex.executionId} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">
                      {ex.clientId ? (clientName?.(ex.clientId) ?? 'Cliente') : 'Todos los clientes'}
                    </span>
                    <Badge
                      variant={ex.result === 'success' ? 'default' : 'destructive'}
                      className="text-[10px] uppercase font-bold"
                    >
                      {ex.result === 'success' ? 'Enviado' : 'Fallido'}
                    </Badge>
                  </div>
                  {ex.sentMessage && (
                    <p
                      className={[
                        'text-muted-foreground italic text-[11px] bg-muted/30 p-2',
                        'rounded-lg border border-border/40',
                      ].join(' ')}
                    >
                      "{ex.sentMessage}"
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground/80" />
                    {new Date(ex.executedAt).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter
          className={[
            'px-5 py-3 border-t border-border/50 bg-muted/15',
            'flex items-center justify-end shrink-0',
          ].join(' ')}
        >
          <Button size="sm" onClick={onClose} className="rounded-lg text-xs font-semibold shadow-2xs">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
