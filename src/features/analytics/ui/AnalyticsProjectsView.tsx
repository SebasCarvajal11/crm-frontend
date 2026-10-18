import { FolderKanban, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/shared/lib/utils'
import type { ProjectAnalyticsDto, ProjectStatus } from '../model'
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  formatIsoDate,
  formatKpiValue,
  statusLabel,
} from './analytics-labels'
import {
  countProjectsByStatus,
  filterProjects,
  type ProjectStatusFilter,
} from './analytics-projects.utils'

const STATUS_DOT: Record<ProjectStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  in_review: 'bg-amber-500',
  completed: 'bg-emerald-500',
}

export interface AnalyticsProjectsViewProps {
  projects: ProjectAnalyticsDto[]
  isLoading: boolean
  isError: boolean
  statusFilter: ProjectStatusFilter
  onStatusFilterChange: (filter: ProjectStatusFilter) => void
  onRetry: () => void
  isAdmin: boolean
  onSync?: () => void
  isSyncing?: boolean
}

/** Sección "Proyectos" de Analítica: conteo por estado y tabla filtrable. */
export function AnalyticsProjectsView({
  projects,
  isLoading,
  isError,
  statusFilter,
  onStatusFilterChange,
  onRetry,
  isAdmin,
  onSync,
  isSyncing,
}: AnalyticsProjectsViewProps) {
  const counts = countProjectsByStatus(projects)
  const rows = filterProjects(projects, statusFilter)

  return (
    <section
      data-tour="analytics-projects"
      aria-labelledby="analytics-projects-title"
      className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
          <FolderKanban className="size-5" />
        </div>
        <div>
          <h3 id="analytics-projects-title" className="font-semibold">Proyectos</h3>
          <p className="text-xs text-muted-foreground">
            Proyectos sincronizados desde el CRM, con su cliente y lo aprobado del cliente.
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Filtrar proyectos por estado">
        <StatusChip
          label="Todos"
          count={projects.length}
          active={statusFilter === 'all'}
          onClick={() => onStatusFilterChange('all')}
        />
        {PROJECT_STATUSES.map((status) => (
          <StatusChip
            key={status}
            label={PROJECT_STATUS_LABELS[status]}
            count={counts[status]}
            dot={STATUS_DOT[status]}
            active={statusFilter === status}
            onClick={() => onStatusFilterChange(status)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2" role="status" aria-label="Cargando proyectos">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/40 py-8 text-center">
          <XCircle className="mx-auto mb-3 size-9 text-destructive" />
          <p className="font-medium">No se pudieron cargar los proyectos</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center">
          <p className="font-medium">Aún no hay proyectos sincronizados</p>
          {isAdmin && onSync ? (
            <Button size="sm" className="mt-4 gap-1.5" onClick={onSync} disabled={isSyncing}>
              <RefreshCw className={cn('size-3.5', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Sincronizando…' : 'Sincronizar con el CRM'}
            </Button>
          ) : (
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Pida a un administrador que sincronice con el CRM.
            </p>
          )}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center">
          <p className="font-medium">
            Ningún proyecto en estado «{statusLabel(statusFilter)}»
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => onStatusFilterChange('all')}>
            Ver todos
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="text-right">Aprobado del cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.projectId}>
                  <TableCell className="max-w-[16rem] truncate font-medium" title={p.name ?? undefined}>
                    {p.name || '—'}
                  </TableCell>
                  <TableCell className="max-w-[12rem] truncate text-muted-foreground">
                    {p.clientName || 'Sin cliente'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <span
                        className={cn(
                          'size-2 rounded-full',
                          p.status && p.status in STATUS_DOT
                            ? STATUS_DOT[p.status as ProjectStatus]
                            : 'bg-muted-foreground/40'
                        )}
                        aria-hidden="true"
                      />
                      {statusLabel(p.status)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatIsoDate(p.updatedAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
                    {formatKpiValue(p.approvedProposalsValue ?? 0, 'moneda')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

function StatusChip({
  label,
  count,
  active,
  dot,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  dot?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        active
          ? 'border-primary/40 bg-primary/5 text-foreground'
          : 'border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/40'
      )}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
        {dot && <span className={cn('size-2 rounded-full', dot)} aria-hidden="true" />}
        {label}
      </span>
      <span className="text-xl font-extrabold tabular-nums text-foreground">{count}</span>
    </button>
  )
}
