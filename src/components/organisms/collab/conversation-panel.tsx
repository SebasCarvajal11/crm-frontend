import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FolderArchive, History, MessageSquare } from 'lucide-react'
import { useProjectTimeline } from '@/features/collab/hooks'
import { collabKeys } from '@/features/collab/model'
import { getProjectContractRequest } from '@/features/collab/api'
import { cn } from '@/shared/lib/utils'
import { ChatPanel } from './chat-panel'
import { ConversationFilesTimeline } from './conversation-files-timeline'
import { ConversationUploadForm } from './conversation-upload-form'
import { ProjectFileRepositoryLink } from './project-file-repository-link'
import type { MeResponse } from '@/shared/types'
import type { Project, ProjectMember, ProjectTask } from '@/features/collab/model'

type Props = {
  accessToken: string
  projectId: string
  identity: MeResponse['data']
  isClient: boolean
  initialChannel?: 'internal' | 'external'
  initialMessageId?: string
  members: ProjectMember[]
  tasks: ProjectTask[]
  project: Project | null
  onError: (msg: string) => void
  isVisible?: boolean
}

type ConversationSupportPanelProps = {
  title: string
  description: string
  children: ReactNode
  contentClassName?: string
  dataTour?: string
}

/**
 * Panel secundario con la misma altura que el chat y scroll interno.
 * La política compartida preserva una lectura estable en escritorio y una
 * composición contenida cuando las columnas pasan a una sola fila.
 */
function ConversationSupportPanel({
  title,
  description,
  children,
  contentClassName = 'p-4',
  dataTour,
}: ConversationSupportPanelProps) {
  return (
    <section
      data-tour={dataTour}
      className="flex h-full min-h-0 flex-1 min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="shrink-0 border-b bg-muted/20 px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className={`min-h-0 flex-1 overflow-y-auto scroll-smooth scrollbar-thin ${contentClassName}`}>
        {children}
      </div>
    </section>
  )
}

export function ConversationPanel({
  accessToken,
  projectId,
  identity,
  isClient,
  initialChannel,
  initialMessageId,
  members,
  tasks,
  project,
  onError,
  isVisible = true,
}: Props) {
  const canManageFiles = identity.role === 'admin' || identity.role === 'worker'
  const { timelineQ, timeline } = useProjectTimeline({ accessToken, projectId })

  const contractQ = useQuery({
    queryKey: collabKeys.contract(projectId),
    queryFn: () => getProjectContractRequest(accessToken, projectId),
    enabled: Boolean(projectId && accessToken),
    staleTime: 30_000,
  })
  const [mobileView, setMobileView] = useState<'chat' | 'files' | 'timeline'>('chat')
  const contract = contractQ.data?.data ?? null

  return (
    <div className="flex flex-col min-h-0 flex-1 h-full space-y-3">
      {/* Selector responsivo para pantallas menores a 1280px (Tablet y Móvil) */}
      <div
        role="tablist"
        aria-label="Vistas de conversación"
        className={cn(
          'flex items-center gap-1 rounded-2xl border border-border/80 bg-muted/40 p-1',
          'min-[1280px]:hidden shrink-0'
        )}
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === 'chat'}
          aria-controls="workspace-chat-section"
          onClick={() => setMobileView('chat')}
          className={cn(
            'flex-1 flex min-h-[38px] items-center justify-center gap-1.5 py-2 px-3',
            'text-xs font-semibold rounded-xl transition-all duration-150',
            mobileView === 'chat'
              ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <MessageSquare className="size-3.5 shrink-0" />
          <span>Chat</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === 'files'}
          aria-controls="workspace-files-section"
          onClick={() => setMobileView('files')}
          className={cn(
            'flex-1 flex min-h-[38px] items-center justify-center gap-1.5 py-2 px-3',
            'text-xs font-semibold rounded-xl transition-all duration-150',
            mobileView === 'files'
              ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <FolderArchive className="size-3.5 shrink-0" />
          <span>Archivos</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === 'timeline'}
          aria-controls="workspace-timeline-section"
          onClick={() => setMobileView('timeline')}
          className={cn(
            'flex-1 flex min-h-[38px] items-center justify-center gap-1.5 py-2 px-3',
            'text-xs font-semibold rounded-xl transition-all duration-150',
            mobileView === 'timeline'
              ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <History className="size-3.5 shrink-0" />
          <span>Trazabilidad</span>
        </button>
      </div>

      <div
        className={cn(
          'grid flex-1 min-h-0 h-full grid-cols-1 gap-4',
          'min-h-[520px] lg:min-h-[580px]',
          'min-[1280px]:grid-cols-[minmax(0,1.25fr)_minmax(15rem,0.9fr)_minmax(15rem,1fr)]'
        )}
      >
        <div
          id="workspace-chat-section"
          className={cn(
            'min-w-0 flex flex-col min-h-0 h-full',
            mobileView !== 'chat' && 'hidden min-[1280px]:flex'
          )}
        >
          <ChatPanel
            key={`${initialChannel ?? 'external'}:${initialMessageId ?? ''}`}
            accessToken={accessToken}
            projectId={projectId}
            projectName={project?.name}
            identity={identity}
            isClient={isClient}
            initialChannel={initialChannel}
            initialMessageId={initialMessageId}
            members={members}
            onError={onError}
            isVisible={isVisible}
          />
        </div>

        <div
          id="workspace-files-section"
          className={cn(
            'min-w-0 flex flex-col min-h-0 h-full',
            mobileView !== 'files' && 'hidden min-[1280px]:flex'
          )}
        >
          <ConversationSupportPanel
            dataTour="workspace-files-panel"
            title="Archivos"
            description="Sube archivos con información mínima y visibilidad para cliente."
          >
            {project && (
              <ProjectFileRepositoryLink
                accessToken={accessToken}
                projectId={projectId}
                initialUrl={project.fileRepositoryUrl}
                canManage={identity.role === 'admin'}
                onError={onError}
              />
            )}
            {canManageFiles ? (
              <ConversationUploadForm accessToken={accessToken} projectId={projectId} onError={onError} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Solo administradores y trabajadores pueden subir archivos.
              </p>
            )}
          </ConversationSupportPanel>
        </div>

        <div
          id="workspace-timeline-section"
          className={cn(
            'min-w-0 flex flex-col min-h-0 h-full',
            mobileView !== 'timeline' && 'hidden min-[1280px]:flex'
          )}
        >
          <ConversationSupportPanel
            dataTour="workspace-timeline-panel"
            title="Trazabilidad"
            description="Línea del tiempo de archivos, tareas finalizadas y cambios aceptados."
            contentClassName="px-4 py-3"
          >
            {timelineQ.isLoading && <p className="text-sm text-muted-foreground">Cargando trazabilidad...</p>}
            {!timelineQ.isLoading && (
              <ConversationFilesTimeline
                accessToken={accessToken}
                projectId={projectId}
                projectName={project?.name ?? ''}
                contract={contract}
                timeline={timeline}
                tasks={tasks}
                members={members}
                canManage={canManageFiles}
                onError={onError}
              />
            )}
          </ConversationSupportPanel>
        </div>
      </div>
    </div>
  )
}
