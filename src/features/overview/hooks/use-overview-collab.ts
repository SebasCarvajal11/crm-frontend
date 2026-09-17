import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { getProjectBoardRequest, listPendingChangeRequestsRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { adminListUsersRequest } from '@/features/admin/api'
import type { ProjectListItem } from '@/features/collab/model'
import type {
  AdminBlockedTaskItem,
  ClientProjectCountItem,
  WorkerPendingTaskItem,
  WorkerWorkloadItem,
} from '../model/overview.types'

export function useOverviewCollab({
  accessToken,
  projects,
  role,
  userSub,
}: {
  accessToken: string
  projects: ProjectListItem[]
  role?: string
  userSub?: string
}) {
  const isAdmin = role === 'admin'
  const isWorker = role === 'worker'

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status !== 'completed'),
    [projects]
  )

  const { boardResults, isBoardsLoading } = useQueries({
    queries: activeProjects.map((p) => ({
      queryKey: collabKeys.projectBoard(p.id),
      queryFn: () => getProjectBoardRequest(accessToken, p.id),
      enabled: Boolean(accessToken && p.id),
      staleTime: 60_000,
    })),
    combine: (results) => ({
      boardResults: results.map((r, idx) => ({
        board: r.data?.data?.board,
        project: activeProjects[idx],
      })),
      isBoardsLoading: results.some((r) => r.isLoading),
    }),
  })

  const workersQ = useQuery({
    queryKey: ['admin-users', 'workers-directory'],
    queryFn: () => adminListUsersRequest(accessToken, { role: 'worker', limit: 100 }),
    enabled: Boolean(accessToken && isAdmin),
    staleTime: 120_000,
  })

  const pendingChangeRequestsQ = useQuery({
    queryKey: collabKeys.pendingChangeRequests(),
    queryFn: () => listPendingChangeRequestsRequest(accessToken),
    enabled: Boolean(accessToken && isAdmin),
    staleTime: 30_000,
  })

  // ── Worker: Tareas pendientes (no hechas) de más antigua a más reciente ────
  const workerPendingTasks: WorkerPendingTaskItem[] = useMemo(() => {
    if (!isWorker || !userSub) return []
    const result: WorkerPendingTaskItem[] = []

    for (const { board, project } of boardResults) {
      if (!board || !project) continue

      const colMap = new Map(board.columns.map((c) => [c.id, c]))
      for (const task of board.tasks) {
        if (task.assigneeSub !== userSub) continue
        const col = colMap.get(task.columnId)
        if (!col || col.key === 'done' || col.key === 'completed') continue

        result.push({
          taskId: task.id,
          projectId: project.id,
          projectName: project.name,
          title: task.title,
          priority: task.priority,
          columnTitle: col.title,
          deadline: task.deadline,
          createdAt: task.createdAt,
        })
      }
    }

    return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [isWorker, userSub, boardResults])

  // ── Admin: Tareas bloqueadas en cualquier proyecto ─────────────────────────
  const adminBlockedTasks: AdminBlockedTaskItem[] = useMemo(() => {
    if (!isAdmin) return []
    const result: AdminBlockedTaskItem[] = []

    for (const { board, project } of boardResults) {
      if (!board || !project) continue

      const blockedColIds = new Set(
        board.columns.filter((c) => c.key === 'blocked').map((c) => c.id)
      )

      for (const task of board.tasks) {
        if (!blockedColIds.has(task.columnId)) continue
        result.push({
          taskId: task.id,
          projectId: project.id,
          projectName: project.name,
          title: task.title,
          priority: task.priority,
          assigneeSub: task.assigneeSub,
          deadline: task.deadline,
          createdAt: task.createdAt,
        })
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [isAdmin, boardResults])

  // ── Admin: Top de trabajadores por carga y % de resolución ─────────────────
  const adminWorkerWorkload: WorkerWorkloadItem[] = useMemo(() => {
    if (!isAdmin) return []
    const statsBySub = new Map<string, { total: number; completed: number }>()

    for (const { board } of boardResults) {
      if (!board) continue

      const doneColIds = new Set(
        board.columns.filter((c) => c.key === 'done' || c.key === 'completed').map((c) => c.id)
      )

      for (const task of board.tasks) {
        if (!task.assigneeSub) continue
        const current = statsBySub.get(task.assigneeSub) ?? { total: 0, completed: 0 }
        current.total += 1
        if (doneColIds.has(task.columnId)) {
          current.completed += 1
        }
        statsBySub.set(task.assigneeSub, current)
      }
    }

    const workersList = workersQ.data?.data?.items ?? []
    const workerMap = new Map(workersList.map((w) => [w.id, w]))

    const rows: WorkerWorkloadItem[] = []
    statsBySub.forEach((st, sub) => {
      const w = workerMap.get(sub)
      const name = w ? `${w.first_name ?? ''} ${w.last_name ?? ''}`.trim() || w.email : 'Trabajador'
      const email = w?.email ?? sub
      const resolutionRate = st.total > 0 ? Math.round((st.completed / st.total) * 100) : 0

      rows.push({
        workerSub: sub,
        workerName: name,
        workerEmail: email,
        totalAssigned: st.total,
        completedCount: st.completed,
        pendingCount: st.total - st.completed,
        resolutionRate,
      })
    })

    return rows.sort((a, b) => b.totalAssigned - a.totalAssigned)
  }, [isAdmin, boardResults, workersQ.data])

  // ── Admin: Clientes ordenados por cantidad de proyectos ────────────────────
  const adminClientRanking: ClientProjectCountItem[] = useMemo(() => {
    if (!isAdmin) return []
    const map = new Map<string, { total: number; inProgress: number; completed: number }>()

    for (const p of projects) {
      const client = p.clientName?.trim() || 'Sin cliente asignado'
      const cur = map.get(client) ?? { total: 0, inProgress: 0, completed: 0 }
      cur.total += 1
      if (p.status === 'in_progress') cur.inProgress += 1
      if (p.status === 'completed') cur.completed += 1
      map.set(client, cur)
    }

    const rows: ClientProjectCountItem[] = []
    map.forEach((val, name) => {
      rows.push({
        clientName: name,
        totalProjects: val.total,
        inProgressProjects: val.inProgress,
        completedProjects: val.completed,
      })
    })

    return rows.sort((a, b) => b.totalProjects - a.totalProjects)
  }, [isAdmin, projects])

  // ── Admin: Últimos 3 proyectos creados ─────────────────────────────────────
  const adminRecentProjects = useMemo(() => {
    if (!isAdmin) return []
    return projects
      .slice()
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 3)
  }, [isAdmin, projects])

  return {
    isLoading: isBoardsLoading,
    workerPendingTasks,
    adminBlockedTasks,
    adminWorkerWorkload,
    adminClientRanking,
    adminRecentProjects,
    adminPendingChangeRequests: pendingChangeRequestsQ.data?.data ?? [],
    isAdminPendingChangeRequestsLoading: pendingChangeRequestsQ.isLoading,
  }
}
