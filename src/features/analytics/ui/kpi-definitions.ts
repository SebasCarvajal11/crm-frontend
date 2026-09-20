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

export type Formato = 'entero' | 'moneda' | 'porcentaje' | 'dias'

export interface KpiDefinition {
  key: keyof KpiSnapshot
  label: string
  origen: string
  icon: typeof UserPlus
  formato: Formato
  destacado?: boolean
}

export const KPIS: KpiDefinition[] = [
  {
    key: 'newClients',
    label: 'Clientes nuevos',
    origen: 'Altas registradas en el período',
    icon: UserPlus,
    formato: 'entero',
  },
  {
    key: 'estimatedRevenue',
    label: 'Ingresos estimados',
    origen: 'Propuestas aprobadas en el período',
    icon: BadgeDollarSign,
    formato: 'moneda',
    destacado: true,
  },
  {
    key: 'activeCampaigns',
    label: 'Campañas activas',
    origen: 'Vigentes durante el período',
    icon: Megaphone,
    formato: 'entero',
  },
  {
    key: 'clientsContacted',
    label: 'Clientes contactados',
    origen: 'Distintos, con al menos un contacto',
    icon: Send,
    formato: 'entero',
  },
  {
    key: 'responseRate',
    label: 'Tasa de respuesta',
    origen: 'Respuestas sobre clientes contactados',
    icon: TrendingUp,
    formato: 'porcentaje',
    destacado: true,
  },
  {
    key: 'closedProjects',
    label: 'Proyectos cerrados',
    origen: 'Finalizados en el período',
    icon: FolderCheck,
    formato: 'entero',
  },
  {
    key: 'projectsInProgress',
    label: 'Proyectos en curso',
    origen: 'Abiertos al cierre del período',
    icon: FolderKanban,
    formato: 'entero',
  },
  {
    key: 'avgCloseDays',
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
