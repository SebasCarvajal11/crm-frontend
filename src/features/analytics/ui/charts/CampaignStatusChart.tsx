import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { CampaignStatusReportDto } from '../../model'

interface Props {
  data: CampaignStatusReportDto[]
  loading?: boolean
}

// Colores por estado real de campaña (ver campaigns_status_check en Postgres:
// Draft | Active | Paused | Completed | Cancelled).
const STATUS_COLORS: Record<string, string> = {
  Draft: '#94a3b8',
  Active: '#22c55e',
  Paused: '#f59e0b',
  Completed: '#3b82f6',
  Cancelled: '#ef4444',
}
const DEFAULT_COLOR = '#3b82f6'

export function CampaignStatusChart({ data, loading }: Props) {
  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Cargando gráfico...</div>
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-sm text-muted-foreground">Sin datos disponibles</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="status" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value: number) => [`${value} campaña${value === 1 ? '' : 's'}`, 'Cantidad']} />
        <Legend />
        <Bar dataKey="campaignCount" name="Campañas" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? DEFAULT_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}