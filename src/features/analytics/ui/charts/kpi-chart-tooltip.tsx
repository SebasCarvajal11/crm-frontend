export type KpiTooltipPayloadItem = {
  dataKey?: string | number | ((obj: unknown) => unknown)
  name?: string | number
  value?: number | string | readonly (number | string)[]
  color?: string
}

export type KpiChartTooltipProps = {
  active?: boolean
  payload?: readonly KpiTooltipPayloadItem[]
  label?: string | number
}

export function KpiChartTooltip({
  active,
  payload,
  label,
}: KpiChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div
      data-testid="kpi-chart-glass-tooltip"
      className={[
        'rounded-xl border border-border/80 bg-card/90 px-3.5 py-2.5 shadow-lg',
        'backdrop-blur-md text-left transition-all duration-75',
      ].join(' ')}
    >
      <p className="text-[11px] font-bold text-foreground mb-1.5 border-b border-border/50 pb-1">
        Período: <span className="text-primary">{label}</span>
      </p>
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div
            key={String(entry.dataKey ?? idx)}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] font-medium">{entry.name}</span>
            </span>
            <span className="font-bold text-foreground tabular-nums text-[11px]">
              {String(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
