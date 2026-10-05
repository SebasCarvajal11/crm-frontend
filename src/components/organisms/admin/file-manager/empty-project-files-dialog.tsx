import { AlertTriangle, Trash2, Loader2, Download, ShieldCheck } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatBytes } from '@/shared/lib'
import { useEmptyProjectFiles } from './use-empty-project-files'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  isOpen: boolean
  projectName: string
  clientName?: string
  filesCount: number
  totalBytes: number
  files?: StorageFileItem[]
  accessToken?: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function EmptyProjectFilesDialog({
  isOpen,
  projectName,
  clientName = 'Cliente',
  filesCount,
  totalBytes,
  files = [],
  accessToken,
  onClose,
  onConfirm,
}: Props) {
  const {
    loading,
    errorMessage,
    progress,
    progressStep,
    canDownload,
    executePurge,
    handleDownloadOnly,
    handleDownloadAndPurge,
  } = useEmptyProjectFiles({
    accessToken,
    clientName,
    projectName,
    files,
    onClose,
    onConfirm,
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialogContent size="lg">
        <AlertDialogHeader>
          <AlertDialogMedia variant="destructive">
            <Trash2 className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Vaciar archivos del proyecto
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción depurará los archivos binarios activos para liberar espacio en la nube.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3.5 py-1 text-xs">
          <div className="rounded-xl border border-border/80 bg-muted/25 p-3.5 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-border/40">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Proyecto afectado:
                </span>
                <span className="font-semibold text-foreground text-xs break-words block">
                  {projectName}
                </span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Total de archivos a depurar:
                </span>
                <span className="font-semibold text-foreground text-xs block">
                  {filesCount} documentos
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-muted-foreground">Espacio que se liberará:</span>
              <span
                className={[
                  'rounded-lg px-2 py-0.5 font-semibold text-emerald-600',
                  'bg-emerald-500/10 dark:text-emerald-400',
                ].join(' ')}
              >
                {formatBytes(totalBytes)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-3 flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-sky-700 dark:text-sky-300">
                Recomendación de seguridad
              </p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Te sugerimos descargar un respaldo comprimido (.zip) con los archivos organizados por
                carpetas antes de eliminarlos definitivamente de la nube.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-700 dark:text-amber-400">Acción irreversible</p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Los archivos binarios se eliminarán de la nube. La auditoría quedará registrada.
                Los contratos legales firmados no se eliminarán salvo autorización individual.
              </p>
            </div>
          </div>

          {loading && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2 animate-in fade-in-50">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-primary flex items-center gap-1.5 truncate max-w-[320px]">
                  <Loader2 className="size-3.5 animate-spin shrink-0" />
                  {progressStep}
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {errorMessage && (
            <div
              className={[
                'flex items-center gap-2 rounded-xl border border-destructive/40',
                'bg-destructive/10 p-3 text-destructive',
              ].join(' ')}
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter className="w-full pt-1">
          {canDownload ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <AlertDialogCancel disabled={loading} onClick={onClose} className="w-full text-xs m-0 rounded-xl">
                Cancelar
              </AlertDialogCancel>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={handleDownloadOnly}
                className="w-full gap-1.5 text-xs rounded-xl"
              >
                <Download className="size-3.5" />
                <span>Solo descargar (.zip)</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => void executePurge()}
                className="w-full gap-1.5 text-xs rounded-xl font-medium shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Depurando... {progress}%</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Confirmar y Vaciar</span>
                  </>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={loading}
                onClick={handleDownloadAndPurge}
                className="w-full gap-1.5 text-xs rounded-xl font-medium shadow-xs bg-sky-600 hover:bg-sky-700 text-white"
              >
                <ShieldCheck className="size-3.5" />
                <span>Descargar y vaciar</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 w-full">
              <AlertDialogCancel disabled={loading} onClick={onClose} className="w-full sm:w-auto text-xs rounded-xl">
                Cancelar
              </AlertDialogCancel>
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => void executePurge()}
                className="w-full sm:w-auto gap-2 text-xs rounded-xl font-medium shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Depurando... {progress}%</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    <span>Confirmar y Vaciar</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
