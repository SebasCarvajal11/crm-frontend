import { useQuery } from '@tanstack/react-query'
import { adminGetStorageStatsRequest } from '@/features/admin/api'
import type { StorageStatsResponse } from '@/features/admin/api'

export const adminStorageKeys = {
  all: ['admin', 'storage'] as const,
  stats: () => [...adminStorageKeys.all, 'stats'] as const,
}

export function useAdminStorageStats(accessToken: string) {
  const query = useQuery({
    queryKey: adminStorageKeys.stats(),
    queryFn: async (): Promise<StorageStatsResponse['data']> => {
      const response = await adminGetStorageStatsRequest(accessToken)
      return response.data
    },
    enabled: Boolean(accessToken),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}
