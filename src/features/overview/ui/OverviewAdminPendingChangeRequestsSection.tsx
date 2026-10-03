import { Clock, ExternalLink, GitPullRequest, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { AdminPendingChangeRequestItem } from '../model/overview.types'

type Props = {
  items: AdminPendingChangeRequestItem[]
  isLoading: boolean
  onOpenProject?: (projectId: string) => void
}

function formatBogotaDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false,
    })
  } catch {
    return '—'
  }
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: {
    label: 'Urgente',
    className: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-semibold',
  },
  high: {
    label: 'Alta',
    className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  },
  medium: {
    label: 'Media',
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300',
  },
  low: {
    label: 'Baja',
    className: 'bg-muted text-muted-foreground border-border',
  },
}

function PendingChangeCard({
  item,
  onOpenProject,
}: {
  item: AdminPendingChangeRequestItem
  onOpenProject?: (projectId: string) => void
}) {
  const priorityMeta = priorityConfig[item.priority ?? 'medium'] ?? priorityConfig.medium

  return (
    <div
      className={[
        'overview-row flex flex-col justify-between gap-3 p-3.5',
        'sm:flex-row sm:items-center',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-primary">{item.projectName}</span>
          {item.clientName && (
            <span className="text-xs text-muted-foreground font-medium">({item.clientName})</span>
          )}
          <Badge variant="outline" className={`text-[10px] ${priorityMeta.className}`}>{priorityMeta.label}</Badge>
          <Badge variant="secondary" className="text-[10px] font-normal">
            {item.type === 'formal' ? 'Cambio formal' : 'Cambio menor'}
          </Badge>
        </div>

        <p className="text-sm font-semibold tracking-tight text-foreground line-clamp-1">
          {item.title}
        </p>

        <p className="text-xs text-muted-foreground line-clamp-1">
          {item.description}
        </p>

        <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          <span>Solicitada: {formatBogotaDate(item.createdAt)}</span>
        </div>
      </div>

      {onOpenProject && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenProject(item.projectId)}
          className={cn(
            "shrink-0 gap-1.5 text-xs border-amber-300/80 hover:bg-amber-50",
            "dark:border-amber-800 dark:hover:bg-amber-950/40 group/btn"
          )}
        >
          Revisar
          <ExternalLink
            className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5"
          />
        </Button>
      )}
    </div>
  )
}

export function OverviewAdminPendingChangeRequestsSection({
  items,
  isLoading,
  onOpenProject,
}: Props) {
  return (
    <Card
      className={cn(
        "overview-panel overview-panel-attention h-full flex flex-col",
        "justify-between min-w-0 w-full max-w-full overflow-hidden"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3 min-w-0 w-full">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <GitPullRequest className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <CardTitle className="text-base font-bold text-foreground">
              Cambios en aprobación
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Solicitudes de cambio abiertas que requieren revisión y decisión del administrador.
          </CardDescription>
        </div>
        {items.length > 0 && (
          <Badge
            variant="outline"
            className={cn(
              "border-amber-300 bg-amber-100/70 text-amber-800 text-xs",
              "font-semibold shrink-0 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            )}
          >
            {items.length} {items.length === 1 ? 'pendiente' : 'pendientes'}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between gap-3 min-w-0 w-full">
        {isLoading ? (
          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : items.length === 0 ? (
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center rounded-lg border",
              "border-dashed border-emerald-500/30 bg-emerald-500/[0.03] py-7 text-center"
            )}
          >
            <ShieldAlert className="size-7 text-emerald-500/80 mb-1.5 opacity-60" />
            <p className="text-sm font-medium text-foreground">Sin solicitudes pendientes</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Todos los requerimientos de cambio se encuentran revisados y resueltos.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto scroll-smooth scrollbar-thin pr-1 flex-1">
            {items.map((item) => (
              <PendingChangeCard
                key={item.id}
                item={item}
                onOpenProject={onOpenProject}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
