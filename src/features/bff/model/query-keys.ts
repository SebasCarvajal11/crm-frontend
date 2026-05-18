export const bffKeys = {
  all: ['bff'] as const,
  dashboard: (accessToken?: string | null) =>
    [...bffKeys.all, 'dashboard', accessToken ?? ''] as const,
  adminOverview: () => [...bffKeys.all, 'admin-overview'] as const,
}
