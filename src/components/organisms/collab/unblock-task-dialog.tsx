import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
      <DialogContent className="sm:max-w-md font-sans">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
              <DialogTitle className="text-base font-semibold">Desbloquear Tarea</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground text-left pt-1">
              Reactivar el flujo de trabajo para:{' '}
              <span className="font-medium text-foreground">&ldquo;{taskTitle}&rdquo;</span>.
            </DialogDescription>
          </DialogHeader>

          {blockReason && (
            <div className="rounded-md border border-border bg-muted/40 p-2.5 text-left text-xs space-y-1">
              <span className="font-medium text-muted-foreground block">
                Motivo original del bloqueo ({isClientTimeout ? 'Timeout de Cliente' : 'Impedimento Interno'}):
              </span>
              <p className="text-foreground italic">{blockReason}</p>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <Label htmlFor="unblock-comment" className="text-xs font-medium">
              Comentario de resolución <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="unblock-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explica cómo se resolvió el impedimento..."
              rows={2}
              maxLength={300}
              className="text-xs resize-none"
              disabled={isPending}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
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
