import type { FormEvent } from 'react'
import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import type {
  Campaign,
  CampaignType,
  CampaignStatus,
  CreateCampaignInput,
} from '../api/marketing-api'
import type { MarketingClient } from '../api/clients-api'
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES, clientLabel } from './campaign.constants'

interface CampaignFormDialogProps {
  open: boolean
  editingCampaign: Campaign | null
  formData: CreateCampaignInput
  clients: MarketingClient[]
  clientsLoading: boolean
  isPending: boolean
  onClose: () => void
  onFormDataChange: (data: CreateCampaignInput) => void
  onSubmit: (e: FormEvent) => void
}

export function CampaignFormDialog({
  open,
  editingCampaign,
  formData,
  clients,
  clientsLoading,
  isPending,
  onClose,
  onFormDataChange,
  onSubmit,
}: CampaignFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent size="lg">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogMedia variant="default">
              <Megaphone className="size-5" />
            </DialogMedia>
            <div className="flex flex-col gap-1 text-left min-w-0">
              <DialogTitle>
                {editingCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
              </DialogTitle>
              <DialogDescription>
                Configura los parámetros clave de la estrategia publicitaria
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="campaignClient" className="text-xs font-medium text-foreground/90">
                Cliente *
              </Label>
              <NativeSelect
                id="campaignClient"
                required
                value={formData.clientId}
                disabled={clientsLoading || clients.length === 0}
                onChange={(e) => onFormDataChange({ ...formData, clientId: e.target.value })}
                className="rounded-xl border-border/70 text-xs"
              >
                <option value="">
                  {clientsLoading
                    ? 'Cargando clientes…'
                    : clients.length === 0
                      ? 'No hay clientes sincronizados'
                      : 'Selecciona un cliente'}
                </option>
                {clients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {clientLabel(client)}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaignName" className="text-xs font-medium text-foreground/90">
                Nombre de la Campaña *
              </Label>
              <Input
                id="campaignName"
                required
                placeholder="Ej. Promoción Lanzamiento Q4"
                value={formData.campaignName}
                onChange={(e) => onFormDataChange({ ...formData, campaignName: e.target.value })}
                className="h-9 rounded-xl border-border/70 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="campaignType" className="text-xs font-medium text-foreground/90">
                  Tipo de Campaña
                </Label>
                <NativeSelect
                  id="campaignType"
                  value={formData.campaignType}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      campaignType: e.target.value as CampaignType,
                    })
                  }
                  className="rounded-xl border-border/70 text-xs"
                >
                  {CAMPAIGN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-medium text-foreground/90">
                  Estado
                </Label>
                <NativeSelect
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      status: e.target.value as CampaignStatus,
                    })
                  }
                  className="rounded-xl border-border/70 text-xs"
                >
                  {CAMPAIGN_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="platforms" className="text-xs font-medium text-foreground/90">
                Plataformas y Canales
              </Label>
              <Input
                id="platforms"
                placeholder="Instagram, Facebook, TikTok, Google Ads"
                value={formData.platforms || ''}
                onChange={(e) => onFormDataChange({ ...formData, platforms: e.target.value })}
                className="h-9 rounded-xl border-border/70 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs font-medium text-foreground/90">
                  Fecha de Inicio *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => onFormDataChange({ ...formData, startDate: e.target.value })}
                  className="h-9 rounded-xl border-border/70 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs font-medium text-foreground/90">
                  Fecha de Cierre
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => onFormDataChange({ ...formData, endDate: e.target.value })}
                  className="h-9 rounded-xl border-border/70 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="objective" className="text-xs font-medium text-foreground/90">
                Objetivo Estratégico / KPI
              </Label>
              <Textarea
                id="objective"
                rows={3}
                placeholder="Detalla el objetivo comercial, meta de leads o incremento porcentual…"
                value={formData.objective || ''}
                onChange={(e) => onFormDataChange({ ...formData, objective: e.target.value })}
                className="min-h-24 resize-y rounded-xl border-border/70 text-xs"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || (!editingCampaign && !formData.clientId)}
              className="rounded-xl text-xs font-medium shadow-xs"
            >
              {isPending
                ? 'Guardando…'
                : editingCampaign
                  ? 'Guardar Cambios'
                  : 'Crear Campaña'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
