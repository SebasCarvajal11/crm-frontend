import { Download, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatBytes } from '@/shared/lib'
import { getFolderLabel, getFolderBadgeClass } from './file-manager.constants'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  file: StorageFileItem
  isSelected: boolean
  isDownloading: boolean
  onToggleSelect: (id: string) => void
  onDownload: (file: StorageFileItem) => void
  onSelectForPurge: (file: StorageFileItem) => void
  getFileIcon: (mime?: string) => React.ReactNode
  formatDate: (iso: string) => string
}

/** Tarjeta móvil táctil y compacta para visualización ergonómica de archivos en pantallas pequeñas. */
export function FileMobileCard({
  file,
  isSelected,
  isDownloading,
  onToggleSelect,
  onDownload,
  onSelectForPurge,
  getFileIcon,
  formatDate,
}: Props) {
  const isPurged = file.isPurged

  return (
    <div
      className={`rounded-xl border p-3.5 transition-all ${
        isSelected
          ? 'border-primary/40 bg-primary/5 shadow-xs'
          : isPurged
            ? 'border-border/40 bg-muted/10 opacity-70'
            : 'border-border/60 bg-card hover:border-border'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(file.id)}
          disabled={isPurged}
          aria-label={`Seleccionar ${file.fileName}`}
          className="mt-1"
        />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon(file.mimeType)}
              <span className="text-xs font-semibold text-foreground truncate" title={file.fileName}>
                {file.fileName}
              </span>
            </div>

            {isPurged ? (
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-400"
              >
                Depurado
              </Badge>
            ) : (
              <Badge variant="outline" className="shrink-0 text-[10px] border-emerald-500/30 text-emerald-600">
                Activo
              </Badge>
            )}
          </div>

          {file.taskTitle && (
            <p className="text-[10px] text-muted-foreground truncate" title={file.taskTitle}>
              Tarea: {file.taskTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="outline" className={`text-[10px] ${getFolderBadgeClass(file.folder)}`}>
              {getFolderLabel(file.folder)}
            </Badge>
            <span className="font-mono font-medium text-foreground/80">{formatBytes(file.sizeBytes)}</span>
            <span>•</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 px-2.5"
              disabled={isDownloading || isPurged}
              onClick={() => onDownload(file)}
            >
              {isDownloading ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Descargar
            </Button>

            {!isPurged && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 px-2 text-destructive hover:bg-destructive/10"
                onClick={() => onSelectForPurge(file)}
              >
                <Trash2 className="size-3" />
                Depurar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
