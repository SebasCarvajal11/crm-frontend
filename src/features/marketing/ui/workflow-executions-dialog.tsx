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
}

export function WorkflowExecutionsDialog({
  workflow,
  executions,
  isLoading,
  onClose,
}: WorkflowExecutionsDialogProps) {
  return (
    <Dialog open={workflow !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-black uppercase flex items-center gap-2">
            <History className="size-4 text-primary" />
            Historial: {workflow?.workflowName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registro de mensajes y acciones ejecutadas para clientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : executions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Este flujo aún no registra ejecuciones históricas.
            </p>
          ) : (
            <div className="divide-y text-xs">
              {executions.map((ex) => (
                <div key={ex.executionId} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      Cliente ID: {ex.clientId || 'Global'}
                    </span>
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
          <Button size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
