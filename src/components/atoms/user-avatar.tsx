import { memo, useState } from 'react'
import {
  getAvatarImageUrl,
  resolveAvatarSrcSet,
  resolveDeterministicAvatar,
} from '@/shared/lib/avatar-catalog'
import { cn } from '@/shared/lib/utils'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type UserPresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'recent'

export type UserAvatarProps = {
  src?: string | null
  avatarUrl?: string | null
  avatarId?: number | null
  color?: string | null
  name?: string | null
  userId?: string | null
  size?: AvatarSize
  presenceStatus?: UserPresenceStatus
  presenceLabel?: string
  className?: string
  alt?: string
  ringClass?: string
  onClick?: () => void
  onOpenProfile?: () => void
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; dot: string }> = {
  xs: { container: 'size-6', dot: 'size-1.5' },
  sm: { container: 'size-7', dot: 'size-2' },
  md: { container: 'size-9', dot: 'size-2.5' },
  lg: { container: 'size-10', dot: 'size-2.5' },
  xl: { container: 'size-14', dot: 'size-3.5' },
  '2xl': { container: 'size-28 sm:size-32', dot: 'size-5' },
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

function extractColorFromSrc(src?: string | null): string | null {
  if (!src) return null
  const match = src.match(/[?&]c=([0-9a-fA-F]{3,8})/)
  if (match) return `#${match[1]}`
  return null
}

const SIZES_MEDIA_QUERIES: Record<AvatarSize, string> = {
  xs: '24px',
  sm: '28px',
  md: '36px',
  lg: '40px',
  xl: '56px',
  '2xl': '(min-width: 640px) 128px, 112px',
}

type AvatarMediaProps = {
  src: string
  srcSet?: string
  sizes?: string
  effectiveColor: string
  altText: string
  onError: () => void
}

function AvatarMedia({
  src,
  srcSet,
  sizes,
  effectiveColor,
  altText,
  onError,
}: AvatarMediaProps) {
  return (
    <div
      className="flex size-full items-center justify-center overflow-hidden rounded-full border border-border/40 shadow-xs"
      style={{ backgroundColor: effectiveColor }}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={altText}
        className="size-full object-cover rounded-full"
        onError={onError}
        loading="lazy"
      />
    </div>
  )
}

function useResolvedAvatar(props: UserAvatarProps) {
  const { src, avatarUrl, avatarId, color, name, userId } = props
  const deterministic = resolveDeterministicAvatar(userId ?? name)
  const trimmedSrc = src?.trim()
  const trimmedAvatarUrl = avatarUrl?.trim()
  const effectiveSrc = (trimmedSrc || trimmedAvatarUrl) || undefined

  const isValidAvatarId =
    typeof avatarId === 'number' &&
    Number.isInteger(avatarId) &&
    avatarId >= 0 &&
    avatarId < 84

  const initialResolvedSrc =
    effectiveSrc ??
    (isValidAvatarId ? getAvatarImageUrl(avatarId) : deterministic.url)

  const [currentSrc, setCurrentSrc] = useState(initialResolvedSrc)
  const [prevInitialSrc, setPrevInitialSrc] = useState(initialResolvedSrc)

  if (prevInitialSrc !== initialResolvedSrc) {
    setPrevInitialSrc(initialResolvedSrc)
    setCurrentSrc(initialResolvedSrc)
  }

  const handleImageError = () => {
    if (currentSrc !== deterministic.url) {
      setCurrentSrc(deterministic.url)
    }
  }

  const effectiveColor =
    (color && color.trim()) ||
    extractColorFromSrc(effectiveSrc) ||
    deterministic.color

  const isCustomSrc = Boolean(
    effectiveSrc && !effectiveSrc.includes('/avatars/avatar-')
  )
  const computedAvatarId = isCustomSrc
    ? null
    : isValidAvatarId
      ? avatarId
      : deterministic.avatarId
  const computedSrcSet = resolveAvatarSrcSet(currentSrc, computedAvatarId)

  return {
    currentSrc,
    computedSrcSet,
    effectiveColor,
    handleImageError,
  }
}

export const UserAvatar = memo(function UserAvatar(props: UserAvatarProps) {
  const {
    name,
    size = 'md',
    presenceStatus,
    presenceLabel,
    className,
    alt,
    ringClass,
    onClick,
    onOpenProfile,
  } = props

  const {
    currentSrc,
    computedSrcSet,
    effectiveColor,
    handleImageError,
  } = useResolvedAvatar(props)

  const cfg = SIZE_CLASSES[size]
  const altText = alt ?? (name ? `Avatar oficial de ${name}` : 'Avatar oficial')
  const handleClick = onClick ?? onOpenProfile
  const isClickable = Boolean(handleClick)

  const handleKeyDown = isClickable
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick?.()
        }
      }
    : undefined

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center',
        isClickable &&
          'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-transform',
        cfg.container,
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      title={name ?? undefined}
      data-testid="user-avatar"
    >
      <AvatarMedia
        src={currentSrc}
        srcSet={computedSrcSet}
        sizes={SIZES_MEDIA_QUERIES[size]}
        effectiveColor={effectiveColor}
        altText={altText}
        onError={handleImageError}
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
