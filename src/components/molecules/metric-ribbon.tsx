import { memo, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'

export type MetricAccent = 'primary' | 'emerald' | 'amber' | 'blue' | 'muted'

export type MetricRibbonItem = {
  id?: string
  label: string
  value: ReactNode
  hint?: ReactNode
  subtext?: ReactNode
  icon?: ReactNode
  accent?: MetricAccent
  onClick?: () => void
  highlight?: boolean
  className?: string
}

export type MetricRibbonProps = {
  items: MetricRibbonItem[]
  columns?: 2 | 3 | 4 | 6
  className?: string
  ariaLabel?: string
  isLoading?: boolean
  skeletonCount?: number
}

const ACCENT_STYLES: Record<MetricAccent, { icon: string; dot: string; text: string }> = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    dot: 'bg-primary',
    text: 'text-primary',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  muted: {
    icon: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground/40',
    text: 'text-muted-foreground',
  },
}

const GRID_COLS_MAP: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
}

function MetricCellSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-3 p-4 sm:p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

function MetricCell({ item }: { item: MetricRibbonItem }) {
  const accent = item.accent ?? 'primary'
  const style = ACCENT_STYLES[accent]

  const content = (
    <div
      className={cn(
        'group relative flex flex-col justify-between gap-3 p-4 sm:p-5 transition-colors duration-150',
        'hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none',
        item.highlight && 'bg-primary/[0.03]',
        item.onClick && 'cursor-pointer',
        item.className
      )}
      onClick={item.onClick}
      role={item.onClick ? 'button' : undefined}
      tabIndex={item.onClick ? 0 : undefined}
      onKeyDown={item.onClick ? (e) => e.key === 'Enter' && item.onClick?.() : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {item.label}
        </span>
        {item.icon && (
          <div
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200',
              'group-hover:scale-105',
              style.icon
            )}
            aria-hidden="true"
          >
            {item.icon}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground tabular-nums">
          {item.value}
        </div>
        {(item.hint || item.subtext) && (
          <p className="text-xs text-muted-foreground truncate leading-snug">
            {item.hint ?? item.subtext}
          </p>
        )}
      </div>
    </div>
  )

  return content
}

export const MetricRibbon = memo(function MetricRibbon({
  items,
  columns = 4,
  className,
  ariaLabel = 'Métricas clave',
  isLoading = false,
  skeletonCount = 4,
}: MetricRibbonProps) {
  const colsClass = GRID_COLS_MAP[columns] ?? 'grid-cols-2 lg:grid-cols-4'

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs',
        'divide-y divide-border/60 sm:divide-y-0',
        className
      )}
    >
      <div
        className={cn(
          'grid divide-y divide-x divide-border/60',
          colsClass
        )}
      >
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <MetricCellSkeleton key={i} />
            ))
          : items.map((item, idx) => (
              <MetricCell key={item.id ?? `${item.label}-${idx}`} item={item} />
            ))}
      </div>
    </div>
  )
})
