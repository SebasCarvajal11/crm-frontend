import { useState } from 'react'
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Download,
  Archive,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatBytes } from '@/shared/lib'
import { downloadGatewayFile } from '@/features/collab/utils'
import { FileMobileCard } from './file-mobile-card'
import { FileTableRow } from './file-table-row'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  files: StorageFileItem[]
  accessToken: string
  onSelectForPurge: (file: StorageFileItem) => void
  onDownloadBatch?: (selectedFiles: StorageFileItem[]) => void
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

export function FileManagerTable({
  files,
  accessToken,
  onSelectForPurge,
  onDownloadBatch,
}: Props) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleDownload = async (file: StorageFileItem) => {
    setDownloadingId(file.id)
    try {
      await downloadGatewayFile(accessToken, file.id, file.fileName)
    } finally {
      setDownloadingId(null)
    }
  }

  const activeFiles = files.filter((f) => !f.isPurged)
  const allActiveSelected =
    activeFiles.length > 0 && activeFiles.every((f) => selectedIds.has(f.id))

  const toggleSelectAll = () => {
    if (allActiveSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(activeFiles.map((f) => f.id)))
    }
  }

  const toggleSelectFile = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
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

  const activeBytesInView = activeFiles.reduce((acc, f) => acc + f.sizeBytes, 0)
  const selectedFiles = files.filter((f) => selectedIds.has(f.id))
  const selectedBytes = selectedFiles.reduce((acc, f) => acc + f.sizeBytes, 0)

  return (
    <div className="h-full flex flex-col rounded-lg border border-border/60 overflow-hidden bg-background shadow-2xs">
      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border-b border-primary/20 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {selectedIds.size} {selectedIds.size === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
            </span>
            <span className="text-muted-foreground font-mono">
              ({formatBytes(selectedBytes)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setSelectedIds(new Set())}
            >
              Limpiar selección
            </Button>
            {onDownloadBatch && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => onDownloadBatch(selectedFiles)}
              >
                <Download className="size-3.5" />
                Descargar lote (.zip)
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="block sm:hidden flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {files.map((file) => (
          <FileMobileCard
            key={file.id}
            file={file}
            isSelected={selectedIds.has(file.id)}
            isDownloading={downloadingId === file.id}
            onToggleSelect={toggleSelectFile}
            onDownload={handleDownload}
            onSelectForPurge={onSelectForPurge}
            getFileIcon={getFileIcon}
            formatDate={formatDate}
          />
        ))}
      </div>

      <div className="hidden sm:block flex-1 overflow-auto">
        <Table className="table-fixed w-full min-w-[780px]">
          <colgroup>
            <col className="w-[44px]" />
            <col className="w-[220px]" />
            <col className="w-[140px]" />
            <col className="w-[90px]" />
            <col className="w-[110px]" />
            <col className="w-[100px]" />
            <col className="w-[76px]" />
          </colgroup>
          <TableHeader className="sticky top-0 z-10 bg-muted/85 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
            <TableRow className="border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-transparent">
              <TableHead className="w-[44px] text-center border-r border-border/40 py-2.5">
                <Checkbox
                  checked={allActiveSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Seleccionar todos los archivos activos"
                  disabled={activeFiles.length === 0}
                />
              </TableHead>
              <TableHead className="w-[220px] border-r border-border/40 py-2.5">
                Archivo
              </TableHead>
              <TableHead className="w-[140px] border-r border-border/40 py-2.5">
                Carpeta
              </TableHead>
              <TableHead className="w-[90px] border-r border-border/40 py-2.5">
                Tamaño
              </TableHead>
              <TableHead className="w-[110px] border-r border-border/40 py-2.5">
                Fecha
              </TableHead>
              <TableHead className="w-[100px] border-r border-border/40 py-2.5">
                Estado
              </TableHead>
              <TableHead className="w-[76px] text-right py-2.5">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <FileTableRow
                key={file.id}
                file={file}
                isSelected={selectedIds.has(file.id)}
                isDownloading={downloadingId === file.id}
                onToggleSelect={toggleSelectFile}
                onDownload={handleDownload}
                onSelectForPurge={onSelectForPurge}
                getFileIcon={getFileIcon}
                formatDate={formatDate}
              />
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
