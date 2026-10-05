import { memo } from 'react'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { cn } from '@/shared/lib/utils'
import { activityAge, presenceName, type PresenceUser } from '../model/presence'

export type PresenceUserRowProps = {
  user: PresenceUser
  now: number
  stale: boolean
  avatarUrl: string | null
}

function buildUserRowTitle(
  displayName: string,
  user: PresenceUser,
  isOnline: boolean,
  activityText: string,
  connectionText: string | null
): string {
  return [
    `${displayName} (${user.email})`,
    user.company_name ? `Empresa: ${user.company_name}` : null,
    isOnline ? 'En línea' : `Sin conexión · Actividad ${activityText}`,
    connectionText ? `Último acceso ${connectionText}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

type UserRowMetaProps = {
  displayName: string
  companyName?: string | null
  isOnline: boolean
  stale: boolean
  activityText: string
  lastActivityAt: string
  connectionText: string | null
  email: string
}

function UserNameAndBadge({ displayName, companyName }: { displayName: string; companyName?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-1.5">
      <p className="truncate text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {displayName}
      </p>
      {companyName ? (
        <span
          className={cn(
            'shrink-0 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.2 text-[10px]',
            'font-medium text-muted-foreground truncate max-w-[120px]'
          )}
        >
          {companyName}
        </span>
      ) : null}
    </div>
  )
}

function UserStatusAndActivity({
  isOnline,
  stale,
  activityText,
  lastActivityAt,
  connectionText,
  email,
}: {
  isOnline: boolean
  stale: boolean
  activityText: string
  lastActivityAt: string
  connectionText: string | null
  email: string
}) {
  return (
    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
      <span
        className={cn(
          'font-medium shrink-0',
          isOnline ? 'text-status-online text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
        )}
      >
        {stale ? 'Sin confirmar' : isOnline ? 'En línea' : 'Sin conexión'}
      </span>
      <span className="text-muted-foreground/40 shrink-0" aria-hidden="true">
        ·
      </span>
      <time dateTime={lastActivityAt} className="truncate">
        Actividad {activityText}
      </time>
      <span className="sr-only">
        {` · ${email}`}
        {connectionText ? ` · Último acceso ${connectionText}` : ''}
      </span>
    </p>
  )
}

function UserRowMeta(props: UserRowMetaProps) {
  return (
    <div className="min-w-0 flex-1">
      <UserNameAndBadge displayName={props.displayName} companyName={props.companyName} />
      <UserStatusAndActivity
        isOnline={props.isOnline}
        stale={props.stale}
        activityText={props.activityText}
        lastActivityAt={props.lastActivityAt}
        connectionText={props.connectionText}
        email={props.email}
      />
    </div>
  )
}

export const PresenceUserRow = memo(function PresenceUserRow(props: PresenceUserRowProps) {
  const { user, now, stale, avatarUrl } = props
  const displayName = presenceName(user)
  const isOnline = user.is_online && !stale
  const activityText = activityAge(user.last_activity_at, now)
  const connectionText = user.last_connection_at ? activityAge(user.last_connection_at, now) : null
  const rowTitle = buildUserRowTitle(displayName, user, isOnline, activityText, connectionText)

  return (
    <li
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors',
        'hover:bg-muted/60 focus-within:bg-muted/60'
      )}
      title={rowTitle}
    >
      <UserAvatar
        src={avatarUrl}
        name={displayName}
        userId={user.subject}
        size="md"
        presenceStatus={isOnline ? 'online' : 'offline'}
        presenceLabel={isOnline ? 'En línea' : `Sin conexión · Actividad ${activityText}`}
        ringClass="ring-card"
        className="size-8 sm:size-9 shrink-0 text-xs"
      />
      <UserRowMeta
        displayName={displayName}
        companyName={user.company_name}
        isOnline={isOnline}
        stale={stale}
        activityText={activityText}
        lastActivityAt={user.last_activity_at}
        connectionText={connectionText}
        email={user.email}
      />
    </li>
  )
})
