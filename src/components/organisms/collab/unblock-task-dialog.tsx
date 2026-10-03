import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogBody,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ProjectTaskColumn } from '@/features/collab/model'

type Props = {
  open: boolean
  taskTitle: string
  blockType?: string | null
  blockReason?: string | null
  columns: ProjectTaskColumn[]
  isPending: boolean
  onClose: () => void
  onConfirm: (payload: { targetColumnId?: string; resolutionComment?: string }) => void
}

export function UnblockTaskDialog({
  open,
  taskTitle,
  blockType,
  blockReason,
  columns,
  isPending,
  onClose,
  onConfirm,
}: Props) {
  const [comment, setComment] = useState('')

  // Default target: doing, or the first column that is not blocked
  const availableColumns = columns.filter((col) => col.key !== 'blocked')
  const defaultCol = availableColumns.find((c) => c.key === 'doing') ?? availableColumns[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      targetColumnId: defaultCol?.id,
      resolutionComment: comment.trim() || undefined,
    })
  }

  const isClientTimeout = blockType === 'client_timeout'

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && !next && onClose()}>
      <DialogContent size="md">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogMedia variant="success">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </DialogMedia>
              <div className="space-y-0.5">
                <DialogTitle>Desbloquear Tarea</DialogTitle>
                <DialogDescription>
                  Reactivar el flujo de trabajo para:{' '}
                  <span className="font-medium text-foreground">&ldquo;{taskTitle}&rdquo;</span>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-3.5">
            {blockReason && (
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-left text-xs space-y-1 shadow-2xs">
                <span className="font-medium text-muted-foreground block text-[11px]">
                  Motivo original del bloqueo ({isClientTimeout ? 'Timeout de Cliente' : 'Impedimento Interno'}):
                </span>
                <p className="text-foreground italic leading-relaxed">{blockReason}</p>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label htmlFor="unblock-comment" className="text-xs font-semibold text-foreground/90">
                Comentario de resolución <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="unblock-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explica cómo se resolvió el impedimento..."
                rows={3}
                maxLength={300}
                className="text-xs resize-none rounded-xl"
                disabled={isPending}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold shadow-2xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  Reactivando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Desbloquear Tarea
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
