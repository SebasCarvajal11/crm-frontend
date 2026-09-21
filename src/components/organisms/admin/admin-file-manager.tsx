import { useState } from 'react'
import {
  FolderTree,
  Search,
  Building2,
  Briefcase,
  Trash2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStorageExplorer } from '@/features/admin/hooks/use-admin-storage-explorer'
import { FileManagerTable } from './file-manager/file-table'
import { FilePurgeDialog } from './file-manager/purge-dialog'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  accessToken: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
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
    refresh,
    purgeFile,
    purgeBatch,
  } = useAdminStorageExplorer(accessToken)

  const [fileToPurge, setFileToPurge] = useState<StorageFileItem | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handlePurgeConfirm = async (reason: string, forcePurgeSigned: boolean) => {
    if (!fileToPurge) return
    const res = await purgeFile(fileToPurge.id, reason, forcePurgeSigned)
    setFeedback(`Se liberaron ${formatBytes(res.freedBytes)} correctamente.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleEmptyProjectFiles = async () => {
    if (!activeProject) return
    const confirmed = window.confirm(
      `¿Vaciar todos los archivos activos del proyecto "${activeProject.projectName}" para liberar espacio?`
    )
    if (!confirmed) return
    const res = await purgeBatch({
      projectId: activeProject.projectId,
      reason: 'Vaciado masivo por administración',
      forcePurgeSigned: false,
    })
    setFeedback(`Se depuraron ${res.purgedCount} archivos (${formatBytes(res.freedBytes)} liberados).`)
    setTimeout(() => setFeedback(null), 4000)
  }

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <FolderTree className="size-5 text-primary" />
              Gestor y Explorador de Archivos por Cliente
            </CardTitle>
            <CardDescription className="text-xs">
              Estructura jerárquica (Cliente → Proyectos → Categorías) para control de cuota (10 GB) y liberación de espacio.
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
            <div className="rounded border bg-muted/20 p-2">
              <p className="text-[11px] text-muted-foreground">Clientes con Archivos</p>
              <p className="font-semibold text-foreground">{data.summary.totalClients}</p>
            </div>
            <div className="rounded border bg-muted/20 p-2">
              <p className="text-[11px] text-muted-foreground">Proyectos Registrados</p>
              <p className="font-semibold text-foreground">{data.summary.totalProjects}</p>
            </div>
            <div className="rounded border bg-muted/20 p-2">
              <p className="text-[11px] text-muted-foreground">Espacio Activo en Nube</p>
              <p className="font-semibold text-foreground">{formatBytes(data.summary.totalBytes)}</p>
            </div>
            <div className="rounded border bg-emerald-500/10 border-emerald-500/30 p-2">
              <p className="text-[11px] text-muted-foreground">Espacio Purgado/Liberado</p>
              <p className="font-semibold text-emerald-600">{formatBytes(data.summary.purgedBytes)}</p>
            </div>
          </div>
        )}

        {feedback && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-600">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedback}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Panel Izquierdo: Clientes y Proyectos */}
          <div className="md:col-span-4 space-y-2 max-h-[480px] overflow-y-auto pr-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Clientes ({filteredClients.length})
            </p>
            {filteredClients.map((client) => {
              const isSelected = client.clientSub === activeClient?.clientSub
              return (
                <div
                  key={client.clientSub}
                  className={`rounded-lg border p-2.5 transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 hover:bg-muted/30'
                  }`}
                  onClick={() => {
                    setSelectedClientSub(client.clientSub)
                    setSelectedProjectId(client.projects[0]?.projectId ?? null)
                    setSelectedFolder(null)
                  }}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5 truncate">
                      <Building2 className="size-3.5 text-primary shrink-0" />
                      {client.clientName}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatBytes(client.totalBytes)}
                    </span>
                  </div>

                  {isSelected && client.projects.length > 0 && (
                    <div className="mt-2 space-y-1 pl-3 border-l-2 border-primary/30">
                      {client.projects.map((proj) => {
                        const isProjSelected = proj.projectId === activeProject?.projectId
                        return (
                          <button
                            key={proj.projectId}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProjectId(proj.projectId)
                              setSelectedFolder(null)
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] text-left transition-colors ${
                              isProjSelected
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-muted/40'
                            }`}
                          >
                            <span className="truncate">{proj.projectName}</span>
                            <span className="font-mono text-[10px]">{formatBytes(proj.totalBytes)}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Panel Derecho: Proyecto Seleccionado y Archivos */}
          <div className="md:col-span-8 space-y-3">
            {activeProject ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Briefcase className="size-4 text-primary" />
                      {activeProject.projectName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {activeClient?.clientName} • Total: {activeProject.totalFiles} archivos ({formatBytes(activeProject.totalBytes)})
                    </p>
                  </div>
                  {activeProject.totalFiles > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmptyProjectFiles}
                      disabled={isPurging}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5"
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
                    Todos ({activeProject.totalFiles})
                  </Button>
                  {Object.values(activeProject.folders).map((f) => (
                    <Button
                      key={f.folderKey}
                      variant={selectedFolder === f.folderKey ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSelectedFolder(f.folderKey)}
                    >
                      {f.folderLabel} ({f.totalFiles})
                    </Button>
                  ))}
                </div>

                {/* Tabla de Archivos */}
                <FileManagerTable
                  files={activeFiles}
                  accessToken={accessToken}
                  onSelectForPurge={(file) => setFileToPurge(file)}
                />
              </>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground border rounded-lg">
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
    </Card>
  )
}
