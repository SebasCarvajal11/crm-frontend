import { memo, useState } from 'react'
import { UserRound } from 'lucide-react'
import { getAvatarColor } from '@/shared/lib/avatar-color'
import { extractUserInitials } from '@/shared/lib/avatar-utils'
import { cn } from '@/shared/lib/utils'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type UserAvatarProps = {
  src?: string | null
  name?: string | null
  userId?: string | null
  size?: AvatarSize
  presenceStatus?: 'online' | 'offline'
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

export const UserAvatar = memo(function UserAvatar({
  src,
  name,
  userId,
  size = 'md',
  presenceStatus,
  className,
  alt,
  ringClass,
}: UserAvatarProps) {
  const [loadError, setLoadError] = useState(false)
  const cfg = SIZE_CLASSES[size]
  const initials = extractUserInitials(name)
  const bgColor = getAvatarColor(userId)
  const hasValidImage = Boolean(src && !loadError)
  const altText = alt ?? (name ? `Foto de perfil de ${name}` : 'Foto de perfil')

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center',
        cfg.container,
        className
      )}
      title={name ?? undefined}
      data-testid="user-avatar"
    >
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
            onError={() => setLoadError(true)}
            loading="lazy"
          />
        ) : initials ? (
          <span className={cn('tracking-tight uppercase', cfg.text)} aria-hidden="true">
            {initials}
          </span>
        ) : (
          <UserRound className="size-1/2 opacity-90" aria-hidden="true" />
        )}
      </div>

      {presenceStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 z-10 shrink-0 rounded-full ring-2 ring-background',
            cfg.dot,
            presenceStatus === 'online' ? 'bg-emerald-500' : 'bg-muted-foreground/40',
            ringClass
          )}
          aria-label={presenceStatus === 'online' ? 'En línea' : 'Desconectado'}
        />
      )}
    </div>
  )
})
