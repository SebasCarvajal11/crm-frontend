import { memo } from 'react'
import { cn } from '@/shared/lib/utils'

interface NotificationCounterBadgeProps {
  count?: number
  maxCount?: number
  variant?: 'counter' | 'dot'
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}

export const NotificationCounterBadge = memo(function NotificationCounterBadge({
  count = 0,
  maxCount = 9,
  variant = 'counter',
  size = 'sm',
  className,
  ariaLabel,
}: NotificationCounterBadgeProps) {
  if (count <= 0 && variant !== 'dot') return null

  if (variant === 'dot') {
    return (
      <span
        role="status"
        aria-label={ariaLabel ?? `${count} novedades`}
        className={cn(
          'relative flex size-2.5 rounded-full bg-gradient-to-tr from-[#86070c] to-rose-500 ring-2 ring-background shadow-xs',
          className
        )}
      >
        <span className="absolute inset-0 size-full animate-ping rounded-full bg-rose-400 opacity-60" />
      </span>
    )
  }

  const displayValue = count > maxCount ? `${maxCount}+` : String(count)
  const isSm = size === 'sm'

  return (
    <span
      role="status"
      aria-label={ariaLabel ?? `${count} novedades pendientes`}
      className={cn(
        'inline-flex items-center justify-center font-bold text-white tracking-tight',
        'bg-gradient-to-r from-[#86070c] via-[#9e0b12] to-[#b31217]',
        'ring-1.5 ring-background/90 shadow-[0_2px_8px_rgba(134,7,12,0.45)]',
        'transition-all duration-200 hover:scale-110 active:scale-95 cursor-default select-none',
        isSm
          ? 'h-4.5 min-w-4.5 px-1 text-[10px] rounded-full'
          : 'h-5 min-w-5 px-1.5 text-[11px] rounded-full',
        className
      )}
    >
      <span className="font-mono tabular-nums leading-none">{displayValue}</span>
    </span>
  )
})
