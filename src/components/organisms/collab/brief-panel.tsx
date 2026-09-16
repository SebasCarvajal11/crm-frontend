import { useState, useMemo } from 'react'
import { CheckCircle2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectChangeRequest } from '@/features/collab/model'
import { COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS } from './collab-workspace-layout'
import { ChangeRequestItemCard, formatBogotaDate } from './brief-change-request-card'

type BriefData = {
  projectId: string
  content: string
  updatedBySub: string
  updatedAt: string
} | null

type Props = {
  brief: BriefData
  changeRequests?: ProjectChangeRequest[]
  formalChanges?: Array<{ id: string; status: string; title: string; createdAt: string }>
  isLoading: boolean
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

function BriefContentView({ brief }: { brief: BriefData }) {
  return (
    <div
      className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm`}
      role="region"
      aria-label="Brief del proyecto"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Brief del Proyecto</h3>
          {brief && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Actualizado: {formatBogotaDate(brief.updatedAt)}
            </p>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth scrollbar-thin p-5">
        {brief?.content ? (
          <div className="break-words whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {brief.content}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-10 opacity-20" aria-hidden="true" />
            <p>Sin brief configurado para este proyecto.</p>
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
      className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm`}
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
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground p-6 text-center">
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

/** Organismo: panel de brief del proyecto y registro histórico de cambios formales. */
export function BriefPanel({ brief, changeRequests, formalChanges, isLoading }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all')

  const normalizedItems: ProjectChangeRequest[] = useMemo(() => {
    if (changeRequests && changeRequests.length > 0) return changeRequests
    if (formalChanges && formalChanges.length > 0) {
      return formalChanges.map((fc) => ({
        id: fc.id,
        projectId: brief?.projectId ?? '',
        taskId: null,
        type: 'formal' as const,
        status: fc.status === 'approved' ? ('accepted' as const) : ('open' as const),
        priority: 'medium' as const,
        requestedBySub: '',
        resolvedBySub: null,
        title: fc.title,
        description: fc.title,
        justification: null,
        resolutionComment: null,
        createdAt: fc.createdAt,
        resolvedAt: null,
      }))
    }
    return []
  }, [changeRequests, formalChanges, brief?.projectId])

  if (isLoading) {
    return (
      <div
        className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} items-center justify-center rounded-xl border bg-card shadow-sm`}
        role="status"
        aria-label="Cargando brief"
      >
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_minmax(22rem,0.65fr)]">
      <BriefContentView brief={brief} />
      <ChangeRequestsSidebar
        items={normalizedItems}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  )
}
