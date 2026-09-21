import { useState } from 'react'
import { AlertOctagon, Loader2 } from 'lucide-react'
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
      <DialogContent className="sm:max-w-md font-sans">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="size-5 shrink-0" aria-hidden="true" />
              <DialogTitle className="text-base font-semibold">Bloquear Tarea</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground text-left pt-1">
              Indica el motivo o impedimento por el cual se detiene el avance de:{' '}
              <span className="font-medium text-foreground">&ldquo;{taskTitle}&rdquo;</span>.
              Esta acción notificará al equipo y registrará la incidencia en el historial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="block-reason" className="text-xs font-medium">
                Motivo del bloqueo <span className="text-rose-500">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {trimmed.length}/{MAX_REASON_LENGTH}
              </span>
            </div>
            <Textarea
              id="block-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Describe detalladamente el impedimento (mínimo 5 caracteres)..."
              rows={3}
              maxLength={MAX_REASON_LENGTH}
              className={`text-xs resize-none ${
                touched && !isValid ? 'border-rose-500 focus-visible:ring-rose-500' : ''
              }`}
              disabled={isPending}
              autoFocus
            />
            {touched && trimmed.length < MIN_REASON_LENGTH && (
              <p className="text-[11px] text-rose-500">
                El motivo debe contener al menos {MIN_REASON_LENGTH} caracteres.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!isValid || isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
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
