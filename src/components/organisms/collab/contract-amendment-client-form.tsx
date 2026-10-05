import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { collabKeys } from '@/features/collab/model'
import { requestClientContractAmendmentRequest } from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'

interface ContractAmendmentClientFormProps {
  accessToken: string
  projectId: string
  onSuccess: () => void
  onCancel: () => void
  onError: (msg: string) => void
}

export function ContractAmendmentClientForm({
  accessToken,
  projectId,
  onSuccess,
  onCancel,
  onError,
}: ContractAmendmentClientFormProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [clientDesc, setClientDesc] = useState('')

  const clientRequest = useMutation({
    mutationFn: () =>
      requestClientContractAmendmentRequest(accessToken, projectId, {
        title,
        description: clientDesc,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.contractAmendments(projectId) })
      onSuccess()
    },
    onError: (err) =>
      void parseApiError(err).then((msg) => onError(msg || 'No se pudo enviar la solicitud')),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    clientRequest.mutate()
  }

  const isSubmitting = clientRequest.isPending

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <DialogBody className="space-y-3.5">
        <div>
          <Label className="mb-1 block text-xs font-semibold text-foreground/90">
            ¿Qué servicio nuevo necesitas?
          </Label>
          <Input
            required
            placeholder="Ej: Requerimos agregar 2 videos adicionales este mes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="client-request-title-input"
            className="text-xs h-9"
          />
        </div>

        <div>
          <Label className="mb-1 block text-xs font-semibold text-foreground/90">
            Detalle del Requerimiento
          </Label>
          <Textarea
            required
            rows={4}
            placeholder="Describe qué entregables necesitas, en qué formato y la fecha ideal..."
            value={clientDesc}
            onChange={(e) => setClientDesc(e.target.value)}
            data-testid="client-request-desc-input"
            className="text-xs resize-none rounded-xl"
          />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} className="text-xs">
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !title.trim() || !clientDesc.trim()}
          data-testid="send-client-request-btn"
          className="text-xs font-semibold shadow-2xs"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Solicitud al Administrador'}
        </Button>
      </DialogFooter>
    </form>
  )
}
