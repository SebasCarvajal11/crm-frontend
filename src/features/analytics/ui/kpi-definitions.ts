import {
  BadgeDollarSign,
  Clock,
  FolderCheck,
  FolderKanban,
  Megaphone,
  Send,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import type { KpiSnapshot } from '../api/kpis-api'
import type { KpiKey } from '../model'

export type Formato = 'entero' | 'moneda' | 'porcentaje' | 'dias'

export interface KpiDefinition {
  key: keyof KpiSnapshot
  label: string
  origen: string
  icon: typeof UserPlus
  formato: Formato
  destacado?: boolean
  /** Clave del KPI en crm-marketing (/analytics/kpis/{kpi}/detail y /compare). */
  apiKey: KpiKey
  /** true cuando bajar es una mejora (p. ej. días de cierre): invierte el color de la variación. */
  mejorSiBaja?: boolean
}

export const KPIS: KpiDefinition[] = [
  {
    key: 'newClients',
    apiKey: 'new_clients',
    label: 'Clientes nuevos',
    origen: 'Altas registradas en el período',
    icon: UserPlus,
    formato: 'entero',
  },
  {
    key: 'estimatedRevenue',
    apiKey: 'revenue',
    label: 'Ingresos estimados',
    origen: 'Propuestas aprobadas en el período',
    icon: BadgeDollarSign,
    formato: 'moneda',
    destacado: true,
  },
  {
    key: 'activeCampaigns',
    apiKey: 'active_campaigns',
    label: 'Campañas activas',
    origen: 'Vigentes durante el período',
    icon: Megaphone,
    formato: 'entero',
  },
  {
    key: 'clientsContacted',
    apiKey: 'clients_contacted',
    label: 'Clientes contactados',
    origen: 'Distintos, con al menos un contacto',
    icon: Send,
    formato: 'entero',
  },
  {
    key: 'responseRate',
    apiKey: 'response_rate',
    label: 'Tasa de respuesta',
    origen: 'Respuestas sobre clientes contactados',
    icon: TrendingUp,
    formato: 'porcentaje',
    destacado: true,
  },
  {
    key: 'closedProjects',
    apiKey: 'closed_projects',
    label: 'Proyectos cerrados',
    origen: 'Finalizados en el período',
    icon: FolderCheck,
    formato: 'entero',
  },
  {
    key: 'projectsInProgress',
    apiKey: 'projects_in_progress',
    label: 'Proyectos en curso',
    origen: 'Abiertos al cierre del período',
    icon: FolderKanban,
    formato: 'entero',
  },
  {
    key: 'avgCloseDays',
    apiKey: 'avg_close_days',
    mejorSiBaja: true,
    label: 'Tiempo promedio de cierre',
    origen: 'Días entre alta del cliente y cierre',
    icon: Clock,
    formato: 'dias',
  },
]

export function formatear(valor: number, formato: Formato): string {
  switch (formato) {
    case 'moneda':
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(valor)
    case 'porcentaje':
      return `${valor.toFixed(1)}%`
    case 'dias':
      return valor === 0 ? '—' : `${valor.toFixed(0)} d`
    default:
      return String(valor)
  }
}

export function formatearFechaHora(valor?: string | null): string {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(valor)
  )
}
