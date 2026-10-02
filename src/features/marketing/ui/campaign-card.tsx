import {
  Calendar,
  Edit2,
  Layers,
  MoreVertical,
  Share2,
  Tag,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Campaign } from '../api/marketing-api'
import { CAMPAIGN_STATUSES, CAMPAIGN_TYPES } from './campaign.constants'

function fechaCorta(iso?: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface CampaignCardProps {
  campaign: Campaign
  clientName?: string
  onEdit: (c: Campaign) => void
  onDelete: (id: number) => void
  onSelectForWorkflows?: (campaignId: number) => void
}

function CampaignCardMenu({
  campaign,
  onEdit,
  onDelete,
}: {
  campaign: Campaign
  onEdit: (c: Campaign) => void
  onDelete: (id: number) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(campaign)} className="gap-2">
          <Edit2 className="size-3.5" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(campaign.campaignId)}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="size-3.5" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CampaignCardHeader({
  campaign,
  clientName,
  onEdit,
  onDelete,
}: {
  campaign: Campaign
  clientName?: string
  onEdit: (c: Campaign) => void
  onDelete: (id: number) => void
}) {
  const statusMeta = CAMPAIGN_STATUSES.find((s) => s.value === campaign.status)

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <Badge variant={statusMeta?.badge || 'outline'} className="text-[10px] uppercase">
            {statusMeta?.label || campaign.status}
          </Badge>
          <CardTitle className="text-base font-bold leading-tight">
            {campaign.campaignName}
          </CardTitle>
        </div>
        <CampaignCardMenu campaign={campaign} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <CardDescription className="text-xs">
        Cliente: {campaign.clientId ? (clientName ?? 'Cliente del CRM') : 'General'}
      </CardDescription>
    </CardHeader>
  )
}

function CampaignCardBody({ campaign }: { campaign: Campaign }) {
  const typeLabel =
    CAMPAIGN_TYPES.find((t) => t.value === campaign.campaignType)?.label ?? campaign.campaignType

  return (
    <CardContent className="space-y-2.5 text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Tag className="size-3 text-primary shrink-0" />
        <span>Tipo: {typeLabel}</span>
      </div>

      {campaign.objective && (
        <p className="line-clamp-2 text-muted-foreground">
          <span className="font-semibold text-foreground">Objetivo: </span>
          {campaign.objective}
        </p>
      )}

      <div className="space-y-1.5 pt-1">
        {campaign.platforms && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Share2 className="size-3 text-primary shrink-0" />
            <span className="truncate font-medium text-foreground">{campaign.platforms}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="size-3 text-zinc-500 shrink-0" />
          <span>
            {fechaCorta(campaign.startDate)}{' '}
            {campaign.endDate ? `hasta ${fechaCorta(campaign.endDate)}` : '(En curso)'}
          </span>
        </div>
      </div>
    </CardContent>
  )
}

function CampaignCardFooter({
  campaignId,
  onSelectForWorkflows,
}: {
  campaignId: number
  onSelectForWorkflows?: (id: number) => void
}) {
  return (
    <div className="border-t bg-muted/10 p-3 px-4 flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground tabular-nums">Campaña #{campaignId}</span>
      {onSelectForWorkflows && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectForWorkflows(campaignId)}
          className="text-xs h-7 gap-1 font-semibold text-primary hover:text-primary hover:bg-primary/10"
        >
          <Layers className="size-3" />
          Automatizar
        </Button>
      )}
    </div>
  )
}

export function CampaignCard(props: CampaignCardProps) {
  const { campaign, clientName, onEdit, onDelete, onSelectForWorkflows } = props

  return (
    <Card className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200">
      <div>
        <CampaignCardHeader
          campaign={campaign}
          clientName={clientName}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <CampaignCardBody campaign={campaign} />
      </div>

      <CampaignCardFooter
        campaignId={campaign.campaignId}
        onSelectForWorkflows={onSelectForWorkflows}
      />
    </Card>
  )
}
