export type KpiSeriesKey =
  | 'newClients'
  | 'closedProjects'
  | 'projectsInProgress'
  | 'activeCampaigns'

export type KpiSeriesConfig = {
  key: KpiSeriesKey
  name: string
  stroke: string
  gradientId: string
  fillColor: string
}

export const KPI_SERIES_CONFIGS: KpiSeriesConfig[] = [
  {
    key: 'newClients',
    name: 'Nuevos Clientes',
    stroke: '#3b82f6',
    gradientId: 'gradientNewClients',
    fillColor: '#3b82f6',
  },
  {
    key: 'closedProjects',
    name: 'Proyectos Cerrados',
    stroke: '#10b981',
    gradientId: 'gradientClosedProjects',
    fillColor: '#10b981',
  },
  {
    key: 'projectsInProgress',
    name: 'En Progreso',
    stroke: '#f59e0b',
    gradientId: 'gradientProjectsInProgress',
    fillColor: '#f59e0b',
  },
  {
    key: 'activeCampaigns',
    name: 'Campañas Activas',
    stroke: '#8b5cf6',
    gradientId: 'gradientActiveCampaigns',
    fillColor: '#8b5cf6',
  },
]
