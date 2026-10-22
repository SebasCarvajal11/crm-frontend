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
import type { SavedSegment } from '../api/segments-api'
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES, clientLabel } from './campaign.constants'
import { AUDIENCE_OPTIONS, clientCountLabel, validateAudience } from './audience.utils'
import { cn } from '@/shared/lib/utils'

interface CampaignFormDialogProps {
  open: boolean
  editingCampaign: Campaign | null
  formData: CreateCampaignInput
  clients: MarketingClient[]
  clientsLoading: boolean
  /** Segmentos guardados (se ofrecen los activos y el que ya tenga la campaña). */
  segments?: SavedSegment[]
  segmentsLoading?: boolean
  error?: string | null
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
  segments = [],
  segmentsLoading = false,
  error,
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
            <CampaignAudienceFields
              formData={formData}
              clients={clients}
              clientsLoading={clientsLoading}
              segments={segments}
              segmentsLoading={segmentsLoading}
              onFormDataChange={onFormDataChange}
            />

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
            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || validateAudience(formData) !== null}
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

/** Pregunta "¿A quién va dirigida?" (exportada para probarla sin el diálogo). */
export function CampaignAudienceFields({
  formData,
  clients,
  clientsLoading,
  segments,
  segmentsLoading,
  onFormDataChange,
}: {
  formData: CreateCampaignInput
  clients: MarketingClient[]
  clientsLoading: boolean
  segments: SavedSegment[]
  segmentsLoading: boolean
  onFormDataChange: (data: CreateCampaignInput) => void
}) {
  const type = formData.audienceType ?? 'CLIENT'
  const options = segments.filter((s) => s.active || s.segmentId === formData.segmentId)
  const selected = options.find((s) => s.segmentId === formData.segmentId)

  return (
    <fieldset className="space-y-2" data-testid="campaign-audience-fields">
      <legend className="mb-1.5 text-xs font-medium text-foreground/90">¿A quién va dirigida? *</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="¿A quién va dirigida?">
        {AUDIENCE_OPTIONS.map((o) => {
          const checked = type === o.value
          return (
            <label
              key={o.value}
              className={cn(
                'flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 transition-colors',
                checked ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-primary/40'
              )}
            >
              <input
                type="radio"
                name="audienceType"
                value={o.value}
                checked={checked}
                onChange={() => onFormDataChange({ ...formData, audienceType: o.value })}
                className="mt-0.5 accent-primary"
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold">{o.label}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">{o.help}</span>
              </span>
            </label>
          )
        })}
      </div>

      {type === 'CLIENT' && (
        <div className="space-y-1.5">
          <Label htmlFor="campaignClient" className="text-xs font-medium text-foreground/90">
            Cliente *
          </Label>
          <NativeSelect
            id="campaignClient"
            required
            value={formData.clientId ?? ''}
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
      )}

      {type === 'SEGMENT' && (
        <div className="space-y-1.5">
          <Label htmlFor="campaignSegment" className="text-xs font-medium text-foreground/90">
            Segmento guardado *
          </Label>
          <NativeSelect
            id="campaignSegment"
            required
            value={formData.segmentId ?? ''}
            disabled={segmentsLoading || options.length === 0}
            onChange={(e) => onFormDataChange({ ...formData, segmentId: e.target.value || null })}
            className="rounded-xl border-border/70 text-xs"
          >
            <option value="">
              {segmentsLoading
                ? 'Cargando segmentos…'
                : options.length === 0
                  ? 'No hay segmentos guardados activos'
                  : 'Selecciona un segmento'}
            </option>
            {options.map((s) => (
              <option key={s.segmentId} value={s.segmentId}>
                {s.name} · {clientCountLabel(s.clientCount)}
                {s.active ? '' : ' (inactivo)'}
              </option>
            ))}
          </NativeSelect>
          <p className="text-[11px] text-muted-foreground">
            {options.length === 0 && !segmentsLoading
              ? 'Cree uno en la pestaña Segmentos con "Guardar como segmento".'
              : selected?.description?.trim() ||
                'La audiencia se recalcula cada día: entran los clientes que cumplan el criterio.'}
          </p>
        </div>
      )}

      {type === 'ALL' && (
        <p className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          {clients.length > 0
            ? `Le llegará a todos los clientes (hoy ${clientCountLabel(clients.length)}).`
            : 'Le llegará a todos los clientes de marketing.'}
        </p>
      )}
    </fieldset>
  )
}
