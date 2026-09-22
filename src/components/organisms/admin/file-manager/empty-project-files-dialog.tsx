import { useState } from 'react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
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

type Props = {
  isOpen: boolean
  projectName: string
  filesCount: number
  totalBytes: number
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function EmptyProjectFilesDialog({
  isOpen,
  projectName,
  filesCount,
  totalBytes,
  onClose,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressStep, setProgressStep] = useState('')

  const handleConfirm = async () => {
    setLoading(true)
    setErrorMessage(null)
    setProgress(12)
    setProgressStep('Preparando depuración segura...')

    let current = 12
    const interval = setInterval(() => {
      current = Math.min(current + Math.floor(Math.random() * 14) + 8, 92)
      setProgress(current)
      if (current >= 30 && current < 65) {
        setProgressStep('Eliminando archivos binarios en la nube...')
      } else if (current >= 65 && current < 90) {
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

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialogContent className="max-w-md">
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
          <div className="rounded-xl border border-border/80 bg-muted/25 p-3.5 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-border/40">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">Proyecto afectado:</span>
                <span className="font-semibold text-foreground text-xs break-words block">{projectName}</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Total de archivos a depurar: {filesCount}
                </span>
                <span className="font-semibold text-foreground text-xs block">{filesCount} documentos</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-muted-foreground">Espacio que se liberará:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {formatBytes(totalBytes)}
              </span>
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
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3 space-y-2 animate-in fade-in-50">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  {progressStep}
                </span>
                <span className="text-foreground font-mono">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-rose-200/40 dark:bg-rose-950/40"
                indicatorClassName="bg-rose-600"
              />
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel disabled={loading} onClick={onClose} className="w-full sm:w-auto text-xs">
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            size="default"
            disabled={loading}
            onClick={handleConfirm}
            className="w-full sm:w-auto gap-2 text-xs"
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
