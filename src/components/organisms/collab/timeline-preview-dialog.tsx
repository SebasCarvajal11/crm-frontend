import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{preview.fileName}</DialogTitle>
          <DialogDescription className="sr-only">Previsualización del archivo seleccionado</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {preview.mime.startsWith('image/') && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onZoomChange((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}
                >
                  -
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onZoomReset}>
                  {Math.round(imageZoom * 100)}%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onZoomChange((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                >
                  +
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onOpenInNewTab}>
              Abrir en pestaña
            </Button>
            <Button type="button" size="sm" onClick={onDownload}>
              <Download className="mr-1 size-3.5" />
              Descargar
            </Button>
          </div>
        </div>
        <div className="max-h-[75vh] overflow-auto rounded-md border bg-muted/20 p-2">
          {preview.url && preview.mime.startsWith('image/') && (
            <img
              src={preview.url}
              alt={preview.fileName}
              className="mx-auto h-auto max-h-[70vh] w-auto rounded"
              style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top center' }}
            />
          )}
          {preview.url && preview.mime === 'application/pdf' && (
            <iframe src={preview.url} title={preview.fileName} className="h-[70vh] w-full rounded border-0" />
          )}
          {preview.url && preview.mime.startsWith('video/') && (
            <video src={preview.url} controls className="mx-auto max-h-[70vh] w-auto max-w-full rounded" />
          )}
          {preview.url && preview.mime.startsWith('text/') && (
            <iframe src={preview.url} title={preview.fileName} className="h-[70vh] w-full rounded border-0" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
