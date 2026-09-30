import { useEffect, useMemo, useState } from 'react'
import type { ProjectContract, ProjectMember, ProjectTask, ProjectTimelineItem } from '@/features/collab/model'
import { downloadGatewayFile, previewGatewayFile, triggerBlobDownload } from '@/features/collab/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContractTimelineCard } from './contract-timeline-card'
import { TimelineItemCard } from './timeline-item-card'
import { TimelinePreviewDialog, type PreviewState } from './timeline-preview-dialog'

type Props = {
  accessToken: string
  projectId: string
  projectName?: string
  contract?: ProjectContract | null
  timeline: ProjectTimelineItem[]
  tasks: ProjectTask[]
  members?: ProjectMember[]
  canManage: boolean
  onError: (msg: string) => void
}

export function ConversationFilesTimeline({
  accessToken,
  projectName,
  contract,
  timeline,
  tasks,
  members = [],
  onError,
}: Props) {
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [previewProgress, setPreviewProgress] = useState<{ fileId: string; percent: number } | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [kindFilter, setKindFilter] = useState<'all' | ProjectTimelineItem['kind']>('all')
  const [preview, setPreview] = useState<PreviewState>({
    open: false,
    url: null,
    blob: null,
    mime: '',
    fileName: '',
  })

  useEffect(() => {
    const url = preview.url
    if (!url) return
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [preview.url])

  const emailBySub = useMemo(
    () =>
      new Map(
        members
          .map((m) => [m.userSub, m.email] as const)
          .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))
      ),
    [members]
  )
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task] as const)), [tasks])
  const filteredTimeline = useMemo(() => {
    const needle = searchText.trim().toLowerCase()
    return timeline.filter((item) => {
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false
      if (!needle) return true
      const actorEmail = item.createdByEmail ?? (item.createdBySub ? emailBySub.get(item.createdBySub) : '') ?? ''
      const haystack = `${item.title} ${item.fileName ?? ''} ${actorEmail}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [timeline, kindFilter, searchText, emailBySub])

  if (timeline.length === 0 && !contract) {
    return <p className="text-sm text-muted-foreground">No hay eventos registrados para este proyecto.</p>
  }

  const openPreview = async (fileId: string, fileName: string) => {
    const key = `${fileId}:preview`
    try {
      setBusyKey(key)
      setPreviewProgress({ fileId, percent: 0 })
      const next = await previewGatewayFile(accessToken, fileId, fileName, (percent) => {
        setPreviewProgress({ fileId, percent })
      })
      setImageZoom(1)
      setPreview({
        open: true,
        url: next.objectUrl,
        blob: next.blob,
        mime: next.mime,
        fileName: next.fileName,
      })
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo previsualizar el archivo')
    } finally {
      setBusyKey(null)
      setPreviewProgress(null)
    }
  }

  const closePreview = () => {
    if (preview.url) URL.revokeObjectURL(preview.url)
    setImageZoom(1)
    setPreview({ open: false, url: null, blob: null, mime: '', fileName: '' })
  }

  const openPreviewInNewTab = () => {
    if (!preview.blob) return
    const tabUrl = URL.createObjectURL(preview.blob)
    const opened = window.open(tabUrl, '_blank', 'noopener,noreferrer')
    if (!opened) {
      URL.revokeObjectURL(tabUrl)
      onError('No se pudo abrir la pestaña. Permite ventanas emergentes.')
    }
  }

  const downloadPreviewFile = () => {
    if (!preview.blob) return
    triggerBlobDownload(preview.blob, preview.fileName)
  }

  const downloadFile = async (fileId: string, fileName: string) => {
    const key = `${fileId}:download`
    try {
      setBusyKey(key)
      await downloadGatewayFile(accessToken, fileId, fileName)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo descargar el archivo')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-xs">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar por título, archivo, usuario..."
            className="h-8 w-full text-xs"
          />
          <Select
            value={kindFilter}
            onValueChange={(value) => setKindFilter(value as 'all' | ProjectTimelineItem['kind'])}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los eventos</SelectItem>
              <SelectItem value="file">Archivos subidos</SelectItem>
              <SelectItem value="task_completed">Tareas finalizadas</SelectItem>
              <SelectItem value="change_accepted">Cambios aceptados</SelectItem>
              <SelectItem value="change_rejected">Cambios rechazados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {contract && (
          <ContractTimelineCard
            contract={contract}
            projectName={projectName ?? ''}
            onError={onError}
          />
        )}

        {filteredTimeline.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay eventos que coincidan con la búsqueda o el filtro.</p>
        )}
        {filteredTimeline.map((item, index) => (
          <TimelineItemCard
            key={`${item.kind}:${item.id}`}
            item={item}
            isLast={index === filteredTimeline.length - 1}
            linkedTask={item.taskId ? taskById.get(item.taskId) : null}
            actorEmail={item.createdByEmail ?? (item.createdBySub ? emailBySub.get(item.createdBySub) : null)}
            emailBySub={emailBySub}
            busyKey={busyKey}
            previewProgress={previewProgress}
            onOpenPreview={(fileId, fileName) => void openPreview(fileId, fileName)}
            onDownloadFile={(fileId, fileName) => void downloadFile(fileId, fileName)}
          />
        ))}
      </div>

      <TimelinePreviewDialog
        preview={preview}
        imageZoom={imageZoom}
        onClose={closePreview}
        onZoomChange={setImageZoom}
        onZoomReset={() => setImageZoom(1)}
        onOpenInNewTab={openPreviewInNewTab}
        onDownload={downloadPreviewFile}
      />
    </>
  )
}
