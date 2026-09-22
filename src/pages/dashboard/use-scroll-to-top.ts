import { useEffect, type RefObject } from 'react'

function forceScrollReset(container?: HTMLElement | null) {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
  }
  if (container) {
    container.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    container.scrollTop = 0
  }
  const mainEl = typeof document !== 'undefined' ? document.querySelector('main') : null
  if (mainEl && mainEl !== container) {
    mainEl.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    mainEl.scrollTop = 0
  }
}

/**
 * Hook para restaurar la posición del scroll al inicio (0, 0)
 * de forma instantánea y resiliente ante animaciones de teclado en Safari/iOS.
 */
export function useScrollToTop(
  dependency: unknown,
  containerRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const container = containerRef?.current ?? null

    forceScrollReset(container)

    const rafId = requestAnimationFrame(() => {
      forceScrollReset(container)
    })

    const t1 = setTimeout(() => forceScrollReset(container), 100)
    const t2 = setTimeout(() => forceScrollReset(container), 350)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [dependency, containerRef])
}
