import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
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

type Props = {
  isOpen: boolean
  projectName: string
  filesCount: number
  totalBytes: number
  onClose: () => void
  onConfirm: () => Promise<void>
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
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

  const handleConfirm = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al vaciar los archivos del proyecto'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
            <Trash2 className="size-5 text-rose-600 shrink-0" />
            <span>Vaciar Archivos del Proyecto</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Esta acción depurará los archivos binarios activos de este proyecto para liberar espacio en la nube.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-1.5">
            <p className="text-muted-foreground">
              Proyecto afectado: <span className="font-semibold text-foreground">{projectName}</span>
            </p>
            <p className="text-muted-foreground">
              Total de archivos a depurar: <span className="font-semibold text-foreground">{filesCount}</span>
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Espacio estimado a liberar: {formatBytes(totalBytes)}
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-700 dark:text-amber-400">Acción irreversible</p>
              <p className="text-muted-foreground leading-relaxed">
                Los archivos binarios se eliminarán del almacenamiento en la nube. Los metadatos de auditoría
                quedarán registrados. Los contratos firmados no se eliminarán salvo autorización individual.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div
              className={
                'rounded-lg border border-destructive/40 bg-destructive/10 ' +
                'p-3 text-destructive flex items-center gap-2'
              }
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={loading} onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            size="default"
            disabled={loading}
            onClick={handleConfirm}
            className="gap-1.5"
          >
            <Trash2 className="size-4" />
            {loading ? 'Depurando archivos...' : 'Confirmar y Vaciar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
