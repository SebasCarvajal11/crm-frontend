import { Briefcase, Building2, Crown, Mail, ShieldAlert, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { AdminUserActions } from './user-actions'
import { userDisplayName, userSecondaryName } from '@/features/admin/hooks'
import type { AdminUserRow, UserRole } from '@/features/admin/model'

type MutationHandle<T> = {
  mutate: (arg: T) => void
  isPending: boolean
}

type Props = {
  row: AdminUserRow
  index: number
  avatarUrl?: string | null
  patchStatus: MutationHandle<{ subject: string; is_active: boolean }>
  patchFlags: MutationHandle<{ subject: string; force_password_change: boolean }>
  softDelete: MutationHandle<string>
  restore: MutationHandle<string>
  clearActionMessage: () => void
}

function roleBadge(role: UserRole) {
  if (role === 'admin') {
    return (
      <Badge
        className={[
          'inline-flex items-center gap-1 rounded-full border-primary/20',
          'bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary',
        ].join(' ')}
      >
        <Crown className="size-3" /> Admin
      </Badge>
    )
  }
  if (role === 'worker') {
    return (
      <Badge
        className={[
          'inline-flex items-center gap-1 rounded-full border-cyan-500/20',
          'bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400',
        ].join(' ')}
      >
        <Briefcase className="size-3" /> Trabajador
      </Badge>
    )
  }
  return (
    <Badge
      className={[
        'inline-flex items-center gap-1 rounded-full border-emerald-500/20',
        'bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400',
      ].join(' ')}
    >
      <User className="size-3" /> Cliente
    </Badge>
  )
}

function statusBadge(row: AdminUserRow) {
  if (row.deleted_at) {
    return (
      <Badge variant="destructive" className="inline-flex items-center gap-1.5 rounded-full text-[11px]">
        <span className="size-1.5 rounded-full bg-red-200" /> Archivado
      </Badge>
    )
  }
  if (row.is_active) {
    return (
      <Badge
        className={[
          'inline-flex items-center gap-1.5 rounded-full border-emerald-500/20',
          'bg-emerald-500/10 text-[11px] font-medium text-emerald-700 dark:text-emerald-400',
        ].join(' ')}
      >
        <span className="size-1.5 rounded-full bg-emerald-500" /> Activo
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="inline-flex items-center gap-1.5 rounded-full text-[11px] text-muted-foreground"
    >
      <span className="size-1.5 rounded-full bg-muted-foreground/40" /> Inactivo
    </Badge>
  )
}

/** Componente molecular: tarjeta interactiva individual para visualización de usuario. */
export function AdminUserCard({
  row,
  index,
  avatarUrl,
  patchStatus,
  patchFlags,
  softDelete,
  restore,
  clearActionMessage,
}: Props) {
  const displayName = userDisplayName(row)
  const secondaryName = userSecondaryName(row)

  return (
    <Card
      data-testid="admin-user-card"
      className={[
        'relative flex h-full flex-col justify-between rounded-2xl border',
        'border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-200',
        'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
      ].join(' ')}
    >
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={avatarUrl}
              name={displayName}
              userId={row.id}
              size="lg"
              className="size-11 shrink-0 text-sm"
            />
            <div className="min-w-0 flex-1">
              <h4
                className="truncate text-sm font-bold tracking-tight text-foreground"
                title={displayName}
              >
                {displayName}
              </h4>
              {secondaryName ? (
                <p
                  className="truncate text-xs font-medium text-muted-foreground"
                  title={secondaryName}
                >
                  {secondaryName}
                </p>
              ) : null}
            </div>
          </div>
          <div className="shrink-0">{statusBadge(row)}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {roleBadge(row.role)}
          {row.company_name && row.company_name !== secondaryName ? (
            <span className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">{row.company_name}</span>
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/20 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="size-3.5 shrink-0 text-primary/80" />
            <span className="truncate font-mono text-[11px] text-foreground/90" title={row.email}>
              {row.email}
            </span>
          </div>

          {row.force_password_change ? (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-3.5 shrink-0" />
              <span>Cambio de contraseña requerido</span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        data-tour={index === 0 ? 'admin-user-actions' : undefined}
        className="mt-4 border-t border-border/50 pt-3"
      >
        <AdminUserActions
          row={row}
          patchStatus={patchStatus}
          patchFlags={patchFlags}
          softDelete={softDelete}
          restore={restore}
          clearActionMessage={clearActionMessage}
        />
      </div>
    </Card>
  )
}
