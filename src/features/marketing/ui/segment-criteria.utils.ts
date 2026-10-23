import type { SegmentCriteria } from '../api/segments-api'

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

/** Resumen legible de los criterios: "Plan Oro, Plata · Sin proyectos · 30+ días sin contacto". */
export function criteriaSummary(criteria?: SegmentCriteria | null): string {
  if (!criteria) return 'Todos los clientes'
  const parts: string[] = []
  if (criteria.plans?.length) parts.push(`Plan ${criteria.plans.join(', ')}`)
  if (criteria.hasProjects === true) parts.push('Con proyectos')
  if (criteria.hasProjects === false) parts.push('Sin proyectos')
  if (criteria.hasInteractions === true) parts.push('Con interacciones')
  if (criteria.hasInteractions === false) parts.push('Sin interacciones')
  if (criteria.minDaysWithoutContact != null && criteria.minDaysWithoutContact > 0) {
    parts.push(`${criteria.minDaysWithoutContact}+ días sin contacto`)
  }
  if (criteria.proposalStatuses?.length) {
    const labels = criteria.proposalStatuses.map((s) => ESTADOS_PROPUESTA.find((e) => e.value === s)?.label ?? s)
    parts.push(`Propuesta: ${labels.join(', ').toLowerCase()}`)
  }
  return parts.length ? parts.join(' · ') : 'Todos los clientes (sin filtros)'
}

/** Criterios completos para cargar un segmento guardado en el segmentador. */
export function toEditableCriteria(criteria?: SegmentCriteria | null): SegmentCriteria {
  return {
    ...CRITERIOS_VACIOS,
    ...(criteria ?? {}),
    plans: criteria?.plans ?? [],
    proposalStatuses: criteria?.proposalStatuses ?? [],
  }
}

export const SAVED_SEGMENT_HELP = 'Un segmento guardado puede ser la audiencia de una campaña.'
