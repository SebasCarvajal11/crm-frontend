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
import { CAMPAIGN_STATUSES } from './campaign.constants'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (c: Campaign) => void
  onDelete: (id: number) => void
  onSelectForWorkflows?: (campaignId: number) => void
}

export function CampaignCard({
  campaign: c,
  onEdit,
  onDelete,
  onSelectForWorkflows,
}: CampaignCardProps) {
  const statusMeta = CAMPAIGN_STATUSES.find((s) => s.value === c.status)

  return (
    <Card className="flex flex-col justify-between overflow-hidden interactive-card">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <Badge variant={statusMeta?.badge || 'outline'} className="text-[10px] uppercase">
                {statusMeta?.label || c.status}
              </Badge>
              <CardTitle className="text-base font-bold leading-tight">
                {c.campaignName}
              </CardTitle>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(c)} className="gap-2">
                  <Edit2 className="size-3.5" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(c.campaignId)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardDescription className="text-xs">
            Cliente: {c.clientId ? c.clientId.slice(0, 12) + '…' : 'General'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Tag className="size-3 text-primary shrink-0" />
            <span>Tipo: {c.campaignType}</span>
          </div>

          {c.objective && (
            <p className="line-clamp-2 text-muted-foreground">
              <span className="font-semibold text-foreground">Objetivo: </span>
              {c.objective}
            </p>
          )}

          <div className="space-y-1.5 pt-1">
            {c.platforms && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Share2 className="size-3 text-primary shrink-0" />
                <span className="truncate font-medium text-foreground">{c.platforms}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3 text-zinc-500 shrink-0" />
              <span>
                {c.startDate} {c.endDate ? `hasta ${c.endDate}` : '(En curso)'}
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="border-t bg-muted/10 p-3 px-4 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">ID #{c.campaignId}</span>
        {onSelectForWorkflows && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectForWorkflows(c.campaignId)}
            className="text-xs h-7 gap-1 font-semibold text-primary hover:text-primary hover:bg-primary/10"
          >
            <Layers className="size-3" />
            Automatizar
          </Button>
        )}
      </div>
    </Card>
  )
}
