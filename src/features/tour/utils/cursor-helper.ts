/**
 * Helper para renderizar y posicionar el cursor animado interactivo
 * durante los recorridos del Centro de Asistencia de CIMA.
 */

const CURSOR_ID = 'cima-tour-cursor'

const CURSOR_SVG = `
  <div class="cima-tour-cursor-ripple"></div>
  <svg class="cima-tour-cursor-svg" viewBox="0 0 24 24" fill="#86070c" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 10.5V4.5a2 2 0 0 0-4 0v7.5l-1.8-1.8a2 2 0 0 0-2.8 2.8l4.6 4.6a6 6 0 0 0 4.2 1.8h2.3a5 5 0 0 0 5-5v-3a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v-1a2 2 0 0 0-2-2h-.5z" />
  </svg>
`

export function showTourCursor(target: Element): void {
  removeTourCursor()

  const rect = target.getBoundingClientRect()
  const top = window.scrollY + rect.top + Math.min(Math.max(rect.height * 0.35, 12), 40)
  const left = window.scrollX + rect.left + Math.min(Math.max(rect.width * 0.3, 16), 50)

  const cursorEl = document.createElement('div')
  cursorEl.id = CURSOR_ID
  cursorEl.className = 'cima-tour-cursor-container'
  cursorEl.style.top = `${top}px`
  cursorEl.style.left = `${left}px`
  cursorEl.innerHTML = CURSOR_SVG

  document.body.appendChild(cursorEl)
}

export function removeTourCursor(): void {
  const existing = document.getElementById(CURSOR_ID)
  if (existing) {
    existing.remove()
  }
}
