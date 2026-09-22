import { useState } from 'react'
import { AlertTriangle, Trash2, CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  file: StorageFileItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, forcePurgeSigned: boolean) => Promise<void>
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FilePurgeDialog({ file, isOpen, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('Liberación de espacio de almacenamiento')
  const [forceSigned, setForceSigned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressStep, setProgressStep] = useState('')

  if (!file) return null

  const isSigned = file.isSignedContract

  const handleConfirm = async () => {
    setLoading(true)
    setErrorMessage(null)
    setProgress(15)
    setProgressStep('Conectando con almacenamiento en la nube...')

    let current = 15
    const interval = setInterval(() => {
      current = Math.min(current + Math.floor(Math.random() * 16) + 10, 92)
      setProgress(current)
      if (current >= 35 && current < 70) {
        setProgressStep('Eliminando objeto binario...')
      } else if (current >= 70 && current < 90) {
        setProgressStep('Actualizando cuota y auditoría...')
      }
    }, 250)

    try {
      await onConfirm(reason, forceSigned)
      clearInterval(interval)
      setProgress(100)
      setProgressStep('¡Archivo depurado con éxito!')
      setTimeout(() => {
        setLoading(false)
        onClose()
      }, 400)
    } catch (err) {
      clearInterval(interval)
      const msg = err instanceof Error ? err.message : 'Error al depurar el archivo'
      setErrorMessage(msg)
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !loading) {
        setErrorMessage(null)
        onClose()
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 shrink-0 ring-1 ring-rose-500/20">
              <Trash2 className="size-5" />
            </div>
            <div className="space-y-0.5 min-w-0 pr-8">
              <DialogTitle className="text-base font-semibold text-foreground">
                Depurar Archivo para Liberar Espacio
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Esta acción eliminará el archivo binario en la nube para recuperar espacio en la cuota.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 px-5 py-4 sm:px-6 text-sm">
          <div className="rounded-xl border border-border/80 bg-muted/25 p-3.5 space-y-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground block">Archivo</span>
              <p className="font-semibold text-foreground break-words text-xs">{file.fileName}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block">Proyecto</span>
                <span className="font-medium text-foreground text-xs break-words block">{file.projectName}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block">Espacio a liberar</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs block">
                  {formatBytes(file.sizeBytes)}
                </span>
              </div>
            </div>
          </div>

          {isSigned && (
            <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Advertencia: Contrato Firmado</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este archivo corresponde a un contrato legal firmado.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="confirm-signed"
                  checked={forceSigned}
                  onCheckedChange={(checked) => setForceSigned(Boolean(checked))}
                />
                <label
                  htmlFor="confirm-signed"
                  className="text-xs font-medium leading-none cursor-pointer text-foreground"
                >
                  Confirmo la autorización para depurar este contrato
                </label>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="purge-reason" className="text-xs text-muted-foreground font-medium">
              Motivo administrativo:
            </label>
            <Input
              id="purge-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Proyecto cerrado hace más de 6 meses"
              className="text-xs h-9"
              disabled={loading}
            />
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
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto text-xs"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="default"
            onClick={handleConfirm}
            disabled={loading || (isSigned && !forceSigned)}
            className="w-full sm:w-auto gap-2 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Depurando... {progress}%</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Confirmar y Liberar Espacio</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
