import { Database, FolderCheck, HardDrive, Trash2 } from 'lucide-react'
import { MetricRibbon, type MetricRibbonItem } from '@/components/molecules/metric-ribbon'
import { formatBytes } from '@/shared/lib'

interface StorageSummary {
  totalClients: number
  totalProjects: number
  totalBytes: number
  purgedBytes: number
}

interface Props {
  summary: StorageSummary
}

export function StorageSummaryCards({ summary }: Props) {
  const items: MetricRibbonItem[] = [
    {
      label: 'Clientes con Archivos',
      value: summary.totalClients,
      subtext: 'Carpetas de cliente',
      icon: <FolderCheck className="size-4" />,
      accent: 'muted',
    },
    {
      label: 'Proyectos Registrados',
      value: summary.totalProjects,
      subtext: 'Repositorios asignados',
      icon: <Database className="size-4" />,
      accent: 'blue',
    },
    {
      label: 'Espacio Activo en Nube',
      value: formatBytes(summary.totalBytes),
      subtext: 'En Oracle Cloud Storage',
      icon: <HardDrive className="size-4" />,
      accent: 'primary',
    },
    {
      label: 'Espacio Purgado/Liberado',
      value: formatBytes(summary.purgedBytes),
      subtext: 'Optimización permanente',
      icon: <Trash2 className="size-4" />,
      accent: 'emerald',
    },
  ]

  return (
    <div className="pt-2">
      <MetricRibbon
        items={items}
        columns={4}
        ariaLabel="Resumen de almacenamiento"
      />
    </div>
  )
}
