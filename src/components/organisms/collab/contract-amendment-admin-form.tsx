import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
      <DialogBody className="space-y-3.5">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="block text-xs font-medium">Tipo de Adición</Label>
            <Select
              value={amendmentType}
              onValueChange={(val) => setAmendmentType(val as AmendmentType)}
            >
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="services" className="text-xs">Servicios Adicionales</SelectItem>
                <SelectItem value="economic" className="text-xs">Ajuste de Valor</SelectItem>
                <SelectItem value="extension" className="text-xs">Prórroga de Plazo</SelectItem>
                <SelectItem value="mixed" className="text-xs">Mixta (Servicios + Valor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="block text-xs font-medium">Forma de Cobro</Label>
            <Select
              value={feePaymentType}
              onValueChange={(val) => setFeePaymentType(val as AmendmentFeePaymentType)}
            >
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time" className="text-xs">Pago Único Adicional</SelectItem>
                <SelectItem value="monthly_recurring" className="text-xs">Incremento Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="block text-xs font-medium">Valor Adicional (COP)</Label>
            <Input
              type="number"
              min="0"
              value={additionalFee}
              onChange={(e) => setAdditionalFee(Number(e.target.value))}
              data-testid="amendment-fee-input"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <Label className="block text-xs font-medium">Prórroga (Meses Adicionales)</Label>
            <Input
              type="number"
              min="0"
              value={extensionMonths}
              onChange={(e) => setExtensionMonths(Number(e.target.value))}
              className="text-xs h-9"
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
