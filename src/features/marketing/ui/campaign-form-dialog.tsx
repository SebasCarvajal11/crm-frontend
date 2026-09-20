import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
      <DialogContent className="max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-foreground">
              {editingCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configura los parámetros clave de la estrategia publicitaria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <Label htmlFor="campaignClient" className="text-xs font-semibold">
                Cliente *
              </Label>
              <NativeSelect
                id="campaignClient"
                required
                value={formData.clientId}
                disabled={clientsLoading || clients.length === 0}
                onChange={(e) => onFormDataChange({ ...formData, clientId: e.target.value })}
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

            <div>
              <Label htmlFor="campaignName" className="text-xs font-semibold">
                Nombre de la Campaña *
              </Label>
              <Input
                id="campaignName"
                required
                placeholder="Ej. Promoción Lanzamiento Q4"
                value={formData.campaignName}
                onChange={(e) => onFormDataChange({ ...formData, campaignName: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="campaignType" className="text-xs font-semibold">
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
                >
                  {CAMPAIGN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div>
                <Label htmlFor="status" className="text-xs font-semibold">
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
                >
                  {CAMPAIGN_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div>
              <Label htmlFor="platforms" className="text-xs font-semibold">
                Plataformas y Canales
              </Label>
              <Input
                id="platforms"
                placeholder="Instagram, Facebook, TikTok, Google Ads"
                value={formData.platforms || ''}
                onChange={(e) => onFormDataChange({ ...formData, platforms: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate" className="text-xs font-semibold">
                  Fecha de Inicio *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => onFormDataChange({ ...formData, startDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs font-semibold">
                  Fecha de Cierre
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => onFormDataChange({ ...formData, endDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="objective" className="text-xs font-semibold">
                Objetivo Estratégico / KPI
              </Label>
              <Textarea
                id="objective"
                rows={3}
                placeholder="Detalla el objetivo comercial, meta de leads o incremento porcentual…"
                value={formData.objective || ''}
                onChange={(e) => onFormDataChange({ ...formData, objective: e.target.value })}
                className="mt-1 min-h-24 resize-y text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || (!editingCampaign && !formData.clientId)}
              className="font-semibold"
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
