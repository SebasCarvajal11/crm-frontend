import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ClientPlanDistributionDto } from '../../model'

interface Props {
  data: ClientPlanDistributionDto[]
  loading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PlanDistributionChart({ data, loading }: Props) {
  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Cargando gráfico...</div>
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-sm text-muted-foreground">Sin datos disponibles</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="clientCount"
          nameKey="planName"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} clientes`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
