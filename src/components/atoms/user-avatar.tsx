import { memo, useState } from 'react'
import {
  extractAvatarIdFromSrc,
  getAvatarImageUrl,
  resolveAvatarSrcSet,
  resolveDeterministicAvatar,
} from '@/shared/lib/avatar-catalog'
import { getAvatarSpriteStyle } from '@/shared/lib/avatar-spritesheet'
import { cn } from '@/shared/lib/utils'
import type { UserRole } from '@/shared/types/identity'
import {
  PresenceIndicator,
  type PresenceIndicatorProps,
  type UserPresenceStatus,
} from './presence-indicator'
import { getRoleHaloClasses, ROLE_LABELS } from './user-avatar-halo'

export type { UserPresenceStatus, PresenceIndicatorProps, UserRole }
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type UserAvatarProps = {
  src?: string | null
  avatarUrl?: string | null
  avatarId?: number | null
  color?: string | null
  name?: string | null
  userId?: string | null
  size?: AvatarSize
  role?: UserRole | null
  showRoleHalo?: boolean
  haloAnimation?: boolean
  presenceStatus?: UserPresenceStatus
  presenceLabel?: string
  className?: string
  alt?: string
  ringClass?: string
  preferSprite?: boolean
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

const SIZES_MEDIA_QUERIES: Record<AvatarSize, string> = {
  xs: '24px',
  sm: '28px',
  md: '36px',
  lg: '40px',
  xl: '56px',
  '2xl': '(min-width: 640px) 128px, 112px',
}

function extractColorFromSrc(src?: string | null): string | null {
  if (!src) return null
  const match = src.match(/[?&]c=([0-9a-fA-F]{3,8})/)
  return match ? `#${match[1]}` : null
}

type AvatarMediaProps = {
  src: string
  srcSet?: string
  sizes?: string
  effectiveColor: string
  altText: string
  avatarId?: number | null
  useSprite?: boolean
  onError: () => void
}

function AvatarMedia({
  src,
  srcSet,
  sizes,
  effectiveColor,
  altText,
  avatarId,
  useSprite = false,
  onError,
}: AvatarMediaProps) {
  return (
    <div
      className={cn(
        'flex size-full items-center justify-center',
        'overflow-hidden rounded-full border border-border/40 shadow-xs'
      )}
      style={{ backgroundColor: effectiveColor }}
    >
      {useSprite && typeof avatarId === 'number' ? (
        <div
          role="img"
          aria-label={altText}
          data-testid="user-avatar-sprite"
          data-avatar-id={avatarId}
          className="size-full rounded-full"
          style={getAvatarSpriteStyle(avatarId)}
        />
      ) : (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={altText}
          className="size-full object-cover rounded-full"
          onError={onError}
          loading="lazy"
        />
      )}
    </div>
  )
}

function useResolvedAvatar(props: UserAvatarProps) {
  const {
    src,
    avatarUrl,
    avatarId,
    color,
    name,
    userId,
    preferSprite = true,
  } = props
  const deterministic = resolveDeterministicAvatar(userId ?? name)
  const trimmedSrc = src?.trim()
  const trimmedAvatarUrl = avatarUrl?.trim()
  const effectiveSrc = (trimmedSrc || trimmedAvatarUrl) || undefined

  const srcAvatarId = extractAvatarIdFromSrc(effectiveSrc)
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
    extractColorFromSrc(currentSrc) ||
    deterministic.color

  const isCustomSrc = Boolean(
    effectiveSrc && !effectiveSrc.includes('/avatars/avatar-')
  )
  const computedAvatarId = isCustomSrc
    ? null
    : (srcAvatarId ?? (isValidAvatarId ? avatarId : deterministic.avatarId))
  const computedSrcSet = resolveAvatarSrcSet(currentSrc, computedAvatarId)
  const useSprite = preferSprite && !isCustomSrc && typeof computedAvatarId === 'number'

  return {
    currentSrc,
    computedSrcSet,
    effectiveColor,
    computedAvatarId,
    useSprite,
    handleImageError,
  }
}

export const UserAvatar = memo(function UserAvatar(props: UserAvatarProps) {
  const {
    name,
    size = 'md',
    role,
    showRoleHalo = true,
    haloAnimation = true,
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
    computedAvatarId,
    useSprite,
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

  const haloClass = showRoleHalo
    ? getRoleHaloClasses(role, size, haloAnimation)
    : undefined
  const roleLabel = role ? ROLE_LABELS[role] : undefined
  const titleText = name
    ? roleLabel
      ? `${name} (${roleLabel})`
      : name
    : roleLabel

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center rounded-full',
        isClickable &&
          'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-transform',
        cfg.container,
        haloClass,
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      title={titleText ?? undefined}
      data-testid="user-avatar"
      data-user-role={role ?? undefined}
    >
      <AvatarMedia
        src={currentSrc}
        srcSet={computedSrcSet}
        sizes={SIZES_MEDIA_QUERIES[size]}
        effectiveColor={effectiveColor}
        altText={altText}
        avatarId={computedAvatarId}
        useSprite={useSprite}
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
