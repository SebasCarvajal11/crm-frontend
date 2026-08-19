import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { KpiSnapshotDto } from '../../model'

interface Props {
  data: KpiSnapshotDto[]
  loading?: boolean
}

export function KpiTrendChart({ data, loading }: Props) {
  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Cargando gráfico...</div>
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-sm text-muted-foreground">Sin datos disponibles</div>
  }

  // Agrupar por nombre de KPI para mostrar tendencias
  const groupedData = data.reduce(
    (acc, kpi) => {
      const timestamp = new Date(kpi.timestamp).toLocaleDateString()
      if (!acc[timestamp]) acc[timestamp] = {}
      acc[timestamp][kpi.kpiName] = kpi.value
      return acc
    },
    {} as Record<string, Record<string, number>>
  )

  const chartData = Object.entries(groupedData).map(([timestamp, kpis]) => ({
    timestamp,
    ...kpis,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        {Object.keys(chartData[0] || {})
          .filter((key) => key !== 'timestamp')
          .map((kpiName, idx) => (
            <Line
              key={kpiName}
              type="monotone"
              dataKey={kpiName}
              stroke={['#3b82f6', '#10b981', '#f59e0b'][idx % 3]}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  )
}