import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { AdminUserActions } from './user-actions'
import { userDisplayName, userSecondaryName } from '@/features/admin/hooks'
import type { AdminUserRow, UserRole } from '@/features/admin/model'

type Props = {
  row: AdminUserRow
  virtualIndex: number
  measureElement?: (el: HTMLElement | null) => void
  patchStatus: { mutate: (arg: { subject: string; is_active: boolean }) => void; isPending: boolean }
  patchFlags: { mutate: (arg: { subject: string; force_password_change: boolean }) => void; isPending: boolean }
  softDelete: { mutate: (arg: string) => void; isPending: boolean }
  restore: { mutate: (arg: string) => void; isPending: boolean }
  clearActionMessage: () => void
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
      <Badge className="inline-flex min-w-[84px] justify-center rounded-full border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
        Admin
      </Badge>
    )
  }
  if (role === 'worker') {
    return (
      <Badge className="inline-flex min-w-[84px] justify-center rounded-full border-cyan-500/20 bg-cyan-500/10 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
        Trabajador
      </Badge>
    )
  }
  return (
    <Badge className="inline-flex min-w-[84px] justify-center rounded-full border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
      Cliente
    </Badge>
  )
}

function statusBadge(row: AdminUserRow) {
  if (row.deleted_at) {
    return (
      <Badge
        variant="destructive"
        className="inline-flex min-w-[84px] items-center justify-center gap-1.5 rounded-full text-xs font-medium"
      >
        <span className="size-1.5 rounded-full bg-red-200" />
        Archivado
      </Badge>
    )
  }
  if (row.is_active) {
    return (
      <Badge className="inline-flex min-w-[84px] items-center justify-center gap-1.5 rounded-full border-emerald-500/20 bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Activo
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="inline-flex min-w-[84px] items-center justify-center gap-1.5 rounded-full text-xs font-medium text-muted-foreground"
    >
      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
      Inactivo
    </Badge>
  )
}

function roleAvatarColor(role: UserRole): string {
  if (role === 'admin') return 'bg-primary/10 text-primary border-primary/20'
  if (role === 'worker') return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20'
  return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
}

/** Componente molecular: fila individual estandarizada para la tabla de usuarios. */
export function UserTableRow({
  row,
  virtualIndex,
  measureElement,
  patchStatus,
  patchFlags,
  softDelete,
  restore,
  clearActionMessage,
}: Props) {
  const displayName = userDisplayName(row)
  const secondaryName = userSecondaryName(row)

  return (
    <TableRow
      key={row.id}
      data-index={virtualIndex}
      ref={measureElement}
      className="group align-middle interactive-row"
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold tracking-tight shadow-2xs ${roleAvatarColor(row.role)}`}
          >
            {userInitials(displayName)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
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
      <TableCell className="py-3 font-mono text-xs text-muted-foreground sm:text-sm">
        <span className="block truncate" title={row.email}>{row.email}</span>
      </TableCell>
      <TableCell className="py-3 text-center">{roleBadge(row.role)}</TableCell>
      <TableCell className="py-3 text-center">{statusBadge(row)}</TableCell>
      <TableCell className="py-3 text-right align-middle">
        <AdminUserActions
          row={row}
          patchStatus={patchStatus}
          patchFlags={patchFlags}
          softDelete={softDelete}
          restore={restore}
          clearActionMessage={clearActionMessage}
        />
      </TableCell>
    </TableRow>
  )
}
