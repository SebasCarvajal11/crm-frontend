import React from 'react'
import { cn } from '@/shared/lib/utils'

export type UserPresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'recent'

export type PresenceIndicatorProps = {
  status: UserPresenceStatus
  sizeClass: string
  customLabel?: string
  ringClass?: string
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

export function PresenceIndicator({
  status,
  sizeClass,
  customLabel,
  ringClass,
}: PresenceIndicatorProps) {
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
