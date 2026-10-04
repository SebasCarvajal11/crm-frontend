import type { SectionTabItem } from './section-tabs'

export interface PillGeometry {
  x: number
  y: number
  width: number
  height: number
}

export interface TabKeyNavigationOptions<T extends string> {
  event: React.KeyboardEvent<HTMLButtonElement>
  currentIndex: number
  items: readonly SectionTabItem<T>[]
  tabRefs: Map<T, HTMLButtonElement>
  onSelect: (value: T) => void
}

/**
 * Mide la geometría relativa de la pestaña activa con precisión subpixel.
 * Compensa bordes de contenedor y scroll horizontal sin provocar reflow en bucles.
 */
export function measurePillGeometry(
  container: HTMLElement,
  target: HTMLElement,
): PillGeometry | null {
  const elRect = target.getBoundingClientRect()
  if (elRect.width === 0 || elRect.height === 0) return null

  const cRect = container.getBoundingClientRect()
  const x = elRect.left - cRect.left - container.clientLeft + container.scrollLeft
  const y = elRect.top - cRect.top - container.clientTop + container.scrollTop

  return { x, y, width: elRect.width, height: elRect.height }
}

/**
 * Centra la pestaña activa en el contenedor scrollable si hay desbordamiento.
 */
export function centerActiveTab(
  container: HTMLElement,
  pillX: number,
  pillWidth: number,
  behavior: ScrollBehavior = 'smooth',
): void {
  const maxScroll = container.scrollWidth - container.clientWidth
  if (maxScroll <= 0) return

  const targetScroll = pillX - (container.clientWidth - pillWidth) / 2
  container.scrollTo({
    left: Math.max(0, Math.min(targetScroll, maxScroll)),
    behavior,
  })
}

/**
 * Gestiona navegación accesible por teclado (ArrowLeft, ArrowRight, Home, End).
 */
export function handleTabKeyNavigation<T extends string>({
  event,
  currentIndex,
  items,
  tabRefs,
  onSelect,
}: TabKeyNavigationOptions<T>): void {
  let targetIndex = -1
  if (event.key === 'ArrowRight') {
    targetIndex = (currentIndex + 1) % items.length
  } else if (event.key === 'ArrowLeft') {
    targetIndex = (currentIndex - 1 + items.length) % items.length
  } else if (event.key === 'Home') {
    targetIndex = 0
  } else if (event.key === 'End') {
    targetIndex = items.length - 1
  }

  if (targetIndex !== -1 && targetIndex !== currentIndex) {
    event.preventDefault()
    const nextItem = items[targetIndex]
    if (nextItem) {
      onSelect(nextItem.value)
      tabRefs.get(nextItem.value)?.focus()
    }
  }
}
