import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
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
import type { MarketingInteraction, InteractionType } from '../api/interactions-api'
import { INTERACTION_TYPES, formatDateTime } from './interaction-types.constants'

interface FormFieldsProps {
  target: MarketingInteraction
  clientLabel: string
  responseText: string
  setResponseText: (val: string) => void
  responseType: InteractionType
  setResponseType: (val: InteractionType) => void
  formError: string | null
}

function FormFields({
  target,
  clientLabel,
  responseText,
  setResponseText,
  responseType,
  setResponseType,
  formError,
}: FormFieldsProps) {
  return (
    <DialogBody className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 text-xs shadow-2xs">
        <p className="font-semibold text-foreground tracking-tight">{clientLabel}</p>
        <p className="mt-1 text-muted-foreground">
          Contactado el {formatDateTime(target.contactDate)} por{' '}
          {target.channel ?? 'canal no especificado'}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="responseText" className="text-xs font-medium text-foreground/90">
          ¿Qué respondió el cliente?
        </Label>
        <textarea
          id="responseText"
          rows={3}
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Me interesa la propuesta, agendemos una reunión…"
          className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="responseType" className="text-xs font-medium text-foreground/90">
          Tipo de respuesta
        </Label>
        <select
          id="responseType"
          value={responseType}
          onChange={(e) => setResponseType(e.target.value as InteractionType)}
          className="h-9 w-full rounded-xl border border-border/70 bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {INTERACTION_TYPES.filter((t) => t.esRespuesta).map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground">
          Solo estos tipos cuentan como respuesta efectiva en el indicador de conversión.
        </p>
      </div>

      {formError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive">
          {formError}
        </div>
      )}
    </DialogBody>
  )
}

interface FormProps {
  target: MarketingInteraction
  clientLabel: string
  isPending: boolean
  onClose: () => void
  onSubmit: (data: { response: string; type: InteractionType }) => void
}

function InteractionResponseForm({ target, clientLabel, isPending, onClose, onSubmit }: FormProps) {
  const [responseText, setResponseText] = useState('')
  const [responseType, setResponseType] = useState<InteractionType>('inquiry')
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit() {
    if (!responseText.trim()) {
      setFormError('Escriba el detalle de la respuesta recibida.')
      return
    }
    setFormError(null)
    onSubmit({ response: responseText.trim(), type: responseType })
  }

  return (
    <>
      <FormFields
        target={target}
        clientLabel={clientLabel}
        responseText={responseText}
        setResponseText={setResponseText}
        responseType={responseType}
        setResponseType={setResponseType}
        formError={formError}
      />
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending} className="rounded-xl text-xs">
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={isPending} className="rounded-xl text-xs font-medium shadow-xs">
          {isPending ? 'Guardando…' : 'Registrar respuesta'}
        </Button>
      </DialogFooter>
    </>
  )
}

interface InteractionResponseDialogProps {
  target: MarketingInteraction | null
  clientLabel: string
  isPending: boolean
  onClose: () => void
  onSubmit: (data: { response: string; type: InteractionType }) => void
}

export function InteractionResponseDialog({
  target,
  clientLabel,
  isPending,
  onClose,
  onSubmit,
}: InteractionResponseDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogMedia variant="default">
            <MessageSquare className="size-5" />
          </DialogMedia>
          <div className="flex flex-col gap-1 text-left min-w-0">
            <DialogTitle>
              Registrar respuesta del cliente
            </DialogTitle>
            <DialogDescription>
              Se actualiza la misma interacción, no se crea una nueva. Este dato alimenta la tasa de
              respuesta.
            </DialogDescription>
          </div>
        </DialogHeader>

        {target && (
          <InteractionResponseForm
            key={target.interactionId}
            target={target}
            clientLabel={clientLabel}
            isPending={isPending}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
