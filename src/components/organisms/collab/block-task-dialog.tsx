import { useState } from 'react'
import { AlertOctagon, Loader2 } from 'lucide-react'
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

type Props = {
  open: boolean
  taskTitle: string
  isPending: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 500

export function BlockTaskDialog({ open, taskTitle, isPending, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  const trimmed = reason.trim()
  const isValid = trimmed.length >= MIN_REASON_LENGTH && trimmed.length <= MAX_REASON_LENGTH

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    onConfirm(trimmed)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      setReason('')
      setTouched(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogMedia variant="destructive">
                <AlertOctagon className="size-5" aria-hidden="true" />
              </DialogMedia>
              <div className="space-y-0.5">
                <DialogTitle>Bloquear Tarea</DialogTitle>
                <DialogDescription>
                  Indica el motivo o impedimento por el cual se detiene el avance de:{' '}
                  <span className="font-medium text-foreground">&ldquo;{taskTitle}&rdquo;</span>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-3.5">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="block-reason" className="text-xs font-semibold text-foreground/90">
                  Motivo del bloqueo <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {trimmed.length}/{MAX_REASON_LENGTH}
                </span>
              </div>
              <Textarea
                id="block-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Describe detalladamente el impedimento (mínimo 5 caracteres)..."
                rows={4}
                maxLength={MAX_REASON_LENGTH}
                className={`text-xs resize-none rounded-xl ${
                  touched && !isValid ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
                disabled={isPending}
                autoFocus
              />
              {touched && trimmed.length < MIN_REASON_LENGTH && (
                <p className="text-[11px] text-destructive font-medium">
                  El motivo debe contener al menos {MIN_REASON_LENGTH} caracteres.
                </p>
              )}
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
              variant="destructive"
              size="sm"
              disabled={!isValid || isPending}
              className="gap-1.5 text-xs font-semibold shadow-2xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  Bloqueando...
                </>
              ) : (
                <>
                  <AlertOctagon className="size-3.5" aria-hidden="true" />
                  Confirmar Bloqueo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
