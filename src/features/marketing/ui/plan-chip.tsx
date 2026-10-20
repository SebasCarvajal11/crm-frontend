import { cn } from '@/shared/lib/utils'
import type { MarketingPlan } from '../api/plans-api'
import { planChipStyle } from './plans.utils'

interface PlanChipProps {
  /** Nombre del plan tal como lo tiene el cliente. */
  name?: string | null
  /** Plan del catálogo; si no existe, el chip se muestra en gris. */
  plan?: MarketingPlan | null
  className?: string
}

/**
 * Chip del plan de un cliente con el color del catálogo. Un plan inactivo (o
 * que ya no está en el catálogo) se muestra en gris con "(inactivo)".
 */
export function PlanChip({ name, plan, className }: PlanChipProps) {
  const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold'

  if (!name) {
    return (
      <span className={cn(base, 'border-border bg-muted font-normal text-muted-foreground', className)}>
        Sin clasificar
      </span>
    )
  }

  if (!plan || !plan.active) {
    return (
      <span
        className={cn(base, 'border-border bg-muted text-muted-foreground', className)}
        title="Este plan está inactivo: el cliente lo conserva, pero no se puede asignar a otros."
        data-inactive="true"
      >
        <span className="size-2 rounded-full bg-muted-foreground/50" aria-hidden="true" />
        {plan?.name ?? name} (inactivo)
      </span>
    )
  }

  return (
    <span className={cn(base, 'text-foreground', className)} style={planChipStyle(plan.color)}>
      <span className="size-2 rounded-full" style={{ backgroundColor: plan.color }} aria-hidden="true" />
      {plan.name}
    </span>
  )
}
