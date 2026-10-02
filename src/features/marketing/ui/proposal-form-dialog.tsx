import { FileText } from 'lucide-react'
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
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/60 shadow-xl">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div
              className={[
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs',
              ].join(' ')}
            >
              <FileText className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                {editingProposal ? 'Editar propuesta' : 'Nueva propuesta comercial'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                La propuesta queda asociada al cliente y alimenta los indicadores de ingresos estimados.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4 sm:px-6">
          <div className="space-y-1.5">
            <Label htmlFor="clientId" className="text-xs font-semibold text-foreground/90">Cliente</Label>
            <select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => onFormDataChange({ ...formData, clientId: e.target.value })}
              disabled={Boolean(editingProposal)}
              className={[
                'h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-xs',
                'font-medium text-foreground disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-primary',
              ].join(' ')}
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

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-foreground/90">Descripción</Label>
            <textarea
              id="description"
              rows={3}
              value={formData.description ?? ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Producción audiovisual y pauta digital para lanzamiento…"
              className={[
                'w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs',
                'focus:outline-none focus:ring-1 focus:ring-primary',
              ].join(' ')}
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="estimatedValue" className="text-xs font-semibold text-foreground/90">
                Valor estimado (COP)
              </Label>
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
                className="h-9 rounded-lg border-border/70 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="createdDate" className="text-xs font-semibold text-foreground/90">
                Fecha de la propuesta
              </Label>
              <Input
                id="createdDate"
                type="date"
                value={formData.createdDate ?? ''}
                onChange={(e) => onFormDataChange({ ...formData, createdDate: e.target.value })}
                className="h-9 rounded-lg border-border/70 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-semibold text-foreground/90">Estado</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                onFormDataChange({ ...formData, status: e.target.value as ProposalStatus })
              }
              className={[
                'h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-xs',
                'font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary',
              ].join(' ')}
            >
              {PROPOSAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} — {s.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="documentUrl" className="text-xs font-semibold text-foreground/90">
              Enlace al documento (opcional)
            </Label>
            <Input
              id="documentUrl"
              value={formData.documentUrl ?? ''}
              onChange={(e) => onFormDataChange({ ...formData, documentUrl: e.target.value })}
              placeholder="https://drive.google.com/…"
              className="h-9 rounded-lg border-border/70 text-xs"
            />
          </div>

          {formError && (
            <div
              className={[
                'rounded-lg border border-rose-300/60 bg-rose-50/70 p-2.5 text-xs text-rose-800',
                'dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 shadow-2xs',
              ].join(' ')}
            >
              {formError}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/50 bg-muted/15 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={isSaving}
            className="rounded-lg text-xs font-semibold shadow-2xs"
          >
            {isSaving ? 'Guardando…' : editingProposal ? 'Guardar cambios' : 'Crear propuesta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
