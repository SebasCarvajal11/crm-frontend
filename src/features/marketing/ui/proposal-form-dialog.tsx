import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Proposal, ProposalStatus, CreateProposalInput } from '../api/proposals-api'
import type { MarketingClient } from '../api/clients-api'
import { PROPOSAL_STATUSES } from './proposal.constants'

interface ProposalFormDialogProps {
  open: boolean
  editingProposal: Proposal | null
  formData: CreateProposalInput
  clients: MarketingClient[]
  isClientsError: boolean
  formError: string | null
  isSaving: boolean
  onClose: () => void
  onFormDataChange: (data: CreateProposalInput) => void
  onSubmit: () => void
}

export function ProposalFormDialog({
  open,
  editingProposal,
  formData,
  clients,
  isClientsError,
  formError,
  isSaving,
  onClose,
  onFormDataChange,
  onSubmit,
}: ProposalFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingProposal ? 'Editar propuesta' : 'Nueva propuesta comercial'}
          </DialogTitle>
          <DialogDescription>
            La propuesta queda asociada al cliente y alimenta los indicadores de ingresos
            estimados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente</Label>
            <select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => onFormDataChange({ ...formData, clientId: e.target.value })}
              disabled={Boolean(editingProposal)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
            >
              <option value="">Seleccione un cliente…</option>
              {clients.map((c) => (
                <option key={c.clientId} value={c.clientId}>
                  {c.contactInfo || c.additionalInfo || c.clientId}
                  {c.plan ? ` · ${c.plan}` : ''}
                </option>
              ))}
            </select>
            {isClientsError && (
              <p className="text-xs text-destructive">
                No se pudo cargar la lista de clientes. Ejecute la sincronización con el CRM.
              </p>
            )}
            {editingProposal && (
              <p className="text-xs text-muted-foreground">
                El cliente no se puede cambiar una vez creada la propuesta.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={3}
              value={formData.description ?? ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Producción audiovisual y pauta digital para lanzamiento…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Valor estimado (COP)</Label>
              <Input
                id="estimatedValue"
                type="number"
                min={0}
                step={1000}
                value={formData.estimatedValue ?? ''}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    estimatedValue: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="4500000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createdDate">Fecha de la propuesta</Label>
              <Input
                id="createdDate"
                type="date"
                value={formData.createdDate ?? ''}
                onChange={(e) => onFormDataChange({ ...formData, createdDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                onFormDataChange({ ...formData, status: e.target.value as ProposalStatus })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {PROPOSAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} — {s.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentUrl">Enlace al documento (opcional)</Label>
            <Input
              id="documentUrl"
              value={formData.documentUrl ?? ''}
              onChange={(e) => onFormDataChange({ ...formData, documentUrl: e.target.value })}
              placeholder="https://drive.google.com/…"
            />
          </div>

          {formError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving ? 'Guardando…' : editingProposal ? 'Guardar cambios' : 'Crear propuesta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
