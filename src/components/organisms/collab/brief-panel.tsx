import { useState, useMemo } from 'react'
import { CheckCircle2, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProjectChangeRequest } from '@/features/collab/model'
import { ChangeRequestItemCard } from './brief-change-request-card'
import { formatBogotaDate } from '@/features/collab/utils/collab-date'
import { BriefMarkdown } from './brief-markdown'

type BriefData = {
  projectId: string
  content: string
  updatedBySub: string
  updatedAt: string
} | null

type Props = {
  brief: BriefData
  changeRequests?: ProjectChangeRequest[]
  formalChanges?: ProjectChangeRequest[]
  isLoading: boolean
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

function BriefContentView({ brief }: { brief: BriefData }) {
  return (
    <div
      data-tour="workspace-brief-content"
      className="flex h-full min-h-0 flex-1 min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
      role="region"
      aria-label="Brief del proyecto"
    >
      <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Brief del Proyecto</h3>
            <Badge
              variant="outline"
              className="text-[10px] gap-1 py-0 h-4 border-primary/30 text-primary bg-primary/5"
            >
              <Sparkles className="size-2.5" />
              Documento Oficial
            </Badge>
          </div>
          {brief && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Actualizado: {formatBogotaDate(brief.updatedAt)}
            </p>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth scrollbar-thin p-5 sm:p-7">
        {brief?.content ? (
          <BriefMarkdown content={brief.content} />
        ) : (
          <div
            className={[
              'flex h-full min-h-[300px] flex-col items-center justify-center',
              'gap-2.5 p-6 text-center text-muted-foreground',
            ].join(' ')}
          >
            <FileText className="size-12 opacity-25 text-muted-foreground" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-foreground">Sin brief configurado</h4>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Este proyecto aún no cuenta con especificaciones o requerimientos registrados.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ChangeRequestsSidebar({
  items,
  filter,
  onFilterChange,
}: {
  items: ProjectChangeRequest[]
  filter: StatusFilter
  onFilterChange: (filter: StatusFilter) => void
}) {
  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((i) => i.status === 'open').length,
      approved: items.filter((i) => i.status === 'accepted' || i.status === 'approved').length,
      rejected: items.filter((i) => i.status === 'rejected').length,
    }),
    [items],
  )

  const filtered = useMemo(() => {
    if (filter === 'pending') return items.filter((i) => i.status === 'open')
    if (filter === 'approved')
      return items.filter((i) => i.status === 'accepted' || i.status === 'approved')
    if (filter === 'rejected') return items.filter((i) => i.status === 'rejected')
    return items
  }, [items, filter])

  return (
    <div
      data-tour="workspace-brief-changes"
      className="flex h-full min-h-0 flex-1 min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
      role="region"
      aria-label="Historial de cambios formales"
    >
      <div className="border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Cambios Formales</h3>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Historial y trazabilidad de solicitudes de cambio</p>

        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'ghost'}
            className="h-6 text-[11px] px-2"
            onClick={() => onFilterChange('all')}
          >
            Todos ({counts.all})
          </Button>
          <Button
            size="sm"
            variant={filter === 'pending' ? 'default' : 'ghost'}
            className="h-6 text-[11px] px-2"
            onClick={() => onFilterChange('pending')}
          >
            Pendientes ({counts.pending})
          </Button>
          <Button
            size="sm"
            variant={filter === 'approved' ? 'default' : 'ghost'}
            className="h-6 text-[11px] px-2"
            onClick={() => onFilterChange('approved')}
          >
            Aprobados ({counts.approved})
          </Button>
          <Button
            size="sm"
            variant={filter === 'rejected' ? 'default' : 'ghost'}
            className="h-6 text-[11px] px-2"
            onClick={() => onFilterChange('rejected')}
          >
            Rechazados ({counts.rejected})
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth scrollbar-thin p-3">
        {filtered.length === 0 ? (
          <div
            className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground p-6 text-center"
          >
            <CheckCircle2 className="size-8 opacity-20" aria-hidden="true" />
            <p className="text-xs font-medium">Sin cambios en esta categoría.</p>
            <p className="text-[11px] text-muted-foreground/80">
              Las solicitudes de cambio realizadas se registrarán aquí para auditoría.
            </p>
          </div>
        ) : (
          <ol className="space-y-2.5" aria-label="Lista de cambios formales">
            {filtered.map((item) => (
              <ChangeRequestItemCard key={item.id} item={item} />
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

function BriefSkeleton() {
  return (
    <div
      className={[
        'grid flex-1 min-h-0 h-full gap-4',
        'min-h-[520px] lg:min-h-[580px]',
        'min-[1280px]:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]',
      ].join(' ')}
      role="status"
      aria-label="Cargando brief"
    >
      <div
        className="flex h-full min-h-[500px] flex-col rounded-xl border bg-card p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <div className="pt-4 space-y-3">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
      <div className="flex h-full min-h-[500px] flex-col rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-2 pb-1">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  )
}

/** Organismo: panel de brief del proyecto y registro histórico de cambios formales. */
export function BriefPanel({ brief, changeRequests, formalChanges, isLoading }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all')

  const normalizedItems: ProjectChangeRequest[] = useMemo(() => {
    if (changeRequests && changeRequests.length > 0) return changeRequests
    if (formalChanges && formalChanges.length > 0) return formalChanges
    return []
  }, [changeRequests, formalChanges])

  if (isLoading) {
    return <BriefSkeleton />
  }

  return (
    <div
      className={[
        'grid flex-1 min-h-0 h-full gap-4',
        'min-h-[520px] lg:min-h-[580px]',
        'min-[1280px]:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]',
      ].join(' ')}
    >
      <BriefContentView brief={brief} />
      <ChangeRequestsSidebar
        items={normalizedItems}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  )
}
