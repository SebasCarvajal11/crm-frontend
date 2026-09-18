import type { ProjectNotification } from '../model'

export type DeltaResult = {
  updatedKnownIds: Set<string>
  newlyArrived: ProjectNotification[]
  isInitialMount: boolean
}

/**
 * Calcula de manera pura e inmutable las notificaciones recién llegadas
 * comparando los elementos recibidos contra los identificadores conocidos.
 */
export function calculateNotificationDeltas(
  items: ProjectNotification[],
  knownIds: Set<string> | null,
  maxToasts = 3
): DeltaResult {
  if (knownIds === null) {
    return {
      updatedKnownIds: new Set(items.map((n) => n.id)),
      newlyArrived: [],
      isInitialMount: true,
    }
  }

  const newlyArrived = items.filter((n) => !knownIds.has(n.id))
  const updatedKnownIds = new Set(knownIds)
  newlyArrived.forEach((n) => updatedKnownIds.add(n.id))

  return {
    updatedKnownIds,
    newlyArrived: newlyArrived.slice(0, maxToasts),
    isInitialMount: false,
  }
}
