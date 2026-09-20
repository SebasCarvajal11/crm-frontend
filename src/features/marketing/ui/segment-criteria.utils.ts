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

export function limpiar(criteria: SegmentCriteria): SegmentCriteria {
  return {
    plans: criteria.plans?.length ? criteria.plans : undefined,
    proposalStatuses: criteria.proposalStatuses?.length ? criteria.proposalStatuses : undefined,
    hasProjects: criteria.hasProjects ?? undefined,
    hasInteractions: criteria.hasInteractions ?? undefined,
    minDaysWithoutContact: criteria.minDaysWithoutContact ?? undefined,
  }
}
