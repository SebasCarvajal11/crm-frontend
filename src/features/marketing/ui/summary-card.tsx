import type { ComponentType } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface SummaryCardProps {
  label: string
  value: string | number
  hint: string
  icon: ComponentType<{ className?: string }>
}

export function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card className="border border-border/80 shadow-xs hover:border-border transition-all">
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold leading-none tabular-nums">{value}</p>
          <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-full bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
