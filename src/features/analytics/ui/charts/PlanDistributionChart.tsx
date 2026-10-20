import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ClientPlanDistributionDto } from '../../model'
import { planSliceColor } from './plan-distribution.utils'

interface Props {
  data: ClientPlanDistributionDto[]
  loading?: boolean
}

export function PlanDistributionChart({ data, loading }: Props) {
  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Cargando gráfico...</div>
  }

  const safeData = Array.isArray(data) ? data : Array.isArray((data as unknown as { data: unknown })?.data) ? (data as unknown as { data: typeof data }).data : []

  if (!safeData || safeData.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Aún no hay clientes con plan. Asígnelos en Marketing → Clientes.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={safeData}
          dataKey="clientCount"
          nameKey="plan"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {safeData.map((d, index) => (
            <Cell key={`cell-${index}`} fill={planSliceColor(d, index)} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} clientes`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
