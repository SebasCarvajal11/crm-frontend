import { createElement } from 'react'
import { CalendarClock, CheckCircle2, Download, Eye, UserRound } from 'lucide-react'
import type { ProjectTask, ProjectTimelineItem } from '@/features/collab/model'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  itemIcon,
  supportsPreview,
  formatBogotaDate,
  badgeClassByKind,
} from './timeline-utils'

type Props = {
  item: ProjectTimelineItem
  isLast: boolean
  linkedTask?: ProjectTask | null
  actorEmail?: string | null
  emailBySub: Map<string, string>
  busyKey: string | null
  previewProgress: { fileId: string; percent: number } | null
  onOpenPreview: (fileId: string, fileName: string) => void
  onDownloadFile: (fileId: string, fileName: string) => void
}

export function TimelineItemCard({
  item,
  isLast,
  linkedTask,
  actorEmail,
  emailBySub,
  busyKey,
  previewProgress,
  onOpenPreview,
  onDownloadFile,
}: Props) {
  const isFile = item.kind === 'file' && !!item.fileId && !!item.fileName && !!item.mimeType
  const previewable = isFile ? supportsPreview(item.mimeType!) : false

  return (
    <article key={`${item.kind}:${item.id}`} className="relative pl-9">
      {!isLast && (
        <span className="absolute left-[13px] top-8 bottom-[-0.85rem] w-px bg-border" aria-hidden="true" />
      )}
      <span className="absolute left-0 top-1 inline-flex size-7 items-center justify-center rounded-full border bg-muted/40 text-primary shadow-sm">
        {createElement(itemIcon(item), { className: 'size-3.5' })}
      </span>
      <div
        className={`rounded-md border bg-background px-3 py-2.5 shadow-sm ${
          item.isPurged ? 'opacity-75 bg-muted/20 border-dashed' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5">
              <span
                className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${badgeClassByKind[item.kind]}`}
              >
                {item.label}
              </span>
            </div>
            <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{item.title}</p>
            {isFile && (
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.fileName}</p>
                {item.isPurged && (
                  <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-400">
                    Espacio liberado
                  </span>
                )}
              </div>
            )}
            {item.kind === 'task_completed' && linkedTask && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Progreso final: {linkedTask.checklistProgress}%
              </p>
            )}
            {item.resolutionComment && (
              <div
                className={`mt-2 rounded-md border p-2 text-[11px] ${
                  item.kind === 'change_rejected'
                    ? 'border-rose-200 bg-rose-50/60 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200'
                    : 'border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
                }`}
              >
                <p className="font-semibold">
                  {item.kind === 'change_rejected' ? 'Motivo del rechazo:' : 'Nota de resolución:'}
                </p>
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
                  {item.kind === 'change_rejected' ? 'Rechazado por: ' : 'Aceptado por: '}
                  {emailBySub.get(item.resolvedBySub)}
                </p>
              )}
            </div>
          </div>

          {isFile && item.fileId && item.fileName && item.mimeType && (
            <div className="flex shrink-0 items-center self-center">
              {item.isPurged ? (
                <div
                  className="flex flex-col items-end text-right"
                  title={item.purgedReason ? `Motivo: ${item.purgedReason}` : 'Depurado por administración'}
                >
                  <span className="text-[11px] font-medium text-muted-foreground/80">No disponible</span>
                  <span className="text-[10px] text-muted-foreground/60">Archivo depurado</span>
                </div>
              ) : (
                <div className="flex min-w-[122px] flex-col items-stretch gap-1.5">
                  {previewable && (
                    <div className="w-full space-y-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 w-full justify-center px-2 text-[10px]"
                        disabled={busyKey !== null}
                        onClick={() => onOpenPreview(item.fileId!, item.fileName!)}
                      >
                        <Eye className="mr-1 size-3" />
                        {busyKey === `${item.fileId}:preview`
                          ? `Abriendo... ${
                              previewProgress?.fileId === item.fileId && previewProgress.percent > 0
                                ? `${previewProgress.percent}%`
                                : ''
                            }`.trim()
                          : 'Previsualizar'}
                      </Button>
                      {busyKey === `${item.fileId}:preview` && (
                        <Progress
                          value={previewProgress?.fileId === item.fileId ? previewProgress.percent : 0}
                          className="h-1 w-full bg-muted overflow-hidden"
                          indicatorClassName="bg-primary transition-all duration-150"
                        />
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 w-full justify-center px-2 text-[10px]"
                    disabled={busyKey !== null}
                    onClick={() => onDownloadFile(item.fileId!, item.fileName!)}
                  >
                    <Download className="mr-1 size-3" />
                    {busyKey === `${item.fileId}:download` ? 'Descargando...' : 'Descargar'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
