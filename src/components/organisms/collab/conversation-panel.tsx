import { useProjectTimeline } from '@/features/collab/hooks'
import { ChatPanel } from './chat-panel'
import { ConversationFilesTimeline } from './conversation-files-timeline'
import { ConversationUploadForm } from './conversation-upload-form'
import type { ReactNode } from 'react'
import type { MeResponse } from '@/shared/types'
import type { ProjectMember, ProjectTask } from '@/features/collab/model'

type Props = {
  accessToken: string
  projectId: string
  identity: MeResponse['data']
  isClient: boolean
  initialChannel?: 'internal' | 'external'
  initialMessageId?: string
  members: ProjectMember[]
  tasks: ProjectTask[]
  onError: (msg: string) => void
}

type ConversationSupportPanelProps = {
  title: string
  description: string
  children: ReactNode
  contentClassName?: string
}

/**
 * Panel secundario con alto acotado y scroll interno.
 * Mantiene una jerarquía estable junto al chat en todas las resoluciones.
 */
function ConversationSupportPanel({
  title,
  description,
  children,
  contentClassName = 'p-4',
}: ConversationSupportPanelProps) {
  return (
    <section className="flex h-[min(27.5rem,56dvh)] min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm sm:h-[min(31rem,60dvh)] min-[1400px]:h-auto min-[1400px]:max-h-[min(600px,70dvh)]">
      <div className="shrink-0 border-b bg-muted/20 px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className={`min-h-0 flex-1 overflow-y-auto ${contentClassName}`}>{children}</div>
    </section>
  )
}

export function ConversationPanel({ accessToken, projectId, identity, isClient, initialChannel, initialMessageId, members, tasks, onError }: Props) {
  const canManageFiles = identity.role === 'admin' || identity.role === 'worker'

  const { timelineQ, timeline } = useProjectTimeline({ accessToken, projectId })

  return (
    <div className="grid grid-cols-1 gap-4 min-[1024px]:grid-cols-[minmax(0,1.25fr)_minmax(15rem,0.9fr)_minmax(15rem,1fr)]">
      <div className="min-w-0">
        <ChatPanel key={`${initialChannel ?? 'external'}:${initialMessageId ?? ''}`} accessToken={accessToken} projectId={projectId} identity={identity} isClient={isClient} initialChannel={initialChannel} initialMessageId={initialMessageId} members={members} onError={onError} />
      </div>

      <ConversationSupportPanel
        title="Archivos"
        description="Sube archivos con información mínima y visibilidad para cliente."
      >
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
        {!timelineQ.isLoading && <ConversationFilesTimeline accessToken={accessToken} projectId={projectId} timeline={timeline} tasks={tasks} members={members} canManage={canManageFiles} onError={onError} />}
      </ConversationSupportPanel>
    </div>
  )
}



