import { Archive, Download, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { ExportProgress } from '@/features/admin/services/storage-zip-exporter.service'

interface Props {
  isOpen: boolean
  title?: string
  progress: ExportProgress | null
  error?: string | null
  onClose: () => void
}

function getStageMessage(progress: ExportProgress | null): string {
  if (!progress) return 'Iniciando exportación...'
  if (progress.stage === 'fetching') {
    const fileLabel = progress.currentFileName ? `: ${progress.currentFileName}` : ''
    return `Descargando archivo ${progress.completedFiles + 1} de ${progress.totalFiles}${fileLabel}`
  }
  if (progress.stage === 'compressing') {
    return 'Comprimiendo y estructurando carpetas en formato ZIP...'
  }
  if (progress.stage === 'complete') {
    return '¡Paquete ZIP generado y descargado con éxito!'
  }
  return 'Procesando archivos...'
}

export function BulkExportProgressDialog({
  isOpen,
  title = 'Descarga en Paquete (.zip)',
  progress,
  error,
  onClose,
}: Props) {
  const isComplete = progress?.stage === 'complete'
  const isError = Boolean(error)
  const percent = progress?.percent ?? 0

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && (isComplete || isError) && onClose()}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia variant={isComplete ? 'success' : isError ? 'destructive' : 'default'}>
            {isComplete ? (
              <CheckCircle2 className="size-5" />
            ) : isError ? (
              <AlertCircle className="size-5" />
            ) : (
              <Archive className="size-5 animate-pulse" />
            )}
          </AlertDialogMedia>
          <AlertDialogTitle className="truncate">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isComplete
              ? 'La descarga comenzará automáticamente en tu navegador.'
              : isError
                ? 'Ocurrió un error al intentar generar el archivo comprimido.'
                : 'Empaquetando archivos con estructura de carpetas tipo Google Drive.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-1 text-xs">
          {!isError ? (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground flex items-center gap-1.5 truncate max-w-[280px]">
                  {!isComplete && <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />}
                  {getStageMessage(progress)}
                </span>
                <span className="font-mono text-xs font-bold text-primary">{percent}%</span>
              </div>
              <Progress
                value={percent}
                className="h-2 bg-muted/60"
                indicatorClassName={isComplete ? 'bg-emerald-500' : 'bg-primary'}
              />
              {progress && (
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Archivos procesados:</span>
                  <span className="font-mono font-medium text-foreground">
                    {progress.completedFiles} / {progress.totalFiles}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className={[
                'flex items-center gap-2 rounded-xl border border-destructive/40',
                'bg-destructive/10 p-3 text-destructive',
              ].join(' ')}
            >
              <AlertCircle className="size-4 shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {(isComplete || isError) && (
            <Button size="sm" onClick={onClose} className="w-full sm:w-auto text-xs rounded-xl font-medium shadow-xs gap-1.5">
              {isComplete ? <Download className="size-3.5" /> : null}
              {isComplete ? 'Listo' : 'Cerrar'}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
