/**
 * Panel de Colaboracion — entry point del modulo kanban.
 * Renderiza el tablero padre (proyectos) o el workspace hijo (proyecto abierto).
 * Usa la URL como fuente unica de verdad para el proyecto abierto.
 */
import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { KanbanSquare, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/molecules/page-header'
import { cn } from '@/shared/lib/utils'
import { listProjectsRequest, searchProjectsRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { PARENT_COLUMNS } from './collab/collab.config'
import { ProjectCard } from './collab/project-card'
import { ProjectSearchInput } from './collab/project-search-input'
import { ProjectStatsSummary } from './collab/project-stats-summary'
import { ProjectWorkspace } from './collab/project-workspace'
import { CreateProjectModal } from './collab/create-project-modal'
import type { ProjectListItem, ParentProjectStatus } from '@/features/collab/model'
import type { MeResponse } from '@/shared/types'


type Props = {
  accessToken: string
  identity: MeResponse['data']
  initialProjects?: ProjectListItem[]
  openProjectId?: string
  workspaceTab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
  chatChannel?: 'internal' | 'external'
  chatMessageId?: string
  taskId?: string
  onOpenProject: (projectId: string) => void
  onCloseProject: () => void
  onTabChange: (tab: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members') => void
}

export function CollabPanel({
  accessToken,
  identity,
  initialProjects,
  openProjectId,
  workspaceTab,
  chatChannel,
  chatMessageId,
  taskId,
  onOpenProject,
  onCloseProject,
  onTabChange,
}: Props) {
  const [showModal, setShowModal] = useState(false)
  const [projectSearchDebounced, setProjectSearchDebounced] = useState('')

  const canCreate = identity.role === 'admin'
  const canSearchByClient = identity.role === 'admin' || identity.role === 'worker'

  const projectsQ = useQuery({
    queryKey: collabKeys.projects(),
    queryFn: () => listProjectsRequest(accessToken, { page: 1, limit: 100 }),
    initialData: initialProjects
      ? {
          data: {
            items: initialProjects,
            page: 1,
            limit: initialProjects.length || 1,
            total: initialProjects.length,
            total_pages: 1,
          },
        }
      : undefined,
  })
  const projects = useMemo(() => projectsQ.data?.data.items ?? [], [projectsQ.data])

  const handleDebouncedChange = useCallback((value: string) => {
    setProjectSearchDebounced(value)
  }, [])

  const projectSearchQ = useQuery({
    queryKey: [...collabKeys.projects(), 'search', projectSearchDebounced],
    queryFn: () => searchProjectsRequest(accessToken, { q: projectSearchDebounced, limit: 8 }),
    enabled: projectSearchDebounced.length >= 2,
    staleTime: 20_000,
  })

  const grouped = useMemo(() => {
    const map: Record<ParentProjectStatus, ProjectListItem[]> = {
      todo: [], in_progress: [], in_review: [], completed: [],
    }
    for (const p of projects) map[p.status]?.push(p)
    for (const col of Object.keys(map) as ParentProjectStatus[]) {
      map[col].sort((a, b) => a.progressPercent - b.progressPercent)
    }
    return map
  }, [projects])

  if (openProjectId) {
    return (
      <ProjectWorkspace
        accessToken={accessToken}
        identity={identity}
        projectId={openProjectId}
        projectMeta={projects.find((p) => p.id === openProjectId) ?? null}
        activeTab={workspaceTab}
        chatChannel={chatChannel}
        chatMessageId={chatMessageId}
        initialTaskId={taskId}
        onBack={onCloseProject}
        onTabChange={onTabChange}
      />
    )
  }

  const total = projects.length
  const active = grouped.in_progress.length
  const reviewing = grouped.in_review.length
  const done = grouped.completed.length
  const firstProjectId = projects[0]?.id

  return (
    <div className="flex flex-col gap-6 min-h-0 min-w-0 w-full max-w-full overflow-hidden">
      <PageHeader
        eyebrow={
          <>
            Espacio de <span className="font-black text-primary">Colaboración</span>
          </>
        }
        title={
          <>
            Gestión de{' '}
            <span className="font-black tracking-tight text-foreground">
              Proyectos
            </span>
          </>
        }
        description="Vista Kanban por estado. Abre un proyecto para gestionar su espacio de trabajo."
        icon={KanbanSquare}
        actions={(
          <div className="flex w-full flex-col gap-2 sm:items-end xl:w-auto">
          {canCreate && (
            <Button
              size="sm"
              className="shrink-0 self-start sm:self-auto"
              data-tour="collab-create-btn"
              onClick={() => setShowModal(true)}
            >
              <Plus className="size-4 mr-1.5" />
              Nuevo proyecto
            </Button>
          )}
          <div data-tour="collab-search" className="w-full sm:w-auto">
            <ProjectSearchInput
              canSearchByClient={canSearchByClient}
              searchResults={projectSearchQ.data?.data ?? []}
              isSearching={projectSearchQ.isLoading}
              onDebouncedChange={handleDebouncedChange}
              onSelectProject={onOpenProject}
            />
          </div>
          </div>
        )}
      />

      {canCreate && (
        <CreateProjectModal
          accessToken={accessToken}
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={(id) => { setShowModal(false); onOpenProject(id) }}
        />
      )}

      {!projectsQ.isLoading && total > 0 && (
        <div data-tour="collab-summary">
          <ProjectStatsSummary total={total} active={active} reviewing={reviewing} done={done} />
        </div>
      )}

      {projectsQ.isLoading && (
        <div className="flex justify-center items-center py-24" role="status" aria-label="Cargando proyectos">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary" />
        </div>
      )}

      {!projectsQ.isLoading && (
        <div className="overflow-x-auto pb-4">
          <div
            className="grid grid-cols-4 gap-4 min-w-[960px]"
            data-tour="collab-columns-container"
            style={{
              height: total > 0
                ? 'max(440px, calc(100dvh - 18.25rem))'
                : 'max(480px, calc(100dvh - 13.5rem))',
            }}
            role="main"
            aria-label="Tablero Kanban de proyectos"
          >
            {PARENT_COLUMNS.map((col) => {
              const colProjects = grouped[col.key] ?? []
              const hasProjects = colProjects.length > 0
              return (
                <section
                  key={col.key}
                  className={cn(
                    'flex flex-col h-full rounded-2xl border border-border/70 bg-muted/30 shadow-xs overflow-hidden',
                    'border-t-4',
                    col.accent,
                  )}
                  aria-label={
                    `${col.label}: ${colProjects.length} proyecto${colProjects.length !== 1 ? 's' : ''}`
                  }
                >
                  <div
                    className={cn(
                      'flex items-center justify-between gap-2 border-b border-border/60',
                      'bg-background/85 px-3.5 py-3 shrink-0 backdrop-blur-xs',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground" aria-hidden="true">{col.icon}</span>
                      <h2 className="text-sm font-semibold tracking-tight text-foreground">{col.label}</h2>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs font-bold min-w-[1.5rem] justify-center"
                      aria-label={`${colProjects.length} proyectos`}
                    >
                      {colProjects.length}
                    </Badge>
                  </div>
                  <div
                    className="flex-1 min-h-0 overflow-y-auto p-2.5 flex flex-col gap-2.5 scrollbar-thin"
                    aria-label={`Proyectos en ${col.label}`}
                  >
                    {!hasProjects ? (
                      <div className="flex flex-1 h-full min-h-[220px] flex-col items-center justify-center">
                        <div
                          className={cn(
                            'flex size-full flex-col items-center justify-center gap-3 rounded-xl',
                            'border border-dashed border-border/80 bg-background/40 p-6 text-center',
                          )}
                        >
                          <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground shadow-2xs">
                            {col.icon}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-foreground/85">
                              {col.emptyText}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70">
                              No hay proyectos en esta etapa
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      colProjects.map((project) => (
                        <div
                          key={project.id}
                          data-tour={project.id === firstProjectId ? 'collab-card-first' : undefined}
                          onClick={() => onOpenProject(project.id)}
                        >
                          <ProjectCard
                            project={project}
                            onClick={() => onOpenProject(project.id)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
