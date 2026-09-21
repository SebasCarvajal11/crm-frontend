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
    <div className="md:col-span-4 space-y-2 max-h-[480px] overflow-y-auto pr-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Clientes ({clients.length})
      </p>
      {clients.map((client) => {
        const isSelected = client.clientSub === activeClientSub
        return (
          <div
            key={client.clientSub}
            data-testid="storage-client-item"
            className={`rounded-lg border p-2.5 transition-colors cursor-pointer text-xs ${
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border/60 hover:bg-muted/30'
            }`}
            onClick={() => {
              onSelectClient(client.clientSub, client.projects[0]?.projectId ?? null)
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
                  const isProjSelected = proj.projectId === activeProjectId
                  return (
                    <button
                      key={proj.projectId}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectProject(proj.projectId)
                      }}
                      className={
                        `w-full flex items-center justify-between px-2 py-1 rounded text-[11px] text-left ` +
                        `transition-colors ${
                          isProjSelected
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-muted/40'
                        }`
                      }
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
  )
}
