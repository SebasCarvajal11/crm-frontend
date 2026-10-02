import { CheckCircle2, Clock, Eye, Layers } from 'lucide-react'
import { MetricRibbon, type MetricRibbonItem } from '@/components/molecules/metric-ribbon'

type Props = {
  total: number
  active: number
  reviewing: number
  done: number
}

/**
 * Componente hoja: cinta de estadisticas resumen de proyectos.
 * Renderiza 4 metricas continuas por estado.
 */
export function ProjectStatsSummary({ total, active, reviewing, done }: Props) {
  const items: MetricRibbonItem[] = [
    {
      label: 'Total Proyectos',
      value: total,
      subtext: 'En cartera comercial',
      icon: <Layers className="size-4" />,
      accent: 'muted',
    },
    {
      label: 'En Curso',
      value: active,
      subtext: 'Producción activa',
      icon: <Clock className="size-4" />,
      accent: 'blue',
    },
    {
      label: 'En Revisión',
      value: reviewing,
      subtext: 'Control de calidad',
      icon: <Eye className="size-4" />,
      accent: 'amber',
    },
    {
      label: 'Completados',
      value: done,
      subtext: 'Entregas finalizadas',
      icon: <CheckCircle2 className="size-4" />,
      accent: 'emerald',
    },
  ]

  return (
    <MetricRibbon
      items={items}
      columns={4}
      ariaLabel="Resumen de proyectos"
    />
  )
}
