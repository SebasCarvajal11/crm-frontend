import { useState } from 'react'
import {
  FolderTree,
  Search,
  Briefcase,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBytes } from '@/shared/lib'
import { useAdminStorageExplorer } from '@/features/admin/hooks/use-admin-storage-explorer'
import { FileManagerTable } from './file-manager/file-table'
import { FilePurgeDialog } from './file-manager/purge-dialog'
import { EmptyProjectFilesDialog } from './file-manager/empty-project-files-dialog'
import { ClientProjectTree } from './file-manager/client-project-tree'
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
      setFeedback(
        `Se depuraron ${res.purgedCount} archivos (${formatBytes(res.freedBytes)} liberados).`
      )
      setTimeout(() => setFeedback(null), 4000)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al vaciar los archivos del proyecto'
      setErrorFeedback(msg)
      setTimeout(() => setErrorFeedback(null), 5000)
      throw err
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

        {data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <p className="text-[11px] text-muted-foreground">Clientes con Archivos</p>
              <p className="font-semibold text-foreground text-sm">{data.summary.totalClients}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <p className="text-[11px] text-muted-foreground">Proyectos Registrados</p>
              <p className="font-semibold text-foreground text-sm">{data.summary.totalProjects}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <p className="text-[11px] text-muted-foreground">Espacio Activo en Nube</p>
              <p className="font-semibold text-foreground text-sm">{formatBytes(data.summary.totalBytes)}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
              <p className="text-[11px] text-muted-foreground">Espacio Purgado/Liberado</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatBytes(data.summary.purgedBytes)}
              </p>
            </div>
          </div>
        )}

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

        <div className="rounded-xl border border-border/70 bg-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px] lg:h-[640px] shadow-2xs">
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

          {/* Panel Derecho: Proyecto Seleccionado y Archivos */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-0 p-4 space-y-3 bg-background">
            {activeProject ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Briefcase className="size-4 text-primary" />
                      {activeProject.projectName}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cliente: <span className="font-medium text-foreground">{activeClient?.clientName}</span>
                      {' • '}
                      Total: <span className="font-semibold text-foreground">{projectStats.totalFiles}</span> archivos
                      {' ('}
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        {projectStats.activeFilesCount} en nube: {formatBytes(projectStats.activeBytes)}
                      </span>
                      {projectStats.purgedFilesCount > 0 && (
                        <>
                          {' • '}
                          <span className="text-rose-600 dark:text-rose-400">
                            {projectStats.purgedFilesCount} liberados
                          </span>
                        </>
                      )}
                      {')'}
                    </p>
                  </div>
                  {projectStats.activeFilesCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmptyDialogOpen(true)}
                      disabled={isPurging}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                      Vaciar archivos del proyecto
                    </Button>
                  )}
                </div>

                {/* Filtro de Categorías */}
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant={selectedFolder === null ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelectedFolder(null)}
                  >
                    Todos ({projectStats.totalFiles})
                  </Button>
                  {Object.values(activeProject.folders ?? {}).map((f) => (
                    <Button
                      key={f.folderKey}
                      variant={selectedFolder === f.folderKey ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSelectedFolder(f.folderKey)}
                    >
                      {f.folderLabel} ({f.files.length})
                    </Button>
                  ))}
                </div>

                {/* Tabla de Archivos con flex-1 para encajar en el layout */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <FileManagerTable
                    files={activeFiles}
                    accessToken={accessToken}
                    onSelectForPurge={(file) => setFileToPurge(file)}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/5">
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
          filesCount={activeProject.totalFiles}
          totalBytes={activeProject.totalBytes}
          onClose={() => setEmptyDialogOpen(false)}
          onConfirm={handleEmptyProjectConfirm}
        />
      )}
    </Card>
  )
}
