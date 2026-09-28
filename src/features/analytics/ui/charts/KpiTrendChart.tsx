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

  const chartData = data.map((kpi) => ({
    period: kpi.period || (kpi.calculatedAt ? new Date(kpi.calculatedAt).toLocaleDateString() : ''),
    newClients: kpi.newClients,
    closedProjects: kpi.closedProjects,
    projectsInProgress: kpi.projectsInProgress,
    activeCampaigns: kpi.activeCampaigns,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="newClients" stroke="#3b82f6" name="Nuevos Clientes" />
        <Line type="monotone" dataKey="closedProjects" stroke="#10b981" name="Proyectos Cerrados" />
        <Line type="monotone" dataKey="projectsInProgress" stroke="#f59e0b" name="En Progreso" />
        <Line type="monotone" dataKey="activeCampaigns" stroke="#8b5cf6" name="Campañas Activas" />
      </LineChart>
    </ResponsiveContainer>
  )
}