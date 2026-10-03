import { Clock, History } from 'lucide-react'
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
      <DialogContent size="xl">
        <DialogHeader>
          <DialogMedia variant="default">
            <History className="size-5" />
          </DialogMedia>
          <div className="flex flex-col gap-1 text-left min-w-0">
            <DialogTitle>
              Historial: {workflow?.workflowName}
            </DialogTitle>
            <DialogDescription>
              Registro de mensajes y acciones ejecutadas para clientes
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {isLoading ? (
            <div className="space-y-2.5">
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
                <div key={ex.executionId} className="py-3 space-y-1.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">
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
                        'text-muted-foreground italic text-[11px] bg-muted/30 p-2.5',
                        'rounded-xl border border-border/40',
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
        </DialogBody>

        <DialogFooter>
          <Button size="sm" onClick={onClose} className="rounded-xl text-xs font-medium shadow-xs">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
