import type { TaskPriority } from '@/features/collab/model'

export type WorkerPendingTaskItem = {
  taskId: string
  projectId: string
  projectName: string
  title: string
  priority: TaskPriority
  columnTitle: string
  deadline: string | null
  createdAt: string
}

export type AdminBlockedTaskItem = {
  taskId: string
  projectId: string
  projectName: string
  title: string
  priority: TaskPriority
  assigneeSub: string | null
  deadline: string | null
  createdAt: string
}

export type WorkerWorkloadItem = {
  workerSub: string
  workerName: string
  workerEmail: string
  totalAssigned: number
  completedCount: number
  pendingCount: number
  resolutionRate: number
}

export type ClientProjectCountItem = {
  clientName: string
  totalProjects: number
  inProgressProjects: number
  completedProjects: number
}

export type OverviewMarketingMetrics = {
  totalClients: number
  newClients: number
  activeCampaigns: number
  projectsInProgress: number
  totalProjects: number
  totalInteractions: number
  responseRate: number
}
