/**
 * Supervisa cambios en la orientación y redimensionamiento del viewport para refrescar Driver.js.
 */
let resizeObserver: ResizeObserver | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function startViewportSupervisor(onViewportChange: () => void): void {
  stopViewportSupervisor()
  if (typeof window === 'undefined') return

  const handleUpdate = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      onViewportChange()
    }, 120)
  }

  window.addEventListener('resize', handleUpdate, { passive: true })
  window.addEventListener('orientationchange', handleUpdate, { passive: true })

  if (typeof ResizeObserver !== 'undefined' && document.body) {
    resizeObserver = new ResizeObserver(handleUpdate)
    resizeObserver.observe(document.body)
  }
}

export function stopViewportSupervisor(): void {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', stopViewportSupervisor)
    window.removeEventListener('orientationchange', stopViewportSupervisor)
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}
