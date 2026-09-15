import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getAnalyticsSummaryRequest,
  getCurrentKpisRequest,
} from '@/features/analytics/api'
import type { OverviewMarketingMetrics } from '../model/overview.types'

export function useOverviewMarketing(accessToken: string) {
  const summaryQ = useQuery({
    queryKey: ['overview', 'marketing', 'summary', accessToken],
    queryFn: () => getAnalyticsSummaryRequest(accessToken),
    enabled: Boolean(accessToken?.trim()),
    staleTime: 60_000,
    retry: 1,
  })

  const kpisQ = useQuery({
    queryKey: ['overview', 'marketing', 'kpis', accessToken],
    queryFn: () => getCurrentKpisRequest(accessToken),
    enabled: Boolean(accessToken?.trim()),
    staleTime: 60_000,
    retry: 1,
  })

  const metrics: OverviewMarketingMetrics = useMemo(() => {
    const summary = summaryQ.data
    const kpis = kpisQ.data

    return {
      totalClients: summary?.totalClients ?? 0,
      newClients: kpis?.newClients ?? 0,
      activeCampaigns: summary?.activeCampaigns ?? kpis?.activeCampaigns ?? 0,
      projectsInProgress: summary?.projectsInProgress ?? kpis?.projectsInProgress ?? 0,
      totalProjects: summary?.totalProjects ?? 0,
      totalInteractions: summary?.totalMarketingInteractions ?? kpis?.clientsContacted ?? 0,
      responseRate: kpis?.responseRate ?? 0,
    }
  }, [summaryQ.data, kpisQ.data])

  return {
    metrics,
    isLoading: summaryQ.isLoading || kpisQ.isLoading,
    isError: summaryQ.isError && kpisQ.isError,
    refetch: () => {
      void summaryQ.refetch()
      void kpisQ.refetch()
    },
  }
}
