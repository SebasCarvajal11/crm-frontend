import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

/** Shared coordinates keep dashboard actions separated at every application zoom. */
export function FloatingActionContainer({ actionIndex, className, style, ...props }: ComponentProps<'aside'> & { actionIndex: 0 | 1 | 2 }) {
  return (
    <aside
      {...props}
      className={cn(
        'pointer-events-none fixed right-3 sm:right-5 z-40 flex items-center select-none [&>*]:pointer-events-auto',
        className
      )}
      style={{
        zoom: 'calc(1 / var(--app-zoom, 1))',
        bottom: `calc(env(safe-area-inset-bottom, 0px) + 0.875rem + ${actionIndex} * 3.25rem)`,
        ...style,
      }}
    />
  )
}
