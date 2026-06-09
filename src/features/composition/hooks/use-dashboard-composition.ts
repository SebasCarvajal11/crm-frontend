import { useQuery } from '@tanstack/react-query'
import { fetchDashboardComposition } from '@/features/composition/api'
import { compositionKeys } from '@/features/composition/model'

export function useDashboardComposition(token: string | null, enabled: boolean) {
  return useQuery({
    queryKey: compositionKeys.dashboard(token),
    queryFn: () => fetchDashboardComposition(token!),
    enabled: enabled && Boolean(token),
    retry: false,
  })
}
