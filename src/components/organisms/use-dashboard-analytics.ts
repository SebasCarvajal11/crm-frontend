import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAnalyticsSummaryRequest,
  getCampaignStatusReportRequest,
  getKpiSnapshotsRequest,
  getClientPlanDistributionRequest,
  getAnalyticsProjectsRequest,
  syncCrmFromAnalyticsRequest,
  exportCampaignsRequest,
  exportKpisRequest,
  type ExportFormat,
} from '@/features/analytics/api'
import { analyticsKeys } from '@/features/analytics/model'
import { triggerBlobDownload, parseApiError } from '@/shared/lib'
import { syncResultMessage } from '@/features/analytics/ui/analytics-labels'

export function useDashboardAnalytics(accessToken: string, options: { isAdmin?: boolean } = {}) {
  const queryClient = useQueryClient()
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

  // El inventario / stock bajo se oculta: esas tablas no se alimentan en crm-marketing.

  const snapshotsQuery = useQuery({
    queryKey: analyticsKeys.snapshots(),
    queryFn: () => getKpiSnapshotsRequest(accessToken),
    staleTime: 60_000,
  })

  const planQuery = useQuery({
    queryKey: analyticsKeys.planDistribution(),
    queryFn: () => getClientPlanDistributionRequest(accessToken),
    staleTime: 60_000,
  })

  const projectsQuery = useQuery({
    queryKey: analyticsKeys.projects(),
    queryFn: () => getAnalyticsProjectsRequest(accessToken),
    staleTime: 60_000,
  })

  const summary = summaryQuery.data
  const isRefreshing =
    summaryQuery.isFetching ||
    campaignStatusQuery.isFetching ||
    snapshotsQuery.isFetching ||
    planQuery.isFetching ||
    projectsQuery.isFetching

  function refreshAll() {
    // Refresca también los KPI del período, su comparación y los detalles abiertos.
    void queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
  }

  // Sincronización con el CRM (el backend la permite solo a admin).
  const [syncNotice, setSyncNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const syncMutation = useMutation({
    mutationFn: () => syncCrmFromAnalyticsRequest(accessToken),
    onMutate: () => setSyncNotice(null),
    onSuccess: (data) => {
      setSyncNotice({ tone: 'success', text: `Sincronización completada: ${syncResultMessage(data)}.` })
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['marketing'] })
    },
    onError: async (error) => {
      const detalle = await parseApiError(error)
      setSyncNotice({ tone: 'error', text: `No se pudo sincronizar con el CRM. ${detalle}` })
    },
  })
  const canSync = Boolean(options.isAdmin)

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
    snapshotsQuery,
    planQuery,
    projectsQuery,
    summary,
    isRefreshing,
    refreshAll,
    campaignsFormat,
    campaignsExport,
    canSync,
    syncMutation,
    syncNotice,
    dismissSyncNotice: () => setSyncNotice(null),
    kpisFormat,
    kpisExport,
  }
}
