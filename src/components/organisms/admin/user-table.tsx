import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserTableToolbar } from './user-table-toolbar'
import { UserTableRow } from './user-table-row'
import { UserTablePagination } from './user-table-pagination'
import { useAdminUsersTable } from '@/features/admin/hooks'
import type { AdminUserRow } from '@/features/admin/model'

type Props = {
  accessToken: string
}

/** Organismo: tabla moderna de directorio de usuarios con virtualización, filtros y paginación. */
export function AdminUserTable({ accessToken }: Props) {
  const {
    pageSize,
    setPageSize,
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
    estimateSize: () => 64,
    overscan: 4,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
        <UserTableToolbar
          totalItems={totalItems}
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          includeDeleted={includeDeleted}
          setIncludeDeleted={setIncludeDeleted}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setPage={setPage}
        />

        <CardContent className="space-y-4 p-4 sm:p-6">
          {actionsError ? (
            <Alert variant="destructive" className="rounded-xl">
              <AlertTitle>No se pudo completar la acción</AlertTitle>
              <AlertDescription>{(actionsError as Error).message}</AlertDescription>
            </Alert>
          ) : actionsMessage ? (
            <Alert className="rounded-xl border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300">
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
            </div>
          ) : usersQ.isError ? (
            <Alert variant="destructive" className="rounded-xl">
              <AlertTitle>Error al cargar usuarios</AlertTitle>
              <AlertDescription>Reintenta en unos segundos.</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <Alert className="rounded-xl">
              <AlertTitle>Sin resultados</AlertTitle>
              <AlertDescription>No hay usuarios para los filtros seleccionados.</AlertDescription>
            </Alert>
          ) : (
            <div
              ref={parentRef}
              data-tour="admin-user-table"
              className="max-h-[min(54dvh,38rem)] overflow-auto rounded-xl border border-border/70 bg-card shadow-2xs"
            >
              <Table className="min-w-[780px] table-fixed">
                <caption className="sr-only">Listado de usuarios administrables.</caption>
                <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
                  <TableRow className="border-b-0 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <TableHead className="w-[190px]">Usuario</TableHead>
                    <TableHead className="w-[200px]">Correo</TableHead>
                    <TableHead className="w-[100px] text-center">Rol</TableHead>
                    <TableHead className="w-[100px] min-w-[100px] text-center">Estado</TableHead>
                    <TableHead className="w-[190px] min-w-[190px] text-right">Acciones</TableHead>
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
                    return (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        virtualIndex={virtualRow.index}
                        measureElement={virtualizer.measureElement}
                        patchStatus={patchStatus}
                        patchFlags={patchFlags}
                        softDelete={softDelete}
                        restore={restore}
                        clearActionMessage={() => setActionsMessage(null)}
                      />
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
          )}
        </CardContent>

        <UserTablePagination
          pageSafe={pageSafe}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          pageWindow={pageWindow}
          setPage={setPage}
        />
      </Card>
    </section>
  )
}
