import { CheckCheck, CheckCircle2, Clock, EyeOff, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { DeliveryStatus } from '../api/interactions-api'
import { deliveryMeta } from './delivery.utils'

const ICONS = {
  QUEUED: CheckCircle2,
  FAILED: XCircle,
  SIMULATED: EyeOff,
  SKIPPED_LIMIT: Clock,
  SENT_MANUAL: CheckCheck,
} as const

const TONES = {
  QUEUED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  FAILED: 'border-destructive/40 bg-destructive/10 text-destructive',
  SIMULATED: 'border-border bg-muted text-muted-foreground',
  SKIPPED_LIMIT: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  SENT_MANUAL: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
} as const

interface DeliveryBadgeProps {
  status?: DeliveryStatus | null
  error?: string | null
}

/** Insignia del estado de entrega de una interacción; no muestra nada si no hay estado. */
export function DeliveryBadge({ status, error }: DeliveryBadgeProps) {
  const meta = deliveryMeta(status, error)
  if (!meta || !status) return null
  const Icon = ICONS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        TONES[status]
      )}
      title={meta.tooltip ?? undefined}
      data-delivery={status}
    >
      <Icon className="size-3" aria-hidden="true" />
      {meta.label}
      {meta.tooltip && <span className="sr-only">. {meta.tooltip}</span>}
    </span>
  )
}
