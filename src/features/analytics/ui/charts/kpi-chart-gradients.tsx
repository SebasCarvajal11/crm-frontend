import { KPI_SERIES_CONFIGS } from './kpi-chart-types'

export function KpiChartGradients() {
  return (
    <defs>
      {KPI_SERIES_CONFIGS.map((series) => (
        <linearGradient
          key={series.gradientId}
          id={series.gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={series.fillColor} stopOpacity={0.32} />
          <stop offset="50%" stopColor={series.fillColor} stopOpacity={0.12} />
          <stop offset="95%" stopColor={series.fillColor} stopOpacity={0.01} />
        </linearGradient>
      ))}
    </defs>
  )
}
