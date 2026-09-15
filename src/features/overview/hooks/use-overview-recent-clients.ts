import { useQuery } from '@tanstack/react-query'
import { adminListUsersRequest } from '@/features/admin/api'

export function useOverviewRecentClients(accessToken: string, enabled = true) {
  return useQuery({
    queryKey: ['admin-users', 'recent-clients'],
    queryFn: () => adminListUsersRequest(accessToken, { page: 1, limit: 5, role: 'client' }),
    enabled: Boolean(accessToken && enabled),
    staleTime: 60_000,
    select: (res) => res.data.items,
  })
}
