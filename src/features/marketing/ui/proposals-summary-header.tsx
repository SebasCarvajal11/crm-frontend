import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react'
import { MetricRibbon, type MetricRibbonItem } from '@/components/molecules/metric-ribbon'
import { formatCurrency, UMBRAL_SIN_RESPUESTA_DIAS } from './proposal.constants'

interface ProposalsSummaryHeaderProps {
  resumen: {
    total: number
    pendientes: number
    vencidas: number
    aprobadas: number
    valorAprobado: number
    valorPipeline: number
  }
}

export function ProposalsSummaryHeader({ resumen }: ProposalsSummaryHeaderProps) {
  const items: MetricRibbonItem[] = [
    {
      label: 'En seguimiento',
      value: String(resumen.pendientes),
      hint: formatCurrency(resumen.valorPipeline),
      icon: <Clock className="size-4" />,
      accent: 'primary',
    },
    {
      label: 'Sin respuesta',
      value: String(resumen.vencidas),
      hint: `Más de ${UMBRAL_SIN_RESPUESTA_DIAS} días`,
      icon: <AlertTriangle className="size-4" />,
      accent: 'amber',
    },
    {
      label: 'Aprobadas',
      value: String(resumen.aprobadas),
      hint: formatCurrency(resumen.valorAprobado),
      icon: <CheckCircle2 className="size-4" />,
      accent: 'emerald',
    },
    {
      label: 'Total registradas',
      value: String(resumen.total),
      hint: 'Histórico completo',
      icon: <FileText className="size-4" />,
      accent: 'muted',
    },
  ]

  return (
    <>
      <MetricRibbon
        items={items}
        columns={4}
        ariaLabel="Resumen de propuestas"
      />

      {resumen.vencidas > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              {resumen.vencidas} propuesta(s) llevan más de {UMBRAL_SIN_RESPUESTA_DIAS} días sin respuesta
            </p>
            <p className="text-amber-800">
              Son las que el planificador tomará al ejecutar los flujos con disparador
              «Propuesta sin respuesta».
            </p>
          </div>
        </div>
      )}
    </>
  )
}
