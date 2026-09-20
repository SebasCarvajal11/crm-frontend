import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react'
import { SummaryCard } from './summary-card'
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
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="En seguimiento"
          value={String(resumen.pendientes)}
          hint={formatCurrency(resumen.valorPipeline)}
          icon={Clock}
          accent="border-l-primary"
        />
        <SummaryCard
          label="Sin respuesta"
          value={String(resumen.vencidas)}
          hint={`Más de ${UMBRAL_SIN_RESPUESTA_DIAS} días`}
          icon={AlertTriangle}
          accent="border-l-amber-500"
        />
        <SummaryCard
          label="Aprobadas"
          value={String(resumen.aprobadas)}
          hint={formatCurrency(resumen.valorAprobado)}
          icon={CheckCircle2}
          accent="border-l-emerald-600"
        />
        <SummaryCard
          label="Total registradas"
          value={String(resumen.total)}
          hint="Histórico completo"
          icon={FileText}
          accent="border-l-muted-foreground"
        />
      </div>

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
