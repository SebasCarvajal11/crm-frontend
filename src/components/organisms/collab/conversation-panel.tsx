import { useQuery } from '@tanstack/react-query'
import { useProjectTimeline } from '@/features/collab/hooks'
import { collabKeys } from '@/features/collab/model'
import { getProjectContractRequest } from '@/features/collab/api'
import { ChatPanel } from './chat-panel'
import { ConversationFilesTimeline } from './conversation-files-timeline'
import { ConversationUploadForm } from './conversation-upload-form'
import { ProjectFileRepositoryLink } from './project-file-repository-link'
import { COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS } from './collab-workspace-layout'
import type { ReactNode } from 'react'
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
}: ConversationSupportPanelProps) {
  return (
    <section
      className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm`}
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
  const contract = contractQ.data?.data ?? null

  return (
    <div className="grid grid-cols-1 gap-4 min-[1280px]:grid-cols-[minmax(0,1.25fr)_minmax(15rem,0.9fr)_minmax(15rem,1fr)]">
      <div className="min-w-0">
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

      <ConversationSupportPanel
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
          <p className="text-sm text-muted-foreground">Solo administradores y trabajadores pueden subir archivos.</p>
        )}
      </ConversationSupportPanel>

      <ConversationSupportPanel
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
  )
}
