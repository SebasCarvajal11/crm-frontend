import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import {
  collabKeys,
  type AmendmentType,
  type AmendmentFeePaymentType,
} from '@/features/collab/model'
import { saveProjectContractAmendmentDraftRequest } from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'

interface ContractAmendmentAdminFormProps {
  accessToken: string
  projectId: string
  onSuccess: () => void
  onCancel: () => void
  onError: (msg: string) => void
}

export function ContractAmendmentAdminForm({
  accessToken,
  projectId,
  onSuccess,
  onCancel,
  onError,
}: ContractAmendmentAdminFormProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [amendmentType, setAmendmentType] = useState<AmendmentType>('services')
  const [serviceScope, setServiceScope] = useState('')
  const [additionalFee, setAdditionalFee] = useState(0)
  const [feePaymentType, setFeePaymentType] = useState<AmendmentFeePaymentType>('one_time')
  const [extensionMonths, setExtensionMonths] = useState(0)
  const [additionalTerms, setAdditionalTerms] = useState('')

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
      onSuccess()
    },
    onError: (err) =>
      void parseApiError(err).then((msg) => onError(msg || 'No se pudo guardar el Otrosí')),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    adminCreate.mutate()
  }

  const isSubmitting = adminCreate.isPending

  return (
    <form id="amendment-admin-form" onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <DialogBody className="space-y-3.5 max-h-[60vh]">
        <div>
          <Label className="mb-1 block text-xs font-semibold text-foreground/90">
            Título o Concepto de la Adición
          </Label>
          <Input
            required
            placeholder="Ej: Adición de 2 videos publicitarios para Facebook"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="amendment-title-input"
            className="text-xs h-9"
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
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} className="text-xs">
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !title.trim() || !serviceScope.trim()}
          data-testid="save-amendment-draft-btn"
          className="text-xs font-semibold shadow-2xs"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Borrador de Otrosí'}
        </Button>
      </DialogFooter>
    </form>
  )
}
