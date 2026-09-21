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
import { downloadGatewayFile } from '@/features/collab/utils'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  files: StorageFileItem[]
  accessToken: string
  onSelectForPurge: (file: StorageFileItem) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

function getFileIcon(mime: string) {
  if (mime.includes('pdf')) return <FileText className="size-4 text-rose-500" />
  if (mime.includes('image')) return <FileCode className="size-4 text-sky-500" />
  if (mime.includes('spreadsheet') || mime.includes('excel')) {
    return <FileSpreadsheet className="size-4 text-emerald-500" />
  }
  return <FileText className="size-4 text-muted-foreground" />
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
      <div
        className={
          'flex flex-col items-center justify-center p-8 text-center ' +
          'text-muted-foreground border rounded-lg bg-muted/10'
        }
      >
        <Archive className="size-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No hay archivos en esta carpeta o filtro</p>
        <p className="text-xs">Los archivos subidos aparecerán organizados aquí.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[300px]">Archivo</TableHead>
            <TableHead>Carpeta</TableHead>
            <TableHead>Tamaño</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.id}
              className={file.isPurged ? 'opacity-60 bg-muted/10' : undefined}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {getFileIcon(file.mimeType)}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate max-w-[240px]">
                      {file.fileName}
                    </p>
                    {file.taskTitle && (
                      <span className="text-[10px] text-muted-foreground truncate block">
                        Tarea: {file.taskTitle}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {file.folder}
                </Badge>
              </TableCell>

              <TableCell className="text-xs font-mono">
                {formatBytes(file.sizeBytes)}
              </TableCell>

              <TableCell className="text-xs text-muted-foreground">
                {formatDate(file.createdAt)}
              </TableCell>

              <TableCell>
                {file.isPurged ? (
                  <Badge variant="secondary" className="text-[10px] bg-rose-500/10 text-rose-600">
                    Espacio liberado
                  </Badge>
                ) : file.isSignedContract ? (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600">
                    Contrato firmado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-emerald-600">
                    Activo
                  </Badge>
                )}
              </TableCell>

              <TableCell className="text-right space-x-1">
                {!file.isPurged && (
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
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
