export const preloadCollab = () => import('@/features/collab/ui')
export const preloadMarketing = () => import('@/features/marketing')
export const preloadAnalytics = () => import('@/components/organisms/dashboard-analytics')
export const preloadAdmin = () => import('@/features/admin/ui')
export const preloadAccount = () => import('@/components/organisms/account-panel')

export function warmDashboardChunks(role?: string) {
  if (typeof window === 'undefined') return

  const runWarmup = () => {
    void preloadCollab()
    void preloadAccount()

    if (role === 'admin' || role === 'worker') {
      void preloadMarketing()
      void preloadAnalytics()
    }

    if (role === 'admin') {
      void preloadAdmin()
    }
  }

  const win = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }
  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(runWarmup, { timeout: 500 })
  } else {
    setTimeout(runWarmup, 50)
  }
}
