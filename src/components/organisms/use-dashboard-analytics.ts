import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getAnalyticsSummaryRequest,
  getCampaignStatusReportRequest,
  getLowStockAlertsRequest,
  getKpiSnapshotsRequest,
  getClientPlanDistributionRequest,
  exportCampaignsRequest,
  exportLowStockRequest,
  exportKpisRequest,
  type ExportFormat,
} from '@/features/analytics/api'
import { analyticsKeys } from '@/features/analytics/model'
import { triggerBlobDownload } from '@/shared/lib'

export function useDashboardAnalytics(accessToken: string) {
  const summaryQuery = useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: () => getAnalyticsSummaryRequest(accessToken),
    staleTime: 60_000,
  })

  const campaignStatusQuery = useQuery({
    queryKey: analyticsKeys.campaignStatus(),
    queryFn: () => getCampaignStatusReportRequest(accessToken),
    staleTime: 60_000,
  })

  const lowStockQuery = useQuery({
    queryKey: analyticsKeys.lowStock(),
    queryFn: () => getLowStockAlertsRequest(accessToken),
    staleTime: 60_000,
  })

  const snapshotsQuery = useQuery({
    queryKey: [...analyticsKeys.all, 'snapshots'],
    queryFn: () => getKpiSnapshotsRequest(accessToken),
    staleTime: 60_000,
  })

  const planQuery = useQuery({
    queryKey: analyticsKeys.planDistribution(),
    queryFn: () => getClientPlanDistributionRequest(accessToken),
    staleTime: 60_000,
  })

  const summary = summaryQuery.data
  const isRefreshing =
    summaryQuery.isFetching ||
    campaignStatusQuery.isFetching ||
    lowStockQuery.isFetching ||
    snapshotsQuery.isFetching ||
    planQuery.isFetching

  function refreshAll() {
    summaryQuery.refetch()
    campaignStatusQuery.refetch()
    lowStockQuery.refetch()
    snapshotsQuery.refetch()
    planQuery.refetch()
  }

  const [campaignsFormat, setCampaignsFormat] = useState<ExportFormat | null>(null)
  const campaignsExport = useMutation({
    mutationFn: async (format: ExportFormat) => {
      setCampaignsFormat(format)
      const blob = await exportCampaignsRequest(accessToken, format)
      return { blob, format }
    },
    onSuccess: ({ blob, format }) => triggerBlobDownload(blob, `campanas-cimaxis.${format}`),
    onSettled: () => setCampaignsFormat(null),
  })

  const [lowStockFormat, setLowStockFormat] = useState<ExportFormat | null>(null)
  const lowStockExport = useMutation({
    mutationFn: async (format: ExportFormat) => {
      setLowStockFormat(format)
      const blob = await exportLowStockRequest(accessToken, format)
      return { blob, format }
    },
    onSuccess: ({ blob, format }) => triggerBlobDownload(blob, `inventario-cimaxis.${format}`),
    onSettled: () => setLowStockFormat(null),
  })

  const [kpisFormat, setKpisFormat] = useState<ExportFormat | null>(null)
  const kpisExport = useMutation({
    mutationFn: async (format: ExportFormat) => {
      setKpisFormat(format)
      const blob = await exportKpisRequest(accessToken, format)
      return { blob, format }
    },
    onSuccess: ({ blob, format }) => triggerBlobDownload(blob, `kpis-cimaxis.${format}`),
    onSettled: () => setKpisFormat(null),
  })

  return {
    summaryQuery,
    campaignStatusQuery,
    lowStockQuery,
    snapshotsQuery,
    planQuery,
    summary,
    isRefreshing,
    refreshAll,
    campaignsFormat,
    campaignsExport,
    lowStockFormat,
    lowStockExport,
    kpisFormat,
    kpisExport,
  }
}
