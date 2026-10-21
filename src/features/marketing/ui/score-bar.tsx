import { cn } from '@/shared/lib/utils'
import { SCORE_FORMULA, SCORE_TONES, clampScore, scoreLevel } from './commercial.utils'

interface ScoreBarProps {
  score?: number | null
  /** chip: número con color; bar: barra 0–100 con el número. */
  variant?: 'bar' | 'chip'
  className?: string
  /** Muestra el texto "Interés alto/medio/bajo" junto a la barra. */
  showLabel?: boolean
}

/** Puntaje de interés del cliente con color por rango (<40 bajo, 40–69 medio, ≥70 alto). */
export function ScoreBar({ score, variant = 'bar', className, showLabel = false }: ScoreBarProps) {
  const value = clampScore(score)
  const level = scoreLevel(value)
  const tone = SCORE_TONES[level]
  const title = `${tone.label}: ${value} de 100. ${SCORE_FORMULA}`

  if (variant === 'chip') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold tabular-nums',
          tone.chip,
          className
        )}
        title={title}
        data-score-level={level}
      >
        {value}
        <span className="sr-only"> de 100, {tone.label.toLowerCase()}</span>
      </span>
    )
  }

  return (
    <div className={cn('flex min-w-24 items-center gap-2', className)} title={title} data-score-level={level}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={`Puntaje de interés: ${value} de 100 (${tone.label.toLowerCase()})`}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-300', tone.bar)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn('w-7 text-right text-xs font-bold tabular-nums', tone.text)}>{value}</span>
      {showLabel && <span className={cn('whitespace-nowrap text-xs font-medium', tone.text)}>{tone.label}</span>}
    </div>
  )
}
