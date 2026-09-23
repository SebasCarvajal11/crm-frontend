import { Search, UsersRound } from 'lucide-react'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { UserRole } from '@/features/admin/model'

type Props = {
  totalItems: number
  search: string
  setSearch: (v: string) => void
  roleFilter: 'all' | UserRole
  setRoleFilter: (v: 'all' | UserRole) => void
  includeDeleted: boolean
  setIncludeDeleted: (v: boolean) => void
  pageSize: number
  setPageSize: (v: number) => void
  setPage: (v: number) => void
}

/** Componente molecular: barra de control y filtros del directorio de usuarios. */
export function UserTableToolbar({
  totalItems,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  includeDeleted,
  setIncludeDeleted,
  pageSize,
  setPageSize,
  setPage,
}: Props) {
  return (
    <CardHeader
      data-tour="admin-user-toolbar"
      className="flex flex-col gap-4 border-b bg-muted/15 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Directorio de Usuarios
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Visualiza y administra accesos, roles y el ciclo de vida de los usuarios.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
            <UsersRound className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">{totalItems}</span>
            <span>usuarios</span>
          </div>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[105px] rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 por pág.</SelectItem>
              <SelectItem value="12">12 por pág.</SelectItem>
              <SelectItem value="20">20 por pág.</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-border/70 bg-background/90 p-3.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_13rem]">
        <div className="space-y-1.5">
          <Label htmlFor="admin-search" className="text-xs font-semibold text-muted-foreground">
            Búsqueda rápida
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="h-9.5 w-full rounded-xl pl-9 pr-3 text-xs sm:text-sm"
              aria-label="Buscar por nombre, empresa, apellido o correo"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admin-role-filter" className="text-xs font-semibold text-muted-foreground">
            Filtrar por rol
          </Label>
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v as 'all' | UserRole)
              setPage(1)
            }}
          >
            <SelectTrigger id="admin-role-filter" className="h-9.5 w-full rounded-xl text-xs sm:text-sm">
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

        <div className="space-y-1.5">
          <Label htmlFor="admin-include-deleted" className="text-xs font-semibold text-muted-foreground">
            Estado de retención
          </Label>
          <div className="flex h-9.5 w-full items-center rounded-xl border border-input bg-background px-3 transition-colors hover:bg-muted/20">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground leading-none">
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
  )
}
