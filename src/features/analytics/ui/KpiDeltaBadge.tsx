import { cn } from '@/shared/lib/utils'
import { deltaTone, formatDelta, periodLabel } from './analytics-labels'

const TONE_STYLES = {
  positive: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  negative: 'bg-red-500/10 text-red-700 dark:text-red-400',
  neutral: 'bg-muted text-muted-foreground',
  none: 'bg-muted/60 text-muted-foreground',
} as const

interface KpiDeltaBadgeProps {
  deltaPercent: number | null | undefined
  previousPeriod?: string | null
  /** Invierte el color cuando una baja es una mejora (días de cierre). */
  mejorSiBaja?: boolean
  className?: string
}

/** Variación frente al mes anterior: ▲/▼ y porcentaje, verde si mejora y rojo si empeora. */
export function KpiDeltaBadge({ deltaPercent, previousPeriod, mejorSiBaja, className }: KpiDeltaBadgeProps) {
  const tone = deltaTone(deltaPercent, mejorSiBaja)
  const texto = formatDelta(deltaPercent)
  const referencia = previousPeriod ? `vs ${periodLabel(previousPeriod)}` : 'vs mes anterior'
  const descripcion =
    tone === 'none'
      ? `Sin dato para comparar ${referencia}`
      : `${texto.replace('▲', 'Sube').replace('▼', 'Baja')} ${referencia}`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
        TONE_STYLES[tone],
        className
      )}
      title={descripcion}
      aria-label={descripcion}
      data-tone={tone}
    >
      {texto}
    </span>
  )
}
