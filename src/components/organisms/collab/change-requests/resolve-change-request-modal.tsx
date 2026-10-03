import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
      <DialogContent size="md">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogMedia variant={isReject ? 'destructive' : 'success'}>
              {isReject ? <XCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
            </DialogMedia>
            <div className="flex flex-col gap-1 text-left min-w-0">
              <DialogTitle>
                {isReject ? 'Rechazar solicitud de cambio' : 'Aceptar solicitud de cambio'}
              </DialogTitle>
              <DialogDescription>
                {isReject
                  ? 'Indica el motivo del rechazo. El cliente recibirá una notificación con tu justificación.'
                  : 'La solicitud será aprobada y quedará registrada formalmente en la trazabilidad del proyecto.'}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {errorMsg && (
              <Alert variant="destructive" className="py-2.5 rounded-xl border-destructive/30">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 text-xs shadow-2xs">
              <p className="font-semibold text-foreground tracking-tight">{changeRequest?.title}</p>
              <p className="mt-1.5 line-clamp-2 text-muted-foreground leading-relaxed">
                {changeRequest?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resolve-comment" className="text-xs font-medium text-foreground/90">
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
                className="min-h-[90px] rounded-xl border-border/70 text-xs resize-none focus-visible:ring-primary/20"
                maxLength={2000}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={isReject ? 'destructive' : 'default'}
              disabled={isSubmitting}
              className={
                !isReject
                  ? 'rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-xs font-medium'
                  : 'rounded-xl text-xs gap-1.5 shadow-xs font-medium'
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
      </DialogContent>
    </Dialog>
  )
}
