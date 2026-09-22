import { useState, useMemo } from 'react'
import { FolderTree, Search, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBytes } from '@/shared/lib'
import { useAdminStorageExplorer } from '@/features/admin/hooks/use-admin-storage-explorer'
import {
  exportProjectFilesAsZip,
  type ExportProgress,
} from '@/features/admin/services/storage-zip-exporter.service'
import { FileManagerTable } from './file-manager/file-table'
import { FilePurgeDialog } from './file-manager/purge-dialog'
import { EmptyProjectFilesDialog } from './file-manager/empty-project-files-dialog'
import { ClientProjectTree } from './file-manager/client-project-tree'
import { StorageSummaryCards } from './file-manager/storage-summary-cards'
import { ProjectDetailHeader } from './file-manager/project-detail-header'
import { FolderFilterTabs } from './file-manager/folder-filter-tabs'
import { BulkExportProgressDialog } from './file-manager/bulk-export-progress-dialog'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  accessToken: string
}

export function AdminFileManager({ accessToken }: Props) {
  const {
    data,
    loading,
    isPurging,
    searchTerm,
    setSearchTerm,
    setSelectedClientSub,
    setSelectedProjectId,
    selectedFolder,
    setSelectedFolder,
    filteredClients,
    activeClient,
    activeProject,
    activeFiles,
    projectStats,
    refresh,
    purgeFile,
    purgeBatch,
  } = useAdminStorageExplorer(accessToken)

  const [fileToPurge, setFileToPurge] = useState<StorageFileItem | null>(null)
  const [emptyDialogOpen, setEmptyDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null)

  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportTitle, setExportTitle] = useState('Descarga en Paquete')
  const [exportError, setExportError] = useState<string | null>(null)

  const activeProjectFiles = useMemo(() => {
    if (!activeProject) return []
    return Object.values(activeProject.folders ?? {}).flatMap((f) => f.files)
  }, [activeProject])

  const handleCloseExport = () => {
    setExportDialogOpen(false)
    setExportProgress(null)
    setExportError(null)
  }

  const handlePurgeConfirm = async (reason: string, forcePurgeSigned: boolean) => {
    if (!fileToPurge) return
    try {
      const res = await purgeFile(fileToPurge.id, reason, forcePurgeSigned)
      setFeedback(`Se liberaron ${formatBytes(res.freedBytes)} correctamente.`)
      setTimeout(() => setFeedback(null), 4000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al depurar el archivo'
      setErrorFeedback(msg)
      setTimeout(() => setErrorFeedback(null), 5000)
      throw err
    }
  }

  const handleEmptyProjectConfirm = async () => {
    if (!activeProject) return
    try {
      const res = await purgeBatch({
        projectId: activeProject.projectId,
        reason: 'Vaciado masivo por administración',
        forcePurgeSigned: false,
      })
      setFeedback(`Se depuraron ${res.purgedCount} archivos (${formatBytes(res.freedBytes)} liberados).`)
      setTimeout(() => setFeedback(null), 4000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al vaciar los archivos'
      setErrorFeedback(msg)
      setTimeout(() => setErrorFeedback(null), 5000)
      throw err
    }
  }

  const handleExportProjectZip = async () => {
    if (!activeProject || activeProjectFiles.length === 0) return
    setExportTitle(`Descargando ${activeProject.projectName} (.zip)`)
    setExportError(null)
    setExportDialogOpen(true)
    try {
      await exportProjectFilesAsZip({
        accessToken,
        clientName: activeClient?.clientName || 'Cliente',
        projectName: activeProject.projectName,
        files: activeProjectFiles,
        onProgress: setExportProgress,
      })
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al exportar paquete')
    }
  }

  const handleExportBatchZip = async (selectedFiles: StorageFileItem[]) => {
    if (!activeProject || selectedFiles.length === 0) return
    setExportTitle(`Descargando selección (${selectedFiles.length} archivos)`)
    setExportError(null)
    setExportDialogOpen(true)
    try {
      await exportProjectFilesAsZip({
        accessToken,
        clientName: activeClient?.clientName || 'Cliente',
        projectName: `${activeProject.projectName}_lote`,
        files: selectedFiles,
        onProgress: setExportProgress,
      })
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al exportar lote')
    }
  }

  if (loading && !data) {
    return (
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <FolderTree className="size-5 text-primary" />
              Gestor y Explorador de Archivos por Cliente
            </CardTitle>
            <CardDescription className="text-xs">
              Estructura jerárquica (Cliente → Proyectos → Categorías) para control de cuota y
              liberación de espacio.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            disabled={loading || isPurging}
            className="gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {data?.summary && <StorageSummaryCards summary={data.summary} />}

        {feedback && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-600">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {errorFeedback && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, proyecto o nombre de archivo..."
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="rounded-xl border border-border/70 bg-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-auto min-h-0 lg:h-[640px] shadow-2xs">
          <ClientProjectTree
            clients={filteredClients}
            activeClientSub={activeClient?.clientSub}
            activeProjectId={activeProject?.projectId}
            onSelectClient={(clientSub, firstProjectId) => {
              setSelectedClientSub(clientSub)
              setSelectedProjectId(firstProjectId)
              setSelectedFolder(null)
            }}
            onSelectProject={(projectId) => {
              setSelectedProjectId(projectId)
              setSelectedFolder(null)
            }}
            formatBytes={formatBytes}
          />

          <div className="lg:col-span-8 flex flex-col min-h-0 lg:h-full p-4 space-y-3 bg-background">
            {activeProject ? (
              <>
                <ProjectDetailHeader
                  projectName={activeProject.projectName}
                  clientName={activeClient?.clientName}
                  projectStats={projectStats}
                  isPurging={isPurging}
                  onExportZip={handleExportProjectZip}
                  onOpenEmptyDialog={() => setEmptyDialogOpen(true)}
                />

                <FolderFilterTabs
                  folders={activeProject.folders ?? {}}
                  selectedFolder={selectedFolder}
                  totalFiles={projectStats.totalFiles}
                  onSelectFolder={setSelectedFolder}
                />

                <div className="min-h-0 flex flex-col lg:flex-1">
                  <FileManagerTable
                    files={activeFiles}
                    accessToken={accessToken}
                    onSelectForPurge={(file) => setFileToPurge(file)}
                    onDownloadBatch={handleExportBatchZip}
                  />
                </div>
              </>
            ) : (
              <div className="min-h-[160px] lg:h-full py-8 px-4 sm:py-12 flex flex-col items-center justify-center text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                Selecciona un cliente y proyecto para explorar sus archivos.
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <FilePurgeDialog
        file={fileToPurge}
        isOpen={Boolean(fileToPurge)}
        onClose={() => setFileToPurge(null)}
        onConfirm={handlePurgeConfirm}
      />

      {activeProject && (
        <EmptyProjectFilesDialog
          isOpen={emptyDialogOpen}
          projectName={activeProject.projectName}
          clientName={activeClient?.clientName}
          filesCount={activeProject.totalFiles}
          totalBytes={activeProject.totalBytes}
          files={activeProjectFiles}
          accessToken={accessToken}
          onClose={() => setEmptyDialogOpen(false)}
          onConfirm={handleEmptyProjectConfirm}
        />
      )}

      <BulkExportProgressDialog
        isOpen={exportDialogOpen}
        title={exportTitle}
        progress={exportProgress}
        error={exportError}
        onClose={handleCloseExport}
      />
    </Card>
  )
}
