import type { CimaTourDefinition, CimaTourStep, TourUserRole } from './types'

/** Every preparation has a revision, so stale async work cannot commit. */
export type TourSession = {
  tour: CimaTourDefinition
  steps: CimaTourStep[]
  role: TourUserRole
  index: number
  revision: number
  visited: number[]
  minimized: boolean
}

export function createTourSession(tour: CimaTourDefinition, role: TourUserRole, revision: number): TourSession | null {
  const steps = tour.steps.filter((step) => !step.requiredRole || step.requiredRole.includes(role))
  if (!tour.roles.includes(role) || !steps.length) return null
  return { tour, steps, role, index: 0, revision, visited: [], minimized: false }
}

export function moveSession(session: TourSession, index: number): TourSession {
  if (!Number.isInteger(index) || index < 0 || index >= session.steps.length) return session
  return { ...session, index, revision: session.revision + 1 }
}

export function visitSession(session: TourSession, revision: number): TourSession {
  if (revision !== session.revision || session.visited.includes(session.index)) return session
  return { ...session, visited: [...session.visited, session.index] }
}

export function canCompleteSession(session: TourSession): boolean {
  return session.index === session.steps.length - 1 && session.visited.length === session.steps.length
}
