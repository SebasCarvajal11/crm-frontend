export function canPrefetch(): boolean {
  if (typeof navigator === 'undefined') return true
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (conn?.saveData) return false
  if (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') return false
  return true
}

export const preloadCollab = () => (canPrefetch() ? import('@/features/collab/ui') : Promise.resolve())
export const preloadMarketing = () => (canPrefetch() ? import('@/features/marketing') : Promise.resolve())
export const preloadAnalytics = () => (canPrefetch() ? import('@/components/organisms/dashboard-analytics') : Promise.resolve())
export const preloadAdmin = () => (canPrefetch() ? import('@/features/admin/ui') : Promise.resolve())
export const preloadAccount = () => (canPrefetch() ? import('@/components/organisms/account-panel') : Promise.resolve())

/**
 * @deprecated Precarga masiva eager desaconsejada (FIND-FE-01). Usar pre-descarga por hover/focus intent.
 */
export function warmDashboardChunks(..._args: unknown[]) {
  void _args
  // No-op intencional para erradicar la descarga eager incondicional de 2.15 MB.
}
