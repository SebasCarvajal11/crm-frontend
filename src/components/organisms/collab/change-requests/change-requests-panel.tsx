import { useMemo, useState } from 'react'
import { GitPullRequest, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ChangeRequestCard } from './change-request-card'
import { CreateChangeRequestModal } from './create-change-request-modal'
import { ResolveChangeRequestModal } from './resolve-change-request-modal'
import type { MeResponse } from '@/shared/types'
import type { ProjectChangeRequest, ProjectMember, ProjectTask } from '@/features/collab/model'

type Props = {
  accessToken: string
  projectId: string
  identity: MeResponse['data']
  tasks: ProjectTask[]
  members: ProjectMember[]
  changeRequests: ProjectChangeRequest[]
  isLoading: boolean
  onRefresh: () => void
  onError: (msg: string) => void
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

export function ChangeRequestsPanel({
  accessToken,
  projectId,
  identity,
  tasks,
  members,
  changeRequests,
  isLoading,
  onRefresh,
}: Props) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [resolveTarget, setResolveTarget] = useState<{
    request: ProjectChangeRequest
    action: 'accept' | 'reject'
  } | null>(null)

  const isClient = identity.role === 'client'
  const isAdmin = identity.role === 'admin'

  const counts = useMemo(() => {
    return {
      all: changeRequests.length,
      pending: changeRequests.filter((r) => r.status === 'open').length,
      approved: changeRequests.filter((r) => r.status === 'accepted' || r.status === 'approved').length,
      rejected: changeRequests.filter((r) => r.status === 'rejected').length,
    }
  }, [changeRequests])

  const filteredRequests = useMemo(() => {
    if (filter === 'pending') return changeRequests.filter((r) => r.status === 'open')
    if (filter === 'approved') return changeRequests.filter((r) => r.status === 'accepted' || r.status === 'approved')
    if (filter === 'rejected') return changeRequests.filter((r) => r.status === 'rejected')
    return changeRequests
  }, [changeRequests, filter])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div
        data-tour="workspace-change-requests-action"
        className={[
          'flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4.5 shadow-2xs',
          'sm:flex-row sm:items-center sm:justify-between',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs',
            ].join(' ')}
          >
            <GitPullRequest className="size-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground tracking-tight">Solicitudes de cambio</h3>
              <Badge variant="secondary" className="text-xs font-semibold border border-border/60">
                {changeRequests.length} {changeRequests.length === 1 ? 'solicitud' : 'solicitudes'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isClient
                ? 'Puedes solicitar ajustes puntuales o cambios de alcance. Un administrador evaluará tu petición.'
                : isAdmin
                  ? 'Revisa, aprueba o rechaza los requerimientos de cambio solicitados por el cliente.'
                  : 'Visualización de requerimientos y cambios solicitados en el proyecto.'}
            </p>
          </div>
        </div>

        {isClient && (
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5 text-xs rounded-lg self-start sm:self-auto shadow-2xs font-semibold"
          >
            <Plus className="size-3.5" />
            Solicitar cambio
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="h-8 rounded-lg text-xs gap-1.5 font-medium transition-all"
        >
          Todas
          <span className="ml-1 rounded-full bg-background/25 px-1.5 py-0.5 text-[10px] font-bold">{counts.all}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className="h-8 rounded-lg text-xs gap-1.5 font-medium transition-all"
        >
          Pendientes
          <span className="ml-1 rounded-full bg-background/25 px-1.5 py-0.5 text-[10px] font-bold">
            {counts.pending}
          </span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
          className="h-8 rounded-lg text-xs gap-1.5 font-medium transition-all"
        >
          Aprobadas
          <span className="ml-1 rounded-full bg-background/25 px-1.5 py-0.5 text-[10px] font-bold">
            {counts.approved}
          </span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
          className="h-8 rounded-lg text-xs gap-1.5 font-medium transition-all"
        >
          Rechazadas
          <span className="ml-1 rounded-full bg-background/25 px-1.5 py-0.5 text-[10px] font-bold">
            {counts.rejected}
          </span>
        </Button>
      </div>

      <div data-tour="workspace-change-requests-list">
        {isLoading ? (
          <div className="space-y-3" role="status" aria-label="Cargando solicitudes de cambio">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div
            className={[
              'flex flex-col items-center justify-center rounded-xl border border-dashed',
              'border-border/80 bg-card/40 py-14 px-4 text-center',
            ].join(' ')}
          >
            <div
              className={[
                'flex size-11 items-center justify-center rounded-xl bg-muted/60',
                'text-muted-foreground mb-3 ring-1 ring-border/50',
              ].join(' ')}
            >
              <GitPullRequest className="size-5 text-muted-foreground/80" />
            </div>
            <h4 className="text-sm font-bold text-foreground">No hay solicitudes de cambio</h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              {filter !== 'all'
                ? 'No se encontraron solicitudes con el filtro seleccionado.'
                : isClient
                  ? 'Si necesitas algún cambio o ajuste en el proyecto, pulsa en "Solicitar cambio" para crearlo.'
                  : 'El cliente aún no ha registrado solicitudes de cambio para este proyecto.'}
            </p>
            {isClient && filter === 'all' && (
              <Button
                type="button"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="mt-4 gap-1.5 text-xs rounded-lg shadow-2xs font-semibold"
              >
                <Plus className="size-3.5" />
                Solicitar cambio ahora
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <ChangeRequestCard
                key={req.id}
                request={req}
                isAdmin={isAdmin}
                members={members}
                tasks={tasks}
                onAccept={(r) => setResolveTarget({ request: r, action: 'accept' })}
                onReject={(r) => setResolveTarget({ request: r, action: 'reject' })}
              />
            ))}
          </div>
        )}
      </div>

      {isClient && (
        <CreateChangeRequestModal
          open={createModalOpen}
          accessToken={accessToken}
          projectId={projectId}
          tasks={tasks}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={onRefresh}
        />
      )}

      {isAdmin && (
        <ResolveChangeRequestModal
          open={resolveTarget !== null}
          accessToken={accessToken}
          projectId={projectId}
          changeRequest={resolveTarget?.request ?? null}
          action={resolveTarget?.action ?? null}
          onClose={() => setResolveTarget(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  )
}
