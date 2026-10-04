import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { KpiChartGradients } from './kpi-chart-gradients'
import { KpiChartTooltip } from './kpi-chart-tooltip'
import { KPI_SERIES_CONFIGS } from './kpi-chart-types'

type ChartRow = {
  period: string
  newClients: number
  closedProjects: number
  projectsInProgress: number
  activeCampaigns: number
}

type Props = {
  data: ChartRow[]
  prefersReducedMotion: boolean
}

export function KpiTrendAreaContent({ data, prefersReducedMotion }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
        <KpiChartGradients />
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="currentColor"
          strokeOpacity={0.07}
        />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={{ stroke: 'currentColor', strokeOpacity: 0.15 }}
          tick={{ fill: 'currentColor', opacity: 0.65, fontSize: 11 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={{ stroke: 'currentColor', strokeOpacity: 0.15 }}
          tick={{ fill: 'currentColor', opacity: 0.65, fontSize: 11 }}
        />
        <Tooltip
          content={(props) => <KpiChartTooltip {...props} />}
          cursor={{
            stroke: 'currentColor',
            strokeOpacity: 0.15,
            strokeWidth: 1.5,
            strokeDasharray: '4 4',
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12 }} />
        {KPI_SERIES_CONFIGS.map((series) => (
          <Area
            key={series.key}
            type="monotone"
            dataKey={series.key}
            name={series.name}
            stroke={series.stroke}
            strokeWidth={2.5}
            fill={`url(#${series.gradientId})`}
            fillOpacity={1}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={900}
            animationEasing="ease-out"
            activeDot={{ r: 4.5, strokeWidth: 2, stroke: '#ffffff' }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
