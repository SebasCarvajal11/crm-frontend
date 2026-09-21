import { useState } from 'react'
import { AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react'
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

  if (!file) return null

  const isSigned = file.isSignedContract

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(reason, forceSigned)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Trash2 className="size-5 text-rose-600" />
            Depurar Archivo para Liberar Espacio
          </DialogTitle>
          <DialogDescription>
            Esta acción eliminará el archivo binario en la nube para recuperar espacio en la cuota de 10 GB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="font-semibold text-foreground truncate">{file.fileName}</p>
            <p className="text-xs text-muted-foreground">
              Proyecto: <span className="font-medium text-foreground">{file.projectName}</span>
            </p>
            <p className="text-xs text-emerald-600 font-medium">
              Espacio que se liberará: {formatBytes(file.sizeBytes)}
            </p>
          </div>

          {isSigned && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs">
                <AlertTriangle className="size-4" />
                <span>Advertencia: Contrato Firmado</span>
              </div>
              <p className="text-xs text-muted-foreground">
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
                  className="text-xs font-medium leading-none cursor-pointer"
                >
                  Confirmo la autorización para depurar este contrato
                </label>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="purge-reason" className="text-xs text-muted-foreground">
              Motivo administrativo:
            </label>
            <Input
              id="purge-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Proyecto cerrado hace más de 6 meses"
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={loading || (isSigned && !forceSigned)}
            className="gap-1.5"
          >
            {loading ? (
              'Depurando...'
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Confirmar y Liberar Espacio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
