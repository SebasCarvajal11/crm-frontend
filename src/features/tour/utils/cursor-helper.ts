/**
 * Helper para renderizar y posicionar el cursor animado interactivo
 * durante los recorridos del Centro de Asistencia de CIMA.
 * Garantiza cero colisión con el texto del objetivo, visibilidad estricta y fluidez.
 */

const CURSOR_ID = 'cima-tour-cursor'

const CURSOR_SVG = `
  <div class="cima-tour-cursor-ripple"></div>
  <svg class="cima-tour-cursor-svg" viewBox="0 0 24 24" fill="#86070c"
    stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 10.5V4.5a2 2 0 0 0-4 0v7.5l-1.8-1.8a2 2 0 0 0-2.8 2.8l4.6 4.6a6 6 0 0 0 4.2 1.8h2.3a5 5 0 0 0 5-5v-3a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v-1a2 2 0 0 0-2-2h-.5z" />
  </svg>
`

let activeTarget: Element | null = null
let rafHandle: number | null = null

export function isElementVisibleInViewport(rect: DOMRect): boolean {
  if (typeof window === 'undefined') return false
  if (rect.width <= 0 || rect.height <= 0) return false
  const margin = 10
  const isHorizontallyIn = rect.right > margin && rect.left < window.innerWidth - margin
  const isVerticallyIn = rect.bottom > margin && rect.top < window.innerHeight - margin
  return isHorizontallyIn && isVerticallyIn
}

function calculateCursorPosition(targetRect: DOMRect): { top: number; left: number } | null {
  if (!isElementVisibleInViewport(targetRect)) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 768

  let top = window.scrollY + targetRect.bottom + 4
  let left = window.scrollX + targetRect.left + targetRect.width / 2 - 12

  if (targetRect.bottom + 44 > screenH) {
    top = window.scrollY + Math.max(8, targetRect.top - 36)
  }

  const maxLeft = window.scrollX + screenW - 44
  const minLeft = window.scrollX + (isMobile ? 12 : 16)
  left = Math.max(minLeft, Math.min(left, maxLeft))

  return { top, left }
}

function updateCursorPosition(): void {
  if (!activeTarget) return
  const cursorEl = document.getElementById(CURSOR_ID)
  if (!cursorEl) return

  const rect = activeTarget.getBoundingClientRect()
  const coords = calculateCursorPosition(rect)
  if (coords) {
    cursorEl.style.top = `${coords.top}px`
    cursorEl.style.left = `${coords.left}px`
    cursorEl.style.display = 'flex'
  } else {
    cursorEl.style.display = 'none'
  }
}

function handleViewportChange(): void {
  if (rafHandle !== null) cancelAnimationFrame(rafHandle)
  rafHandle = requestAnimationFrame(updateCursorPosition)
}

export function showTourCursor(target: Element): void {
  removeTourCursor()
  activeTarget = target

  const rect = target.getBoundingClientRect()
  const coords = calculateCursorPosition(rect)
  if (!coords) return

  const cursorEl = document.createElement('div')
  cursorEl.id = CURSOR_ID
  cursorEl.className = 'cima-tour-cursor-container'
  cursorEl.style.top = `${coords.top}px`
  cursorEl.style.left = `${coords.left}px`
  cursorEl.innerHTML = CURSOR_SVG

  document.body.appendChild(cursorEl)
  requestAnimationFrame(() => {
    cursorEl.classList.add('cima-tour-cursor-visible')
  })

  window.addEventListener('scroll', handleViewportChange, { passive: true })
  window.addEventListener('resize', handleViewportChange, { passive: true })
}

export function removeTourCursor(): void {
  activeTarget = null
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle)
    rafHandle = null
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleViewportChange)
    window.removeEventListener('resize', handleViewportChange)
  }
  const existing = document.getElementById(CURSOR_ID)
  if (existing) {
    existing.remove()
  }
}
