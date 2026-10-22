import {
  AlertTriangle,
  Clock,
  Eye,
  History,
  Layers,
  MessageSquare,
  Play,
  Trash2,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Campaign, Workflow } from '../api/marketing-api'
import { ACTION_TYPES } from './workflow.constants'
import { audienceReach, campaignRunsToday } from './audience.utils'
import { triggerSummary } from './workflow.utils'

interface WorkflowCardProps {
  workflow: Workflow
  campaignName?: string
  /** Campaña completa: muestra la audiencia y avisa si está inactiva o fuera de fechas. */
  campaign?: Campaign | null
  /** Nombre del cliente cuando la audiencia es un solo cliente. */
  clientName?: string | null
  isToggling: boolean
  isRunning: boolean
  onToggle: (id: number) => void
  onDelete: (id: number, name: string) => void
  onRun: (id: number) => void
  onViewHistory: (w: Workflow) => void
  onPreview?: (w: Workflow) => void
}

export function WorkflowCard({
  workflow: w,
  campaignName,
  campaign,
  clientName,
  isToggling,
  isRunning,
  onToggle,
  onDelete,
  onRun,
  onViewHistory,
  onPreview,
}: WorkflowCardProps) {
  const runs = campaign ? campaignRunsToday(campaign) : null
  const actionInfo = ACTION_TYPES.find((a) => a.value === w.actionType)
  const ActionIcon = actionInfo?.icon || MessageSquare

  return (
    <Card
      className={[
        'overflow-hidden rounded-2xl shadow-xs transition-all duration-200 border border-border/80',
        w.active
          ? 'hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md bg-card'
          : 'opacity-75 bg-muted/15',
      ].join(' ')}
    >
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground leading-tight">
                {w.workflowName}
              </h3>
              <Badge
                variant={w.active ? 'default' : 'secondary'}
                className="text-[10px] uppercase font-bold"
              >
                {w.active ? 'Activo' : 'Pausado'}
              </Badge>
            </div>
            {(campaign?.campaignName ?? campaignName) && (
              <p className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <Layers className="size-3" />
                Campaña: {campaign?.campaignName ?? campaignName}
              </p>
            )}
            {campaign && (
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground" data-testid="workflow-card-audience">
                <Users className="size-3" />
                Le llegará a: {audienceReach(campaign, clientName)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(w.workflowId)}
              disabled={isToggling}
              className={[
                'text-xs px-3 h-7 rounded-full font-bold shadow-2xs transition-all',
                w.active
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              ].join(' ')}
            >
              {w.active ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {runs && !runs.ok && (
          <p
            className="flex items-start gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-800 dark:text-amber-300"
            data-testid="workflow-card-warning"
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {runs.reason}
          </p>
        )}

        {w.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{w.description}</p>
        )}

        <div
          className={[
            'grid grid-cols-1 gap-2.5 rounded-xl border border-border/50 bg-muted/20 p-3',
            'text-xs sm:grid-cols-2',
          ].join(' ')}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Disparador</span>
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span data-testid="workflow-trigger">{triggerSummary(w)}</span>
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Acción</span>
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ActionIcon className="size-3.5 text-primary" />
              {actionInfo?.label || w.actionType}
            </p>
          </div>
        </div>

        {w.messageTemplate && (
          <div
            className={[
              'rounded-xl border border-border/60 bg-background/80 p-2.5 text-xs',
              'text-muted-foreground italic leading-relaxed',
            ].join(' ')}
          >
            "{w.messageTemplate}"
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {onPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(w)}
                className="text-xs h-8 gap-1.5 rounded-lg"
                data-tour="marketing-workflow-preview-btn"
              >
                <Eye className="size-3.5" />
                Ver a quién le llegaría
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewHistory(w)}
              className="text-xs h-8 gap-1.5 rounded-lg"
            >
              <History className="size-3.5" />
              Historial
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(w.workflowId, w.workflowName)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8 rounded-lg"
              aria-label={`Eliminar ${w.workflowName}`}
            >
              <Trash2 className="size-3.5" />
            </Button>

            <Button
              size="sm"
              onClick={() => onRun(w.workflowId)}
              disabled={!w.active || isRunning}
              title={w.active ? undefined : 'Active la automatización para ejecutarla'}
              className="text-xs h-8 gap-1.5 font-bold shadow-xs rounded-lg"
              data-tour="marketing-workflow-run-btn"
            >
              <Play className="size-3 fill-current" />
              {isRunning ? 'Ejecutando…' : 'Ejecutar ahora'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
