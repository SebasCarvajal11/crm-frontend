import { Building2 } from 'lucide-react'
import type { StorageClientSummary } from '@/features/admin/api/admin-storage-explorer.api'

type Props = {
  clients: StorageClientSummary[]
  activeClientSub?: string | null
  activeProjectId?: string | null
  onSelectClient: (clientSub: string, defaultProjectId: string | null) => void
  onSelectProject: (projectId: string) => void
  formatBytes: (bytes: number) => string
}

export function ClientProjectTree({
  clients,
  activeClientSub,
  activeProjectId,
  onSelectClient,
  onSelectProject,
  formatBytes,
}: Props) {
  return (
    <aside
      data-tour="admin-file-client-tree"
      className="lg:col-span-4 flex flex-col min-h-0 lg:h-full border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/10"
    >
      <div className="p-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="size-3.5 text-primary" />
          Clientes y Proyectos
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
          {clients.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[220px] lg:max-h-none">
        {clients.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No se encontraron clientes
          </div>
        ) : (
          clients.map((client) => {
            const isSelected = client.clientSub === activeClientSub
            return (
              <div
                key={client.clientSub}
                data-testid="storage-client-item"
                className={`rounded-lg border p-2.5 transition-colors cursor-pointer text-xs ${
                  isSelected
                    ? 'border-primary/80 bg-primary/5 shadow-2xs'
                    : 'border-border/60 hover:bg-muted/30'
                }`}
                onClick={() => {
                  onSelectClient(client.clientSub, client.projects[0]?.projectId ?? null)
                }}
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 truncate">
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{client.clientName}</span>
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0 ml-1">
                    {formatBytes(client.totalBytes)}
                  </span>
                </div>

                {isSelected && client.projects.length > 0 && (
                  <div className="mt-2 space-y-1 pl-2.5 border-l-2 border-primary/30">
                    {client.projects.map((proj) => {
                      const isProjSelected = proj.projectId === activeProjectId
                      return (
                        <button
                          key={proj.projectId}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectProject(proj.projectId)
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] text-left transition-colors ${
                            isProjSelected
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-muted/40'
                          }`}
                        >
                          <span className="truncate">{proj.projectName}</span>
                          <span className="font-mono text-[10px] shrink-0 ml-1">
                            {formatBytes(proj.totalBytes)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
