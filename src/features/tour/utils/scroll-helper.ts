/**
 * Utilidad para desplazamiento inteligente de elementos objetivo del Tour.
 * Asegura que elementos dentro de contenedores con scroll horizontal o vertical
 * se centren en la vista antes de renderizar spotlights y cursores.
 */

export function resetHorizontalScroll(): void {
  if (typeof window !== 'undefined' && window.scrollX !== 0) {
    window.scrollTo({ left: 0, behavior: 'instant' })
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
        behavior: 'smooth',
      })
    }
    parent = parent.parentElement
  }

  element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  resetHorizontalScroll()
}

export async function scrollTargetIntoView(element: Element, waitMs = 220): Promise<void> {
  centerElementInScrollParents(element)
  await new Promise((resolve) => setTimeout(resolve, waitMs))
  resetHorizontalScroll()
}
