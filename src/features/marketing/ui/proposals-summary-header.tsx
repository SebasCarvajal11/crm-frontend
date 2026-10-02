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
        <div
          className={[
            'flex items-start gap-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4',
            'shadow-2xs backdrop-blur-xs dark:border-amber-900/60 dark:bg-amber-950/30',
          ].join(' ')}
        >
          <div
            className={[
              'flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15',
              'text-amber-700 dark:text-amber-400 shadow-2xs',
            ].join(' ')}
          >
            <AlertTriangle className="size-4.5" />
          </div>
          <div className="text-sm space-y-0.5">
            <p className="font-bold tracking-tight text-amber-950 dark:text-amber-200">
              {resumen.vencidas} propuesta(s) llevan más de {UMBRAL_SIN_RESPUESTA_DIAS} días sin respuesta
            </p>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              Son las que el planificador tomará automáticamente al ejecutar los flujos con disparador
              «Propuesta sin respuesta».
            </p>
          </div>
        </div>
      )}
    </>
  )
}
