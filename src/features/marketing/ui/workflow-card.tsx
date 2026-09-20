import {
  Clock,
  History,
  Layers,
  MessageSquare,
  Play,
  Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Workflow } from '../api/marketing-api'
import { TRIGGER_TYPES, ACTION_TYPES } from './workflow.constants'

interface WorkflowCardProps {
  workflow: Workflow
  campaignName?: string
  isToggling: boolean
  isRunning: boolean
  onToggle: (id: number) => void
  onDelete: (id: number, name: string) => void
  onRun: (id: number) => void
  onViewHistory: (w: Workflow) => void
}

export function WorkflowCard({
  workflow: w,
  campaignName,
  isToggling,
  isRunning,
  onToggle,
  onDelete,
  onRun,
  onViewHistory,
}: WorkflowCardProps) {
  const triggerInfo = TRIGGER_TYPES.find((t) => t.value === w.triggerType)
  const actionInfo = ACTION_TYPES.find((a) => a.value === w.actionType)
  const ActionIcon = actionInfo?.icon || MessageSquare

  return (
    <Card
      className={`overflow-hidden shadow-sm hover:shadow-md transition-all border ${
        w.active
          ? 'border-l-4 border-l-primary'
          : 'border-l-4 border-l-muted-foreground/40 opacity-75'
      }`}
    >
      <div className="p-4 space-y-3">
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
            {campaignName && (
              <p className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <Layers className="size-3" />
                Campaña: {campaignName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(w.workflowId)}
              disabled={isToggling}
              className={`text-xs px-2.5 h-7 rounded-full font-bold ${
                w.active
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {w.active ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {w.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{w.description}</p>
        )}

        <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs sm:grid-cols-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Disparador</span>
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Clock className="size-3 text-primary" />
              {triggerInfo?.label || w.triggerType}
              {w.noContactDays ? ` (${w.noContactDays}d)` : ''}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Acción</span>
            <p className="font-semibold text-foreground flex items-center gap-1">
              <ActionIcon className="size-3 text-primary" />
              {actionInfo?.label || w.actionType}
            </p>
          </div>
        </div>

        {w.messageTemplate && (
          <div className="rounded-md border bg-card p-2 text-[11px] text-muted-foreground italic">
            "{w.messageTemplate}"
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(w)}
            className="text-xs h-8 gap-1.5"
          >
            <History className="size-3.5" />
            Historial
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(w.workflowId, w.workflowName)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8"
            >
              <Trash2 className="size-3.5" />
            </Button>

            <Button
              size="sm"
              onClick={() => onRun(w.workflowId)}
              disabled={!w.active || isRunning}
              className="text-xs h-8 gap-1.5 font-bold shadow-sm"
            >
              <Play className="size-3 fill-current" />
              {isRunning ? 'Ejecutando…' : 'Ejecutar Ahora'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
