import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog'

export interface PreviewState {
  open: boolean
  url: string | null
  blob: Blob | null
  mime: string
  fileName: string
}

interface TimelinePreviewDialogProps {
  preview: PreviewState
  imageZoom: number
  onClose: () => void
  onZoomChange: (updater: (z: number) => number) => void
  onZoomReset: () => void
  onOpenInNewTab: () => void
  onDownload: () => void
}

export function TimelinePreviewDialog({
  preview,
  imageZoom,
  onClose,
  onZoomChange,
  onZoomReset,
  onOpenInNewTab,
  onDownload,
}: TimelinePreviewDialogProps) {
  return (
    <Dialog open={preview.open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent size="5xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-10 text-base sm:text-lg">{preview.fileName}</DialogTitle>
          <DialogDescription className="sr-only">Previsualización del archivo seleccionado</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3.5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 shadow-2xs">
            <div className="flex items-center gap-1.5">
              {preview.mime.startsWith('image/') && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    title="Alejar"
                    onClick={() => onZoomChange((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}
                  >
                    <ZoomOut className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-mono"
                    onClick={onZoomReset}
                    title="Restablecer escala"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    {Math.round(imageZoom * 100)}%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    title="Acercar"
                    onClick={() => onZoomChange((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                  >
                    <ZoomIn className="size-3.5" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onOpenInNewTab} className="text-xs gap-1.5">
                <ExternalLink className="size-3.5" />
                <span>Pestaña nueva</span>
              </Button>
              <Button type="button" size="sm" onClick={onDownload} className="text-xs gap-1.5 font-semibold shadow-2xs">
                <Download className="size-3.5" />
                <span>Descargar</span>
              </Button>
            </div>
          </div>

          <div className="max-h-[75vh] overflow-auto rounded-xl border border-border/70 bg-black/5 dark:bg-black/40 p-2 scrollbar-thin">
            {preview.url && preview.mime.startsWith('image/') && (
              <img
                src={preview.url}
                alt={preview.fileName}
                className="mx-auto h-auto max-h-[70vh] w-auto rounded-lg object-contain shadow-md transition-transform duration-150"
                style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top center' }}
              />
            )}
            {preview.url && preview.mime === 'application/pdf' && (
              <iframe src={preview.url} title={preview.fileName} className="h-[70vh] w-full rounded-lg border-0 shadow-inner" />
            )}
            {preview.url && preview.mime.startsWith('video/') && (
              <video src={preview.url} controls className="mx-auto max-h-[70vh] w-auto max-w-full rounded-lg shadow-md" />
            )}
            {preview.url && preview.mime.startsWith('text/') && (
              <iframe src={preview.url} title={preview.fileName} className="h-[70vh] w-full rounded-lg border-0 shadow-inner" />
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
