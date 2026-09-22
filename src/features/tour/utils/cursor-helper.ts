/**
 * Helper para renderizar y posicionar el cursor animado interactivo
 * durante los recorridos del Centro de Asistencia de CIMA.
 * Garantiza cero colisión con el popover de lectura y fluidez visual.
 */

const CURSOR_ID = 'cima-tour-cursor'

const CURSOR_SVG = `
  <div class="cima-tour-cursor-ripple"></div>
  <svg class="cima-tour-cursor-svg" viewBox="0 0 24 24" fill="#86070c" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 10.5V4.5a2 2 0 0 0-4 0v7.5l-1.8-1.8a2 2 0 0 0-2.8 2.8l4.6 4.6a6 6 0 0 0 4.2 1.8h2.3a5 5 0 0 0 5-5v-3a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v-1a2 2 0 0 0-2-2h-.5z" />
  </svg>
`

function calculateNonOverlappingCoordinates(
  targetRect: DOMRect,
  popoverEl: Element | null
): { top: number; left: number } {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  if (isMobile) {
    // En móviles el popover se ancla fijo en la parte inferior de la pantalla.
    // Ubicar el cursor en la zona superior del elemento resaltado.
    const top = window.scrollY + targetRect.top + Math.max(10, Math.min(targetRect.height * 0.2, 30))
    const left = window.scrollX + Math.min(window.innerWidth - 56, targetRect.left + 24)
    return { top, left }
  }

  // En escritorio, verificar si el popover cubre el objetivo
  const pRect = popoverEl?.getBoundingClientRect()
  let top = window.scrollY + targetRect.top + Math.max(12, Math.min(targetRect.height * 0.2, 32))
  let left = window.scrollX + targetRect.left + Math.max(16, Math.min(targetRect.width * 0.2, 40))

  if (pRect) {
    const overlapsY = top - window.scrollY >= pRect.top - 20 && top - window.scrollY <= pRect.bottom + 20
    const overlapsX = left - window.scrollX >= pRect.left - 20 && left - window.scrollX <= pRect.right + 20

    if (overlapsY && overlapsX) {
      // Reposicionar hacia el borde opuesto despejado del elemento
      top = pRect.top > targetRect.top
        ? window.scrollY + Math.max(targetRect.top + 8, 10)
        : window.scrollY + Math.min(targetRect.bottom - 40, pRect.bottom + 12)
      left = window.scrollX + Math.min(targetRect.right - 44, targetRect.left + 20)
    }
  }

  return { top, left }
}

export function showTourCursor(target: Element): void {
  removeTourCursor()

  const rect = target.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return

  const popoverEl = document.querySelector('.driver-popover.cima-tour-popover')
  const { top, left } = calculateNonOverlappingCoordinates(rect, popoverEl)

  const cursorEl = document.createElement('div')
  cursorEl.id = CURSOR_ID
  cursorEl.className = 'cima-tour-cursor-container'
  cursorEl.style.top = `${top}px`
  cursorEl.style.left = `${left}px`
  cursorEl.innerHTML = CURSOR_SVG

  document.body.appendChild(cursorEl)
  requestAnimationFrame(() => {
    cursorEl.classList.add('cima-tour-cursor-visible')
  })
}

export function removeTourCursor(): void {
  const existing = document.getElementById(CURSOR_ID)
  if (existing) {
    existing.remove()
  }
}
