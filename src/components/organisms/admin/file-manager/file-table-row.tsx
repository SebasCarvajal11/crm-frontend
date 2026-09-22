import { Download, Trash2, Loader2 } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
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

function StatusBadge({ file }: { file: StorageFileItem }) {
  if (file.isPurged) {
    return (
      <Badge
        variant="secondary"
        className="text-[10px] border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400"
      >
        Espacio liberado
      </Badge>
    )
  }
  if (file.isSignedContract) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
      >
        Contrato firmado
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    >
      Activo
    </Badge>
  )
}

/** Fila individual estandarizada para la tabla de archivos de escritorio. */
export function FileTableRow({
  file,
  isSelected,
  isDownloading,
  onToggleSelect,
  onDownload,
  onSelectForPurge,
  getFileIcon,
  formatDate,
}: Props) {
  return (
    <TableRow
      className={`transition-colors border-b border-border/40 last:border-b-0 hover:bg-muted/30 ${
        file.isPurged ? 'opacity-65 bg-muted/10' : ''
      } ${isSelected ? 'bg-primary/5' : ''}`}
    >
      <TableCell className="border-r border-border/30 py-2 text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(file.id)}
          disabled={file.isPurged}
          aria-label={`Seleccionar ${file.fileName}`}
        />
      </TableCell>

      <TableCell className="border-r border-border/30 py-2">
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(file.mimeType)}
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate" title={file.fileName}>
              {file.fileName}
            </p>
            {file.taskTitle && (
              <span className="text-[10px] text-muted-foreground truncate block" title={file.taskTitle}>
                Tarea: {file.taskTitle}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="border-r border-border/30 py-2">
        <Badge
          variant="outline"
          className={`text-[10px] truncate max-w-full ${getFolderBadgeClass(file.folder)}`}
        >
          {getFolderLabel(file.folder)}
        </Badge>
      </TableCell>

      <TableCell className="border-r border-border/30 py-2 text-xs font-mono">
        {formatBytes(file.sizeBytes)}
      </TableCell>

      <TableCell className="border-r border-border/30 py-2 text-xs text-muted-foreground">
        {formatDate(file.createdAt)}
      </TableCell>

      <TableCell className="border-r border-border/30 py-2">
        <StatusBadge file={file} />
      </TableCell>

      <TableCell className="text-right space-x-1 py-2">
        {!file.isPurged ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onDownload(file)}
              disabled={isDownloading}
              title="Descargar archivo"
            >
              {isDownloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
              onClick={() => onSelectForPurge(file)}
              title="Depurar para liberar espacio"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground/60 italic" title="Archivo purgado - espacio recuperado">
            Liberado
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}
