import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Search, UsersRound } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SectionIntro } from '@/components/molecules/section-intro'
import { AdminUserActions } from './user-actions'
import {
  useAdminUsersTable,
  userDisplayName,
  userSecondaryName,
} from '@/features/admin/hooks'
import type { AdminUserRow, UserRole } from '@/features/admin/model'

type Props = {
  accessToken: string
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return (name[0] ?? 'U').toUpperCase()
}

function roleBadge(role: UserRole) {
  if (role === 'admin') {
    return (
      <Badge className="inline-flex min-w-[88px] justify-center rounded-full border-primary/20 bg-primary/10 text-primary hover:bg-primary/15">
        Admin
      </Badge>
    )
  }
  if (role === 'worker') {
    return (
      <Badge className="inline-flex min-w-[88px] justify-center rounded-full border-cyan-500/20 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/15 dark:text-cyan-400">
        Trabajador
      </Badge>
    )
  }
  return (
    <Badge className="inline-flex min-w-[88px] justify-center rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400">
      Cliente
    </Badge>
  )
}

function statusBadge(row: AdminUserRow) {
  if (row.deleted_at) {
    return (
      <Badge
        variant="destructive"
        className="inline-flex min-w-[88px] items-center justify-center gap-1.5 rounded-full"
      >
        <span className="size-1.5 rounded-full bg-red-200" />
        Archivado
      </Badge>
    )
  }
  if (row.is_active) {
    return (
      <Badge className="inline-flex min-w-[88px] items-center justify-center gap-1.5 rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Activo
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="inline-flex min-w-[88px] items-center justify-center gap-1.5 rounded-full text-muted-foreground"
    >
      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
      Inactivo
    </Badge>
  )
}

/** Organismo: tabla paginada de usuarios con filtros y acciones de administracion. */
export function AdminUserTable({ accessToken }: Props) {
  const {
    actionsError,
    actionsMessage,
    includeDeleted,
    items,
    pageSafe,
    pageWindow,
    patchFlags,
    patchStatus,
    restore,
    roleFilter,
    search,
    setActionsMessage,
    setIncludeDeleted,
    setPage,
    setRoleFilter,
    setSearch,
    softDelete,
    totalItems,
    totalPages,
    usersQ,
  } = useAdminUsersTable(accessToken)

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0

  return (
    <section className="space-y-4">
      <SectionIntro
        title="Directorio de Usuarios"
        description="Gestiona accesos, roles corporativos y gobernanza desde un único panel centralizado."
      />
      <Card className="overflow-hidden rounded-2xl border-border/80 shadow-md shadow-black/[0.04]">
        <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                Directorio de usuarios
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Busca por nombre, empresa o correo y combina filtros por rol y estado.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              <UsersRound className="size-4 text-primary" />
              <span>{totalItems} registros</span>
            </div>
          </div>
          <div className="grid grid-cols-1 items-end gap-3 rounded-xl border bg-background/80 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_13rem]">
            <div className="space-y-1">
              <Label htmlFor="admin-search" className="text-xs font-medium text-muted-foreground">
                Búsqueda en directorio
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="admin-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="h-10 w-full rounded-xl pl-9 pr-4 text-sm"
                  aria-label="Buscar por nombre, empresa, apellido o correo"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-role-filter" className="text-xs font-medium text-muted-foreground">
                Filtrar por rol
              </Label>
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v as 'all' | UserRole)
                  setPage(1)
                }}
              >
                <SelectTrigger id="admin-role-filter" className="h-10 w-full rounded-xl text-sm">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="worker">Trabajador</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-include-deleted" className="text-xs font-medium text-muted-foreground">
                Auditoría y bajas
              </Label>
              <div className="flex h-10 w-full items-center rounded-xl border bg-background px-3 transition-colors hover:bg-muted/20">
                <div className="flex items-center gap-2.5 text-sm leading-none">
                  <Checkbox
                    id="admin-include-deleted"
                    checked={includeDeleted}
                    onCheckedChange={(checked) => {
                      setIncludeDeleted(checked === true)
                      setPage(1)
                    }}
                  />
                  <Label
                    htmlFor="admin-include-deleted"
                    className="cursor-pointer text-xs font-medium text-foreground select-none"
                  >
                    Incluir archivados
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {actionsError ? (
            <Alert variant="destructive">
              <AlertTitle>No se pudo completar la acción</AlertTitle>
              <AlertDescription>{(actionsError as Error).message}</AlertDescription>
            </Alert>
          ) : actionsMessage ? (
            <Alert>
              <AlertTitle>Acción realizada</AlertTitle>
              <AlertDescription>{actionsMessage}</AlertDescription>
            </Alert>
          ) : null}

          {usersQ.isLoading ? (
            <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : usersQ.isFetching && items.length > 0 ? (
            <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
              <Skeleton className="h-12 w-full rounded-xl opacity-60" />
              <Skeleton className="h-12 w-full rounded-xl opacity-60" />
              <Skeleton className="h-12 w-full rounded-xl opacity-60" />
            </div>
          ) : usersQ.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Error al cargar usuarios</AlertTitle>
              <AlertDescription>Reintenta en unos segundos.</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <Alert>
              <AlertTitle>Sin resultados</AlertTitle>
              <AlertDescription>No hay usuarios para los filtros seleccionados.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div
                ref={parentRef}
                className="max-h-[min(58dvh,42rem)] overflow-auto rounded-xl border border-border/80 bg-card"
              >
                <Table className="min-w-[640px] table-fixed">
                  <caption className="sr-only">Listado de usuarios administrables.</caption>
                  <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                    <TableRow className="border-b-0">
                      <TableHead className="w-[190px]">Usuario</TableHead>
                      <TableHead className="w-[200px]">Correo</TableHead>
                      <TableHead className="w-[100px] text-center">Rol</TableHead>
                      <TableHead className="w-[100px] text-center">Estado</TableHead>
                      <TableHead className="w-[185px] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paddingTop > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} style={{ height: `${paddingTop}px` }} />
                      </TableRow>
                    )}
                    {virtualRows.map((virtualRow) => {
                      const row: AdminUserRow = items[virtualRow.index]
                      const displayName = userDisplayName(row)
                      const secondaryName = userSecondaryName(row)
                      return (
                        <TableRow
                          key={row.id}
                          data-index={virtualRow.index}
                          ref={virtualizer.measureElement}
                          className="align-middle transition-colors hover:bg-muted/35"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {userInitials(displayName)}
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-semibold leading-tight text-foreground">
                                  {displayName}
                                </span>
                                {secondaryName && (
                                  <span className="truncate text-xs text-muted-foreground">
                                    {secondaryName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground sm:text-sm">
                            <span className="block truncate" title={row.email}>{row.email}</span>
                          </TableCell>
                          <TableCell className="text-center">{roleBadge(row.role)}</TableCell>
                          <TableCell className="text-center">{statusBadge(row)}</TableCell>
                          <TableCell className="text-right align-middle">
                            <AdminUserActions
                              row={row}
                              patchStatus={patchStatus}
                              patchFlags={patchFlags}
                              softDelete={softDelete}
                              restore={restore}
                              clearActionMessage={() => setActionsMessage(null)}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {paddingBottom > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} style={{ height: `${paddingBottom}px` }} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3.5 py-2.5">
                <p className="text-xs font-medium text-muted-foreground whitespace-nowrap sm:text-sm">
                  Página {pageSafe} de {Math.max(totalPages, 1)} — {totalItems} registros
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-lg p-0"
                    aria-label="Pagina anterior"
                    disabled={pageSafe <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {pageWindow.map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      type="button"
                      variant={pageNumber === pageSafe ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 min-w-8 rounded-lg px-2 text-xs"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-lg p-0"
                    aria-label="Pagina siguiente"
                    disabled={totalPages === 0 || pageSafe >= totalPages}
                    onClick={() => setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
