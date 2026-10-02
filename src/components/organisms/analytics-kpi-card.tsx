import type { ComponentType } from 'react'
import { ACCENT_STYLES, type Accent } from './analytics-kpi-styles'

export type { Accent }

export interface KpiCardProps {
  label: string
  value: number | string
  subtitle: string
  icon: ComponentType<{ className?: string }>
  accent: Accent
  loading?: boolean
}

export function KpiCard({ label, value, subtitle, icon: Icon, accent, loading }: KpiCardProps) {
  const styles = ACCENT_STYLES[accent]
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200">
      <div className={`absolute inset-x-0 top-0 h-1.5 ${styles.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-2 h-9 w-20 animate-pulse rounded-lg bg-muted" />
          ) : (
            <p className="mt-1.5 text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-foreground">{value}</p>
          )}
          <p className="mt-1.5 truncate text-xs font-medium text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`shrink-0 rounded-xl ${styles.iconBg} p-3 ${styles.iconText} shadow-2xs group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}
