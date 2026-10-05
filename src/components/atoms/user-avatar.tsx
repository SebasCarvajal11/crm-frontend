import { memo, useState } from 'react'
import { UserRound } from 'lucide-react'
import { getAvatarColor } from '@/shared/lib/avatar-color'
import { extractUserInitials } from '@/shared/lib/avatar-utils'
import { cn } from '@/shared/lib/utils'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type UserPresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'recent'

export type UserAvatarProps = {
  src?: string | null
  name?: string | null
  userId?: string | null
  size?: AvatarSize
  presenceStatus?: UserPresenceStatus
  presenceLabel?: string
  className?: string
  alt?: string
  ringClass?: string
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  xs: { container: 'size-6', text: 'text-[10px]', dot: 'size-1.5' },
  sm: { container: 'size-7', text: 'text-[11px]', dot: 'size-2' },
  md: { container: 'size-9', text: 'text-xs', dot: 'size-2.5' },
  lg: { container: 'size-10', text: 'text-sm', dot: 'size-2.5' },
  xl: { container: 'size-14', text: 'text-base', dot: 'size-3.5' },
  '2xl': { container: 'size-28 sm:size-32', text: 'text-2xl sm:text-3xl', dot: 'size-5' },
}

const PRESENCE_CONFIG: Record<
  UserPresenceStatus,
  { label: string; color: string; content?: React.ReactNode }
> = {
  online: {
    label: 'En línea',
    color: 'bg-status-online',
  },
  away: {
    label: 'Ausente',
    color: 'bg-status-away',
    content: (
      <svg
        viewBox="0 0 10 10"
        className="size-full p-[0.5px] text-background"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M7.5 5A3.5 3.5 0 0 1 2 2.5a3.5 3.5 0 1 0 5.5 2.5z" />
      </svg>
    ),
  },
  busy: {
    label: 'Ocupado',
    color: 'bg-status-busy',
    content: (
      <span
        className="block h-[1.5px] w-[60%] bg-white rounded-full mx-auto"
        aria-hidden="true"
      />
    ),
  },
  recent: {
    label: 'Reciente',
    color: 'bg-status-recent ring-1 ring-status-recent/50',
    content: (
      <span
        className="block size-[35%] bg-background rounded-full mx-auto"
        aria-hidden="true"
      />
    ),
  },
  offline: {
    label: 'Desconectado',
    color: 'bg-status-offline/50',
  },
}

function PresenceIndicator({
  status,
  sizeClass,
  customLabel,
  ringClass,
}: {
  status: UserPresenceStatus
  sizeClass: string
  customLabel?: string
  ringClass?: string
}) {
  const config = PRESENCE_CONFIG[status]
  const label = customLabel ?? config.label

  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'absolute bottom-0 right-0 z-10 shrink-0 rounded-full ring-2 ring-background',
        'flex items-center justify-center overflow-hidden',
        sizeClass,
        config.color,
        ringClass
      )}
    >
      {config.content}
    </span>
  )
}

type AvatarMediaProps = {
  src?: string | null
  initials: string
  hasValidImage: boolean
  bgColor: string
  altText: string
  textClass: string
  onError: () => void
}

function AvatarMedia({ src, initials, hasValidImage, bgColor, altText, textClass, onError }: AvatarMediaProps) {
  return (
    <div
      className={cn(
        'flex size-full items-center justify-center overflow-hidden rounded-full font-semibold',
        hasValidImage ? 'border border-border/60 bg-muted/20' : `${bgColor} text-white shadow-2xs`
      )}
    >
      {hasValidImage ? (
        <img
          src={src!}
          alt={altText}
          className="size-full object-cover rounded-full"
          onError={onError}
          loading="lazy"
        />
      ) : initials ? (
        <span className={cn('tracking-tight uppercase', textClass)} aria-hidden="true">
          {initials}
        </span>
      ) : (
        <UserRound className="size-1/2 opacity-90" aria-hidden="true" />
      )}
    </div>
  )
}

export const UserAvatar = memo(function UserAvatar(props: UserAvatarProps) {
  const { src, name, userId, size = 'md', presenceStatus, presenceLabel, className, alt, ringClass } = props
  const [loadError, setLoadError] = useState(false)
  const cfg = SIZE_CLASSES[size]
  const initials = extractUserInitials(name)
  const bgColor = getAvatarColor(userId)
  const hasValidImage = Boolean(src && !loadError)
  const altText = alt ?? (name ? `Foto de perfil de ${name}` : 'Foto de perfil')

  return (
    <div
      className={cn('relative inline-flex shrink-0 select-none items-center justify-center', cfg.container, className)}
      title={name ?? undefined}
      data-testid="user-avatar"
    >
      <AvatarMedia
        src={src}
        initials={initials}
        hasValidImage={hasValidImage}
        bgColor={bgColor}
        altText={altText}
        textClass={cfg.text}
        onError={() => setLoadError(true)}
      />

      {presenceStatus && (
        <PresenceIndicator
          status={presenceStatus}
          sizeClass={cfg.dot}
          customLabel={presenceLabel}
          ringClass={ringClass}
        />
      )}
    </div>
  )
})
