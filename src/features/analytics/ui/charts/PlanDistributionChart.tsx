import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ClientPlanDistributionDto } from '../../model'

interface Props {
  data: ClientPlanDistributionDto[]
  loading?: boolean
}

// Colores por plan comercial de CIMA; el resto (p. ej. sin plan) en gris.
const PLAN_COLORS: Record<string, string> = {
  Platinum: '#64748b',
  Oro: '#f59e0b',
  Diamante: '#0ea5e9',
}
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444']

export function PlanDistributionChart({ data, loading }: Props) {
  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Cargando gráfico...</div>
  }

  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Aún no hay clientes con plan. Asígnelos en Marketing → Clientes.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="clientCount"
          nameKey="plan"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((d, index) => (
            <Cell key={`cell-${index}`} fill={PLAN_COLORS[d.plan] ?? (d.plan ? COLORS[index % COLORS.length] : '#cbd5e1')} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} clientes`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
