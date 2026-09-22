import { Calendar, UserCheck, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminUserRow } from '@/features/admin/model'

type Props = {
  clients: AdminUserRow[]
  isLoading: boolean
}

function formatDate(iso?: string) {
  if (!iso) return 'Reciente'
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getClientDisplayName(client: AdminUserRow) {
  if (client.company_name) return client.company_name
  const full = `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()
  return full || client.email
}

export function OverviewAdminRecentClientsSection({ clients, isLoading }: Props) {
  return (
    <Card className="shadow-sm border border-border/80 min-w-0 w-full max-w-full overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3 min-w-0 w-full">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary shrink-0" />
            <CardTitle className="text-base font-bold truncate">Últimos clientes</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Los 5 clientes más recientes registrados en el sistema.
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs font-semibold shrink-0">
          {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}
        </Badge>
      </CardHeader>
      <CardContent className="min-w-0 w-full max-w-full overflow-hidden">
        {isLoading ? (
          <div className="space-y-2.5 min-w-0 w-full">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center min-w-0 w-full">
            <Users className="size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">Sin clientes registrados</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aún no hay clientes dados de alta en la plataforma.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 min-w-0 w-full max-w-full overflow-hidden">
            {clients.slice(0, 5).map((client) => {
              const name = getClientDisplayName(client)
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between gap-2 py-2.5 px-2 rounded-md interactive-row min-w-0 w-full overflow-hidden"
                >
                  <div className="min-w-0 flex-1 space-y-0.5 overflow-hidden">
                    <p className="truncate text-xs font-bold text-foreground block min-w-0 w-full">{name}</p>
                    <p className="truncate text-[11px] text-muted-foreground block min-w-0 w-full">{client.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      {formatDate(client.created_at)}
                    </span>
                    <Badge
                      variant={client.is_active ? 'default' : 'secondary'}
                      className="text-[10px] font-semibold"
                    >
                      {client.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
