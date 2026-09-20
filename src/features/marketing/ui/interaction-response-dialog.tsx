import { useEffect, useState } from 'react'
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
import type { MarketingInteraction, InteractionType } from '../api/interactions-api'
import { INTERACTION_TYPES, formatDateTime } from './interaction-types.constants'

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
  const [responseText, setResponseText] = useState('')
  const [responseType, setResponseType] = useState<InteractionType>('inquiry')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (target) {
      setResponseText('')
      setResponseType('inquiry')
      setFormError(null)
    }
  }, [target])

  function handleSubmit() {
    if (!responseText.trim()) {
      setFormError('Escriba el detalle de la respuesta recibida.')
      return
    }
    setFormError(null)
    onSubmit({ response: responseText.trim(), type: responseType })
  }

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar respuesta del cliente</DialogTitle>
          <DialogDescription>
            Se actualiza la misma interacción, no se crea una nueva. Este dato alimenta la tasa de
            respuesta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {target && (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <p className="font-medium">{clientLabel}</p>
              <p className="text-xs text-muted-foreground">
                Contactado el {formatDateTime(target.contactDate)} por{' '}
                {target.channel ?? 'canal no especificado'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="responseText">¿Qué respondió el cliente?</Label>
            <textarea
              id="responseText"
              rows={3}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Me interesa la propuesta, agendemos una reunión…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseType">Tipo de respuesta</Label>
            <select
              id="responseType"
              value={responseType}
              onChange={(e) => setResponseType(e.target.value as InteractionType)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {INTERACTION_TYPES.filter((t) => t.esRespuesta).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Solo estos tipos cuentan como respuesta efectiva en el indicador de conversión.
            </p>
          </div>

          {formError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Guardando…' : 'Registrar respuesta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
