/**
 * Utilidad para desplazamiento inteligente de elementos objetivo del Tour.
 * Asegura que elementos dentro de contenedores con scroll horizontal o vertical
 * se centren en la vista y no congelen la pantalla al desplazarse en movil.
 */

type DriverRef = { refresh: () => void; isActive: () => boolean }

let activeDriver: DriverRef | null = null
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let animTimeout: ReturnType<typeof setTimeout> | null = null
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
  }, 120)
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
  if (animTimeout) {
    clearTimeout(animTimeout)
    animTimeout = null
  }
  if (rAF) {
    cancelAnimationFrame(rAF)
    rAF = null
  }
  if (typeof document !== 'undefined') {
    document.body.classList.remove('cima-tour-scrolling')
    document.body.classList.remove('cima-tour-animating')
  }
}

export function triggerStepAnimation(durationMs = 240): void {
  if (typeof document === 'undefined') return
  document.body.classList.add('cima-tour-animating')
  if (animTimeout) clearTimeout(animTimeout)
  animTimeout = setTimeout(() => {
    document.body.classList.remove('cima-tour-animating')
    animTimeout = null
  }, durationMs)
}

export function resetHorizontalScroll(): void {
  if (typeof window !== 'undefined' && window.scrollX !== 0) {
    window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' })
  }
}

export function centerElementInScrollParents(element?: Element | null): void {
  if (typeof window === 'undefined' || !element) return

  let parent = element.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent)
    const canScrollX =
      (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
      parent.scrollWidth > parent.clientWidth

    if (canScrollX) {
      const parentRect = parent.getBoundingClientRect()
      const elRect = element.getBoundingClientRect()
      const relLeft = elRect.left - parentRect.left + parent.scrollLeft
      const targetScroll = relLeft - (parent.clientWidth - elRect.width) / 2
      const maxScroll = parent.scrollWidth - parent.clientWidth
      parent.scrollTo({
        left: Math.max(0, Math.min(targetScroll, maxScroll)),
        behavior: 'instant',
      })
    }
    parent = parent.parentElement
  }

  element.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' })
  resetHorizontalScroll()
}

export async function scrollTargetIntoView(element: Element, waitMs = 100): Promise<void> {
  centerElementInScrollParents(element)
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  resetHorizontalScroll()
}
