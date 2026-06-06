import type { ProjectTask } from './collab.types'

/** Peso numérico de prioridad para ordenar tareas (mayor = más urgente). */
export const PRIORITY_WEIGHT: Record<ProjectTask['priority'], number> = {
  urgent: 4, high: 3, medium: 2, low: 1,
}
