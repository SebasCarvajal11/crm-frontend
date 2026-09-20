import { Label } from '@/components/ui/label'
import type { SegmentCriteria } from '../api/segments-api'

export const PLANES = ['Oro', 'Esmeralda', 'Premium'] as const

export const ESTADOS_PROPUESTA = [
  { value: 'Sent', label: 'Enviada' },
  { value: 'In_negotiation', label: 'En negociación' },
  { value: 'In_diagnosis', label: 'En diagnóstico' },
  { value: 'Approved', label: 'Aprobada' },
  { value: 'Rejected', label: 'Rechazada' },
]

export const CRITERIOS_VACIOS: SegmentCriteria = {
  plans: [],
  hasProjects: null,
  hasInteractions: null,
  minDaysWithoutContact: null,
  proposalStatuses: [],
}

export function TriEstado({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}) {
  const opciones: { label: string; valor: boolean | null }[] = [
    { label: 'Indiferente', valor: null },
    { label: 'Sí', valor: true },
    { label: 'No', valor: false },
  ]

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1 rounded-md border border-input p-1">
        {opciones.map((op) => (
          <button
            key={String(op.valor)}
            type="button"
            onClick={() => onChange(op.valor)}
            className={`flex-1 rounded px-2 py-1 text-xs transition-colors ${
              value === op.valor
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function limpiar(criteria: SegmentCriteria): SegmentCriteria {
  return {
    plans: criteria.plans?.length ? criteria.plans : undefined,
    proposalStatuses: criteria.proposalStatuses?.length ? criteria.proposalStatuses : undefined,
    hasProjects: criteria.hasProjects ?? undefined,
    hasInteractions: criteria.hasInteractions ?? undefined,
    minDaysWithoutContact: criteria.minDaysWithoutContact ?? undefined,
  }
}
