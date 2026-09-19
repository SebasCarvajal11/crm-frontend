import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusCircle, Send, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  collabKeys,
  type AmendmentType,
  type AmendmentFeePaymentType,
} from '@/features/collab/model'
import {
  saveProjectContractAmendmentDraftRequest,
  requestClientContractAmendmentRequest,
} from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'

type Props = {
  accessToken: string
  projectId: string
  role: 'admin' | 'worker' | 'client'
  onError: (msg: string) => void
}

export function ContractAmendmentModal({ accessToken, projectId, role, onError }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  // Admin form state
  const [title, setTitle] = useState('')
  const [amendmentType, setAmendmentType] = useState<AmendmentType>('services')
  const [serviceScope, setServiceScope] = useState('')
  const [additionalFee, setAdditionalFee] = useState(0)
  const [feePaymentType, setFeePaymentType] = useState<AmendmentFeePaymentType>('one_time')
  const [extensionMonths, setExtensionMonths] = useState(0)
  const [additionalTerms, setAdditionalTerms] = useState('')

  // Client request state
  const [clientDesc, setClientDesc] = useState('')

  const adminCreate = useMutation({
    mutationFn: () =>
      saveProjectContractAmendmentDraftRequest(accessToken, projectId, {
        title,
        amendment_type: amendmentType,
        service_scope: serviceScope,
        additional_fee: additionalFee,
        fee_payment_type: feePaymentType,
        term_months_extension: extensionMonths,
        additional_terms: additionalTerms || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.contractAmendments(projectId) })
      setOpen(false)
      resetForm()
    },
    onError: (err) =>
      void parseApiError(err).then((msg) => onError(msg || 'No se pudo guardar el Otrosí')),
  })

  const clientRequest = useMutation({
    mutationFn: () =>
      requestClientContractAmendmentRequest(accessToken, projectId, {
        title,
        description: clientDesc,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.contractAmendments(projectId) })
      setOpen(false)
      resetForm()
    },
    onError: (err) =>
      void parseApiError(err).then((msg) => onError(msg || 'No se pudo enviar la solicitud')),
  })

  const resetForm = () => {
    setTitle('')
    setServiceScope('')
    setAdditionalFee(0)
    setExtensionMonths(0)
    setAdditionalTerms('')
    setClientDesc('')
  }

  const isSubmitting = adminCreate.isPending || clientRequest.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 text-xs font-semibold"
          data-testid="open-amendment-modal-btn"
        >
          {role === 'admin' ? (
            <>
              <PlusCircle className="size-3.5" />
              Crear Otrosí / Adición
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              Solicitar Adición de Servicio
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="size-4 text-primary" />
            {role === 'admin'
              ? 'Formalizar Otrosí al Contrato Principal'
              : 'Solicitud de Adición de Servicio'}
          </DialogTitle>
        </DialogHeader>

        {role === 'admin' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              adminCreate.mutate()
            }}
            className="space-y-3.5 text-xs"
          >
            <div>
              <Label className="mb-1 block font-medium">Título o Concepto de la Adición</Label>
              <Input
                required
                placeholder="Ej: Adición de 2 videos publicitarios para Facebook"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="amendment-title-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="mb-1 block font-medium">Tipo de Adición</Label>
                <select
                  value={amendmentType}
                  onChange={(e) => setAmendmentType(e.target.value as AmendmentType)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                >
                  <option value="services">Servicios Adicionales</option>
                  <option value="economic">Ajuste de Valor</option>
                  <option value="extension">Prórroga de Plazo</option>
                  <option value="mixed">Mixta (Servicios + Valor)</option>
                </select>
              </div>

              <div>
                <Label className="mb-1 block font-medium">Forma de Cobro</Label>
                <select
                  value={feePaymentType}
                  onChange={(e) => setFeePaymentType(e.target.value as AmendmentFeePaymentType)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                >
                  <option value="one_time">Pago Único Adicional</option>
                  <option value="monthly_recurring">Incremento Mensual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="mb-1 block font-medium">Valor Adicional (COP)</Label>
                <Input
                  type="number"
                  min="0"
                  value={additionalFee}
                  onChange={(e) => setAdditionalFee(Number(e.target.value))}
                  data-testid="amendment-fee-input"
                />
              </div>

              <div>
                <Label className="mb-1 block font-medium">Prórroga (Meses Adicionales)</Label>
                <Input
                  type="number"
                  min="0"
                  value={extensionMonths}
                  onChange={(e) => setExtensionMonths(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1 block font-medium">Alcance y Entregables del Nuevo Servicio</Label>
              <Textarea
                required
                rows={3}
                placeholder="Describe con precisión qué piezas, entregables o servicios nuevos se compromete CIMA a prestar..."
                value={serviceScope}
                onChange={(e) => setServiceScope(e.target.value)}
                data-testid="amendment-scope-input"
              />
            </div>

            <div>
              <Label className="mb-1 block font-medium">Condiciones Particulares (Opcional)</Label>
              <Textarea
                rows={2}
                placeholder="Condiciones de entrega, fechas límite o excepciones particulares..."
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !title.trim() || !serviceScope.trim()}
                data-testid="save-amendment-draft-btn"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Borrador de Otrosí'}
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              clientRequest.mutate()
            }}
            className="space-y-3.5 text-xs"
          >
            <div>
              <Label className="mb-1 block font-medium">¿Qué servicio nuevo necesitas?</Label>
              <Input
                required
                placeholder="Ej: Requerimos agregar 2 videos adicionales este mes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="client-request-title-input"
              />
            </div>

            <div>
              <Label className="mb-1 block font-medium">Detalle del Requerimiento</Label>
              <Textarea
                required
                rows={4}
                placeholder="Describe qué entregables necesitas, en qué formato y la fecha ideal..."
                value={clientDesc}
                onChange={(e) => setClientDesc(e.target.value)}
                data-testid="client-request-desc-input"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !title.trim() || !clientDesc.trim()}
                data-testid="send-client-request-btn"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud al Administrador'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
