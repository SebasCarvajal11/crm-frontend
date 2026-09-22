import { useState } from 'react'
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Download,
  Trash2,
  Archive,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/shared/lib'
import { downloadGatewayFile } from '@/features/collab/utils'
import { getFolderLabel, getFolderBadgeClass } from './file-manager.constants'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  files: StorageFileItem[]
  accessToken: string
  onSelectForPurge: (file: StorageFileItem) => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function getFileIcon(mime?: string) {
  if (!mime) return <FileText className="size-4 text-muted-foreground shrink-0" />
  const lower = mime.toLowerCase()
  if (lower.includes('pdf')) return <FileText className="size-4 text-rose-500 shrink-0" />
  if (lower.includes('image')) return <FileCode className="size-4 text-sky-500 shrink-0" />
  if (lower.includes('spreadsheet') || lower.includes('excel')) {
    return <FileSpreadsheet className="size-4 text-emerald-500 shrink-0" />
  }
  return <FileText className="size-4 text-muted-foreground shrink-0" />
}

export function FileManagerTable({ files, accessToken, onSelectForPurge }: Props) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (file: StorageFileItem) => {
    setDownloadingId(file.id)
    try {
      await downloadGatewayFile(accessToken, file.id, file.fileName)
    } finally {
      setDownloadingId(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg bg-muted/10">
        <Archive className="size-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No hay archivos en esta carpeta o filtro</p>
        <p className="text-xs">Los archivos subidos aparecerán organizados aquí.</p>
      </div>
    )
  }

  const activeBytesInView = files
    .filter((f) => !f.isPurged)
    .reduce((acc, f) => acc + f.sizeBytes, 0)

  return (
    <div className="h-full flex flex-col rounded-lg border border-border/60 overflow-hidden bg-background shadow-2xs">
      <div className="flex-1 overflow-auto">
        <Table className="table-fixed w-full min-w-[680px]">
          <TableHeader className="sticky top-0 z-10 bg-muted/85 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
            <TableRow className="border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-transparent">
              <TableHead className="w-[34%] min-w-[200px] border-r border-border/40 py-2.5">
                Archivo
              </TableHead>
              <TableHead className="w-[18%] min-w-[130px] border-r border-border/40 py-2.5">
                Carpeta
              </TableHead>
              <TableHead className="w-[12%] min-w-[80px] border-r border-border/40 py-2.5">
                Tamaño
              </TableHead>
              <TableHead className="w-[14%] min-w-[100px] border-r border-border/40 py-2.5">
                Fecha
              </TableHead>
              <TableHead className="w-[12%] min-w-[90px] border-r border-border/40 py-2.5">
                Estado
              </TableHead>
              <TableHead className="w-[10%] min-w-[75px] text-right py-2.5">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow
                key={file.id}
                className={`transition-colors border-b border-border/40 last:border-b-0 hover:bg-muted/30 ${
                  file.isPurged ? 'opacity-65 bg-muted/10' : ''
                }`}
              >
                <TableCell className="border-r border-border/30 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(file.mimeType)}
                    <div className="min-w-0">
                      <p
                        className="text-xs font-medium text-foreground truncate"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>
                      {file.taskTitle && (
                        <span
                          className="text-[10px] text-muted-foreground truncate block"
                          title={file.taskTitle}
                        >
                          Tarea: {file.taskTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="border-r border-border/30 py-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] truncate max-w-full ${getFolderBadgeClass(
                      file.folder
                    )}`}
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
                  {file.isPurged ? (
                    <Badge
                      variant="secondary"
                      className="text-[10px] border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    >
                      Espacio liberado
                    </Badge>
                  ) : file.isSignedContract ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                    >
                      Contrato firmado
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    >
                      Activo
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right space-x-1 py-2">
                  {!file.isPurged ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleDownload(file)}
                        disabled={downloadingId === file.id}
                        title="Descargar archivo"
                      >
                        <Download className="size-3.5" />
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
                    <span
                      className="text-[10px] text-muted-foreground/60 italic"
                      title="Archivo purgado - espacio recuperado"
                    >
                      Liberado
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-3 py-2 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground">
        <span>
          Mostrando {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
        </span>
        <span className="font-mono">{formatBytes(activeBytesInView)} activos en nube</span>
      </div>
    </div>
  )
}
