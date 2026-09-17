export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
  kpis: (period: string = '') => [...analyticsKeys.all, 'kpis', period] as const,
  campaignStatus: () => [...analyticsKeys.all, 'campaign-status'] as const,
  lowStock: () => [...analyticsKeys.all, 'low-stock'] as const,
  planDistribution: () => [...analyticsKeys.all, 'plan-distribution'] as const,
  activity: () => [...analyticsKeys.all, 'activity'] as const,
}
