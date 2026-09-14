import { useQuery } from '@tanstack/react-query'
import { adminListUsersRequest } from '@/features/admin/api'
import { adminUsersKeys } from '@/features/admin/model'

export type AdminStatsSummary = {
  total: number
  clients: number
  workers: number
  admins: number
  internalTeam: number
  archived: number
}

/** Hook que obtiene metricas ejecutivas globales de usuarios. */
export function useAdminStats(accessToken: string) {
  const query = useQuery({
    queryKey: adminUsersKeys.list({ scope: 'executive-kpis' }),
    queryFn: async (): Promise<AdminStatsSummary> => {
      const [allRes, clientRes, workerRes, adminRes, totalWithDeletedRes] =
        await Promise.all([
          adminListUsersRequest(accessToken, { page: 1, limit: 1 }),
          adminListUsersRequest(accessToken, { page: 1, limit: 1, role: 'client' }),
          adminListUsersRequest(accessToken, { page: 1, limit: 1, role: 'worker' }),
          adminListUsersRequest(accessToken, { page: 1, limit: 1, role: 'admin' }),
          adminListUsersRequest(accessToken, {
            page: 1,
            limit: 1,
            include_deleted: true,
          }),
        ])

      const total = allRes.data.total
      const clients = clientRes.data.total
      const workers = workerRes.data.total
      const admins = adminRes.data.total
      const totalWithDeleted = totalWithDeletedRes.data.total
      const archived = Math.max(0, totalWithDeleted - total)

      return {
        total,
        clients,
        workers,
        admins,
        internalTeam: admins + workers,
        archived,
      }
    },
    enabled: Boolean(accessToken),
    staleTime: 20_000,
  })

  return {
    stats: query.data,
    isLoading: query.isLoading,
  }
}
