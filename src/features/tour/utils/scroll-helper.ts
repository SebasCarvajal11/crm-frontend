/**
 * Utilidad de desplazamiento inteligente de alto rendimiento para CIMA Smart Copilot.
 * Centra elementos en el viewport sin colisionar con la cabecera sticky ni con el popover.
 * Optimizado para 60fps constantes en iOS Safari y Android sin layout thrashing.
 */

type DriverRef = { refresh: () => void; isActive: () => boolean }

export function startScrollSupervisor(_driver?: DriverRef | null): void {
  void _driver
  // Driver.js maneja su propio listener de scroll/resize internamente
}

export function stopScrollSupervisor(): void {
  // No-op mantenido por compatibilidad de interfaz con el ciclo de vida del tour
}

export function resetHorizontalScroll(): void {
  if (typeof window !== 'undefined' && window.scrollX !== 0) {
    window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' })
  }
}

function centerElementHorizontally(element: Element): void {
  let parent = element.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent)
    const canScrollX =
      (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
      parent.scrollWidth > parent.clientWidth

    if (canScrollX) {
      const pRect = parent.getBoundingClientRect()
      const elRect = element.getBoundingClientRect()
      const relLeft = elRect.left - pRect.left + parent.scrollLeft
      const targetScroll = relLeft - (parent.clientWidth - elRect.width) / 2
      const maxScroll = parent.scrollWidth - parent.clientWidth
      parent.scrollTo({
        left: Math.max(0, Math.min(targetScroll, maxScroll)),
        behavior: 'auto',
      })
    }
    parent = parent.parentElement
  }
}

function centerElementVertically(element: Element): void {
  const mainEl = document.querySelector('main')
  const elRect = element.getBoundingClientRect()
  const headerOffset = 64
  const isMobile = window.innerWidth < 640
  const popoverAllowance = isMobile ? 180 : 140
  const availableH = window.innerHeight - headerOffset - popoverAllowance
  const idealTop = headerOffset + Math.max(16, (availableH - elRect.height) / 2)
  const deltaY = elRect.top - idealTop

  if (elRect.top < headerOffset + 8 || elRect.bottom > window.innerHeight - popoverAllowance) {
    if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
      mainEl.scrollBy({ top: deltaY, behavior: 'auto' })
    } else {
      window.scrollBy({ top: deltaY, behavior: 'auto' })
    }
  }
}

export function centerElementInScrollParents(element?: Element | null): void {
  if (typeof window === 'undefined' || !element) return
  centerElementHorizontally(element)
  centerElementVertically(element)
  resetHorizontalScroll()
}

export async function scrollTargetIntoView(element: Element, waitMs = 50): Promise<void> {
  centerElementInScrollParents(element)
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  resetHorizontalScroll()
}
