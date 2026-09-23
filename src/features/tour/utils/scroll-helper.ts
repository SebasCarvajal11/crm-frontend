/**
 * Utilidad de desplazamiento inteligente para CIMA Smart Copilot.
 * Centra elementos en el viewport de <main> y contenedores Kanban
 * sin colisionar con el header sticky ni con el popover inferior.
 */

type DriverRef = { refresh: () => void; isActive: () => boolean }

let activeDriver: DriverRef | null = null
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let rAF: number | null = null
let supervisorActive = false

function handleScrollOrTouch(): void {
  if (typeof document === 'undefined') return
  if (!document.body.classList.contains('cima-tour-scrolling')) {
    document.body.classList.add('cima-tour-scrolling')
  }

  if (activeDriver && activeDriver.isActive()) {
    if (rAF) cancelAnimationFrame(rAF)
    rAF = requestAnimationFrame(() => {
      activeDriver?.refresh()
      rAF = null
    })
  }

  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    document.body.classList.remove('cima-tour-scrolling')
    scrollTimeout = null
  }, 100)
}

export function startScrollSupervisor(driver?: DriverRef | null): void {
  if (typeof window === 'undefined') return
  if (driver) activeDriver = driver
  if (supervisorActive) return
  supervisorActive = true
  window.addEventListener('scroll', handleScrollOrTouch, { passive: true, capture: true })
  window.addEventListener('touchmove', handleScrollOrTouch, { passive: true, capture: true })
}

export function stopScrollSupervisor(): void {
  if (typeof window === 'undefined') return
  activeDriver = null
  if (supervisorActive) {
    supervisorActive = false
    window.removeEventListener('scroll', handleScrollOrTouch, true)
    window.removeEventListener('touchmove', handleScrollOrTouch, true)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
  if (rAF) {
    cancelAnimationFrame(rAF)
    rAF = null
  }
  if (typeof document !== 'undefined') {
    document.body.classList.remove('cima-tour-scrolling')
  }
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
        behavior: 'instant',
      })
    }
    parent = parent.parentElement
  }
}

function centerElementVertically(element: Element): void {
  const mainEl = document.querySelector('main')
  if (!mainEl) return

  const elRect = element.getBoundingClientRect()
  const headerOffset = 68
  const popoverAllowance = window.innerWidth < 640 ? 240 : 180
  const availableH = window.innerHeight - headerOffset - popoverAllowance
  const idealTop = headerOffset + Math.max(12, (availableH - elRect.height) / 2)
  const deltaY = elRect.top - idealTop

  if (elRect.top < headerOffset + 8 || elRect.bottom > window.innerHeight - popoverAllowance) {
    mainEl.scrollBy({ top: deltaY, behavior: 'instant' })
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
