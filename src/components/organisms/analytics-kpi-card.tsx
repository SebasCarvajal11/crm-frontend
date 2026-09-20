import type { ComponentType } from 'react'

export const ACCENT_STYLES = {
  blue: { bar: 'bg-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  green: { bar: 'bg-green-500', iconBg: 'bg-green-100', iconText: 'text-green-600' },
  purple: { bar: 'bg-purple-500', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  red: { bar: 'bg-red-500', iconBg: 'bg-red-100', iconText: 'text-red-600' },
  cyan: { bar: 'bg-cyan-500', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600' },
  indigo: { bar: 'bg-indigo-500', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
} as const

export type Accent = keyof typeof ACCENT_STYLES

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
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm interactive-card">
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          )}
          <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`shrink-0 rounded-lg ${styles.iconBg} p-2.5 ${styles.iconText}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}
