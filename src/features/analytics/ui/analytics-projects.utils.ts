import type { ProjectAnalyticsDto, ProjectStatus } from '../model'

export type ProjectStatusFilter = ProjectStatus | 'all'

export function countProjectsByStatus(projects: ProjectAnalyticsDto[]): Record<ProjectStatus, number> {
  const counts: Record<ProjectStatus, number> = { todo: 0, in_progress: 0, in_review: 0, completed: 0 }
  for (const p of projects) {
    if (p.status && p.status in counts) counts[p.status as ProjectStatus] += 1
  }
  return counts
}

/** Filtra por estado y ordena del más recientemente actualizado al más antiguo. */
export function filterProjects(projects: ProjectAnalyticsDto[], filter: ProjectStatusFilter) {
  const list = filter === 'all' ? projects : projects.filter((p) => p.status === filter)
  return [...list].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
}
