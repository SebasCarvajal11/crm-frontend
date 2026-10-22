import { useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
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
import { cn } from '@/shared/lib/utils'
import type { ProposalDecision } from '../api/portal-api'
import { DECISION_COMMENT_MAX, validateDecisionComment } from './portal.utils'

export interface ProposalDecisionDialogProps {
  /** null = cerrado. */
  decision: ProposalDecision | null
  proposalTitle: string
  isSubmitting: boolean
  /** Error del servidor (distinto del 409, que se maneja fuera). */
  serverError?: string | null
  onConfirm: (comment: string) => void
  onClose: () => void
}

/** Confirmación para aceptar (comentario opcional) o rechazar (comentario obligatorio) una propuesta. */
export function ProposalDecisionDialog({
  decision,
  proposalTitle,
  isSubmitting,
  serverError,
  onConfirm,
  onClose,
}: ProposalDecisionDialogProps) {
  return (
    <Dialog open={decision !== null} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent size="lg">
        {decision && (
          <DecisionForm
            key={decision}
            decision={decision}
            proposalTitle={proposalTitle}
            isSubmitting={isSubmitting}
            serverError={serverError}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function DecisionForm({
  decision,
  proposalTitle,
  isSubmitting,
  serverError,
  onConfirm,
  onClose,
}: Omit<ProposalDecisionDialogProps, 'decision'> & { decision: ProposalDecision }) {
  const [comment, setComment] = useState('')
  const [touched, setTouched] = useState(false)
  const accept = decision === 'ACCEPTED'
  const error = validateDecisionComment(decision, comment)
  const showError = touched && error

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (!error) onConfirm(comment.trim())
      }}
    >
      <DialogHeader>
        <DialogMedia variant={accept ? 'success' : 'destructive'}>
          {accept ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
        </DialogMedia>
        <div className="flex min-w-0 flex-col gap-1 text-left">
          <DialogTitle>{accept ? '¿Aceptar esta propuesta?' : '¿Rechazar esta propuesta?'}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{proposalTitle}</span>.{' '}
            {accept
              ? 'El equipo de CIMA recibirá tu aceptación y se pondrá en contacto para empezar.'
              : 'Cuéntanos el motivo: así CIMA puede ajustar la propuesta o entender qué necesitas.'}
          </DialogDescription>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-1.5">
        <Label htmlFor="decision-comment" className="text-xs font-medium">
          {accept ? 'Comentario (opcional)' : 'Motivo del rechazo (obligatorio)'}
        </Label>
        <Textarea
          id="decision-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={4}
          placeholder={accept ? 'Por ejemplo: ¿cuándo podemos empezar?' : 'Por ejemplo: el presupuesto supera lo previsto.'}
          aria-invalid={showError ? true : undefined}
          aria-describedby="decision-comment-help"
          className="text-sm"
        />
        <div id="decision-comment-help" className="flex items-start justify-between gap-3 text-[11px]">
          <span className={cn(showError ? 'font-medium text-destructive' : 'text-muted-foreground')} role={showError ? 'alert' : undefined}>
            {showError ? error : accept ? 'Puedes dejarlo en blanco.' : 'Escribe al menos unas palabras.'}
          </span>
          <span
            className={cn('shrink-0 tabular-nums', comment.length > DECISION_COMMENT_MAX ? 'font-semibold text-destructive' : 'text-muted-foreground')}
          >
            {comment.length}/{DECISION_COMMENT_MAX}
          </span>
        </div>
        {serverError && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
            {serverError}
          </p>
        )}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant={accept ? 'default' : 'destructive'} disabled={isSubmitting} className="gap-1.5">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {accept ? 'Sí, aceptar propuesta' : 'Sí, rechazar propuesta'}
        </Button>
      </DialogFooter>
    </form>
  )
}
