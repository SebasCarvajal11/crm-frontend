import { Download, Shield, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib'

type Channel = 'external' | 'internal'

interface Props {
  channel: Channel
  onChannelChange: (next: Channel) => void
  isClient: boolean
  isAdmin: boolean
  onOpenExport: () => void
}

export function ChatPanelHeader({
  channel,
  onChannelChange,
  isClient,
  isAdmin,
  onOpenExport,
}: Props) {
  return (
    <div className="shrink-0 border-b bg-muted/20 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {channel === 'external' ? 'Chat con el Cliente' : 'Chat del Equipo'}
          </p>
          <p className="text-xs text-muted-foreground">
            {channel === 'external' ? (
              'Canal compartido con el cliente'
            ) : (
              <span className="flex items-center gap-1">
                <Shield className="size-3 inline" />
                Canal privado del equipo
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isClient && (
            <div
              className="flex gap-1 rounded-lg border bg-background p-0.5"
              role="tablist"
              aria-label="Seleccionar canal"
            >
              {(['external', 'internal'] as const).map((nextChannel) => (
                <button
                  key={nextChannel}
                  role="tab"
                  aria-selected={channel === nextChannel}
                  onClick={() => onChannelChange(nextChannel)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
                    'transition-all duration-150 cursor-pointer active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    channel === nextChannel
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  {nextChannel === 'external' ? (
                    <>
                      <Users className="size-3" aria-hidden="true" />
                      Cliente
                    </>
                  ) : (
                    <>
                      <User className="size-3" aria-hidden="true" />
                      Equipo
                    </>
                  )}
                </button>
              ))}
            </div>
          )}

          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenExport}
              className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title="Descargar registro probatorio de la conversación"
              aria-label="Exportar conversación"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
