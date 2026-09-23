/**
 * Helper de compatibilidad para cursor de tour.
 * El resalte activo ahora se gestiona de forma nativa y fluida mediante
 * outline pulsante en CSS (.driver-active-element) para máximo rendimiento móvil.
 */

export function isElementVisibleInViewport(rect: DOMRect): boolean {
  if (typeof window === 'undefined') return false
  if (rect.width <= 0 || rect.height <= 0) return false
  const margin = 10
  const isHorizontallyIn = rect.right > margin && rect.left < window.innerWidth - margin
  const isVerticallyIn = rect.bottom > margin && rect.top < window.innerHeight - margin
  return isHorizontallyIn && isVerticallyIn
}

export function showTourCursor(): void {
  // Sin operaciones de cursor falso en el DOM: resalte nativo por spotlight y CSS
}

export function removeTourCursor(): void {
  const existing = document.getElementById('cima-tour-cursor')
  if (existing) {
    existing.remove()
  }
}
