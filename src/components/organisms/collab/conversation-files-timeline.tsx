import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Download, Eye, UserRound } from 'lucide-react'
import type { ProjectContract, ProjectMember, ProjectTask, ProjectTimelineItem } from '@/features/collab/model'
import { downloadGatewayFile, previewGatewayFile, triggerBlobDownload } from '@/features/collab/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContractTimelineCard } from './contract-timeline-card'
import { TimelinePreviewDialog, type PreviewState } from './timeline-preview-dialog'
import {
  itemIcon,
  supportsPreview,
  formatBogotaDate,
  badgeClassByKind,
} from './timeline-utils'

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
    () => new Map(
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
      const next = await previewGatewayFile(accessToken, fileId, fileName)
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
    // La URL se abre en una pestaña externa: NO la revocamos aquí.
    // El navegador la libera automáticamente cuando esa pestaña se cierra.
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
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px]">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar por nombre o usuario"
            aria-label="Buscar en trazabilidad"
            className="h-8 text-xs"
          />
          <Select value={kindFilter} onValueChange={(value) => setKindFilter(value as 'all' | ProjectTimelineItem['kind'])}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="file">Archivo</SelectItem>
              <SelectItem value="change_accepted">Cambio aceptado</SelectItem>
              <SelectItem value="change_rejected">Cambio rechazado</SelectItem>
              <SelectItem value="task_completed">Tarea finalizada</SelectItem>
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
        {filteredTimeline.map((item, index) => {
          const Icon = itemIcon(item)
          const isFile = item.kind === 'file' && !!item.fileId && !!item.fileName && !!item.mimeType
          const previewable = isFile ? supportsPreview(item.mimeType!) : false
          const linkedTask = item.taskId ? taskById.get(item.taskId) : null
          const actorEmail = item.createdByEmail ?? (item.createdBySub ? emailBySub.get(item.createdBySub) : null)
          const isLast = index === filteredTimeline.length - 1
          return (
            <article key={`${item.kind}:${item.id}`} className="relative pl-9">
              {!isLast && <span className="absolute left-[13px] top-8 bottom-[-0.85rem] w-px bg-border" aria-hidden="true" />}
              <span className="absolute left-0 top-1 inline-flex size-7 items-center justify-center rounded-full border bg-muted/40 text-primary shadow-sm">
                <Icon className="size-3.5" />
              </span>
              <div className="rounded-md border bg-background px-3 py-2.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5">
                      <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${badgeClassByKind[item.kind]}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{item.title}</p>
                    {isFile && <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{item.fileName}</p>}
                    {item.kind === 'task_completed' && linkedTask && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Progreso final: {linkedTask.checklistProgress}%</p>
                    )}
                    {item.resolutionComment && (
                      <div className={`mt-2 rounded-md border p-2 text-[11px] ${item.kind === 'change_rejected' ? 'border-rose-200 bg-rose-50/60 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200' : 'border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>
                        <p className="font-semibold">{item.kind === 'change_rejected' ? 'Motivo del rechazo:' : 'Nota de resolución:'}</p>
                        <p className="mt-0.5 leading-relaxed">{item.resolutionComment}</p>
                      </div>
                    )}
                    <div className="mt-2.5 grid gap-1 text-[10px] text-muted-foreground">
                      <p className="inline-flex items-center gap-1.5 leading-none">
                        <CalendarClock className="size-3" />
                        {formatBogotaDate(item.occurredAt)}
                      </p>
                      {item.requestedBySub && emailBySub.get(item.requestedBySub) && (
                        <p className="inline-flex items-center gap-1.5 leading-none">
                          <UserRound className="size-3" />
                          Solicitante: {emailBySub.get(item.requestedBySub)}
                        </p>
                      )}
                      {actorEmail && !item.requestedBySub && (
                        <p className="inline-flex items-center gap-1.5 leading-none">
                          <UserRound className="size-3" />
                          {actorEmail}
                        </p>
                      )}
                      {item.resolvedBySub && emailBySub.get(item.resolvedBySub) && (
                        <p className="inline-flex items-center gap-1.5 leading-none font-medium text-foreground/80">
                          <CheckCircle2 className="size-3 text-primary" />
                          {item.kind === 'change_rejected' ? 'Rechazado por: ' : 'Aceptado por: '}{emailBySub.get(item.resolvedBySub)}
                        </p>
                      )}
                    </div>
                  </div>
                  {isFile && item.fileId && item.fileName && item.mimeType && (
                    <div className="flex shrink-0 items-center self-center">
                      <div className="flex min-w-[122px] flex-col items-stretch gap-1.5">
                        {previewable && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-7 w-full justify-center px-2 text-[10px]"
                            disabled={busyKey !== null}
                            onClick={() => void openPreview(item.fileId!, item.fileName!)}
                          >
                            <Eye className="mr-1 size-3" />
                            {busyKey === `${item.fileId}:preview` ? 'Abriendo...' : 'Previsualizar'}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 w-full justify-center px-2 text-[10px]"
                          disabled={busyKey !== null}
                          onClick={() => void downloadFile(item.fileId!, item.fileName!)}
                        >
                          <Download className="mr-1 size-3" />
                          {busyKey === `${item.fileId}:download` ? 'Descargando...' : 'Descargar'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
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

