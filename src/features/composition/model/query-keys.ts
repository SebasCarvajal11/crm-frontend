export const compositionKeys = {
  all: ['composition'] as const,
  dashboard: (accessToken?: string | null) =>
    [...compositionKeys.all, 'dashboard', accessToken ?? ''] as const,
}
