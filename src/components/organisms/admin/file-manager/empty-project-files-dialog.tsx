import { useState } from 'react'
import {
  AlertTriangle,
  Trash2,
  Loader2,
  Download,
  ShieldCheck,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatBytes } from '@/shared/lib'
import {
  exportProjectFilesAsZip,
  type ExportProgress,
} from '@/features/admin/services/storage-zip-exporter.service'
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
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressStep, setProgressStep] = useState('')

  const executePurge = async () => {
    setLoading(true)
    setErrorMessage(null)
    setProgress(20)
    setProgressStep('Preparando depuración segura...')
    let current = 20
    const interval = setInterval(() => {
      current = Math.min(current + 15, 92)
      setProgress(current)
      if (current >= 45 && current < 75) {
        setProgressStep('Eliminando archivos binarios en la nube...')
      } else if (current >= 75) {
        setProgressStep('Liberando cuota y registrando auditoría...')
      }
    }, 280)

    try {
      await onConfirm()
      clearInterval(interval)
      setProgress(100)
      setProgressStep('¡Vaciado completado con éxito!')
      setTimeout(() => {
        setLoading(false)
        onClose()
      }, 400)
    } catch (err) {
      clearInterval(interval)
      const msg = err instanceof Error ? err.message : 'Error al vaciar los archivos del proyecto'
      setErrorMessage(msg)
      setLoading(false)
    }
  }

  const handleDownloadOnly = async () => {
    if (!accessToken || files.length === 0) return
    setLoading(true)
    setErrorMessage(null)
    try {
      await exportProjectFilesAsZip({
        accessToken,
        clientName,
        projectName,
        files,
        onProgress: (p: ExportProgress) => {
          setProgress(p.percent)
          setProgressStep(
            p.stage === 'compressing'
              ? 'Comprimiendo paquete ZIP...'
              : `Descargando archivo ${p.completedFiles + 1}/${p.totalFiles}...`
          )
        },
      })
      setProgress(100)
      setProgressStep('¡Respaldo descargado!')
      setTimeout(() => setLoading(false), 500)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al generar respaldo')
      setLoading(false)
    }
  }

  const handleDownloadAndPurge = async () => {
    if (!accessToken || files.length === 0) {
      await executePurge()
      return
    }
    setLoading(true)
    setErrorMessage(null)
    try {
      await exportProjectFilesAsZip({
        accessToken,
        clientName,
        projectName,
        files,
        onProgress: (p: ExportProgress) => {
          setProgress(Math.round(p.percent * 0.6))
          setProgressStep(
            p.stage === 'compressing'
              ? 'Comprimiendo respaldo...'
              : `Descargando copia ${p.completedFiles + 1}/${p.totalFiles}...`
          )
        },
      })
      await executePurge()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error en la operación')
      setLoading(false)
    }
  }

  const canDownload = Boolean(accessToken && files.some((f) => !f.isPurged))

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 shrink-0 ring-1 ring-rose-500/20">
              <Trash2 className="size-5" />
            </div>
            <div className="space-y-0.5">
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Vaciar Archivos del Proyecto
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Esta acción depurará los archivos binarios activos para liberar espacio en la nube.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-3 py-1 text-xs">
          <div className="rounded-xl border border-border/80 bg-muted/25 p-3 space-y-2">
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
                  Total de archivos a depurar: {filesCount}
                </span>
                <span className="font-semibold text-foreground text-xs block">
                  {filesCount} documentos
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-muted-foreground">Espacio que se liberará:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {formatBytes(totalBytes)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-sky-700 dark:text-sky-300">
                Recomendación de seguridad (Google Drive)
              </p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Te sugerimos descargar un respaldo comprimido (.zip) con los archivos organizados por
                carpetas antes de eliminarlos definitivamente de la nube.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-2.5 flex items-start gap-2.5">
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
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter className="w-full pt-1">
          {canDownload ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <AlertDialogCancel disabled={loading} onClick={onClose} className="w-full text-xs m-0">
                Cancelar
              </AlertDialogCancel>
              <Button
                variant="outline"
                size="default"
                disabled={loading}
                onClick={handleDownloadOnly}
                className="w-full gap-1.5 text-xs"
              >
                <Download className="size-3.5" />
                <span>Solo Descargar (.zip)</span>
              </Button>
              <Button
                variant="destructive"
                size="default"
                disabled={loading}
                onClick={() => void executePurge()}
                className="w-full gap-1.5 text-xs"
              >
                <Trash2 className="size-3.5" />
                <span>Confirmar y Vaciar</span>
              </Button>
              <Button
                variant="default"
                size="default"
                disabled={loading}
                onClick={handleDownloadAndPurge}
                className="w-full gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white"
              >
                <ShieldCheck className="size-3.5" />
                <span>Descargar y Vaciar</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 w-full">
              <AlertDialogCancel disabled={loading} onClick={onClose} className="w-full sm:w-auto text-xs">
                Cancelar
              </AlertDialogCancel>
              <Button
                variant="destructive"
                size="default"
                disabled={loading}
                onClick={() => void executePurge()}
                className="w-full sm:w-auto gap-2 text-xs"
              >
                <Trash2 className="size-4" />
                <span>Confirmar y Vaciar</span>
              </Button>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
