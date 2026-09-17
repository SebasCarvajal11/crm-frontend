import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { resolveChangeRequestRequest } from '@/features/collab/api'
import type { ProjectChangeRequest } from '@/features/collab/model'

type Props = {
  open: boolean
  accessToken: string
  projectId: string
  changeRequest: ProjectChangeRequest | null
  action: 'accept' | 'reject' | null
  onClose: () => void
  onSuccess: () => void
}

export function ResolveChangeRequestModal({
  open,
  accessToken,
  projectId,
  changeRequest,
  action,
  onClose,
  onSuccess,
}: Props) {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isReject = action === 'reject'

  const handleClose = () => {
    setComment('')
    setErrorMsg(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!changeRequest) return

    if (isReject && !comment.trim()) {
      return setErrorMsg('Debes ingresar un motivo o comentario para explicar el rechazo al cliente')
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)

      const targetStatus = isReject
        ? 'rejected'
        : changeRequest.type === 'formal'
          ? 'approved'
          : 'accepted'

      await resolveChangeRequestRequest(accessToken, projectId, changeRequest.id, {
        status: targetStatus,
        comment: comment.trim() || undefined,
      })

      handleClose()
      onSuccess()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar la resolución')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-start gap-3 space-y-0">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
              isReject
                ? 'bg-destructive/10 text-destructive ring-destructive/20'
                : 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
            }`}
          >
            {isReject ? <XCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
          </div>
          <div className="flex flex-col gap-1 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {isReject ? 'Rechazar solicitud de cambio' : 'Aceptar solicitud de cambio'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isReject
                ? 'Indica el motivo del rechazo. El cliente recibirá una notificación con tu justificación.'
                : 'La solicitud será aprobada y quedará registrada formalmente en la trazabilidad del proyecto.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 sm:px-6">
          {errorMsg && (
            <Alert variant="destructive" className="mb-4 py-2">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="rounded-lg border bg-muted/40 p-3 text-xs">
            <p className="font-medium text-foreground">{changeRequest?.title}</p>
            <p className="mt-1 line-clamp-2 text-muted-foreground">{changeRequest?.description}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolve-comment" className="text-xs font-medium">
              {isReject ? 'Motivo del rechazo (obligatorio)' : 'Comentarios o notas de resolución (opcional)'}
            </Label>
            <Textarea
              id="resolve-comment"
              placeholder={
                isReject
                  ? 'Explica de forma clara y respetuosa por qué se rechaza este requerimiento...'
                  : 'Notas opcionales sobre cómo se abordará el cambio...'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[90px] text-xs resize-none"
              maxLength={2000}
            />
          </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isSubmitting} className="text-xs">
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                variant={isReject ? 'destructive' : 'default'}
                disabled={isSubmitting}
                className={
                  !isReject
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5'
                    : 'text-xs gap-1.5'
                }
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : isReject ? (
                  <XCircle className="size-3.5" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                {isSubmitting ? 'Procesando...' : isReject ? 'Rechazar cambio' : 'Aceptar cambio'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
