/**
 * Genera el marcado HTML para las píldoras interactivas (minimap breadcrumbs).
 */
export function renderMinimapHtml(currentIndex: number, totalSteps: number): string {
  if (totalSteps <= 1) return ''

  const dots = Array.from({ length: totalSteps }, (_, i) => {
    const isCurrent = i === currentIndex
    const isPast = i < currentIndex
    const stateClass = isCurrent ? 'active' : isPast ? 'completed' : ''
    return `<button type="button" class="cima-tour-minimap-dot ${stateClass}" ` +
      `data-tour-jump="${i}" aria-label="Paso ${i + 1} de ${totalSteps}" ` +
      `title="Ir al paso ${i + 1}"></button>`
  }).join('')

  return `<div class="cima-tour-minimap" role="tablist" aria-label="Progreso de la misión">${dots}</div>`
}

/**
 * Enlaza la delegación de eventos clic en las píldoras del minimap del popover.
 */
export function bindMinimapClicks(
  popoverWrapper: HTMLElement,
  onJump: (targetIdx: number) => void
): () => void {
  const handleClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tour-jump]')
    if (!target) return
    e.stopPropagation()
    const targetIdx = Number(target.getAttribute('data-tour-jump'))
    if (!Number.isNaN(targetIdx)) {
      onJump(targetIdx)
    }
  }

  popoverWrapper.addEventListener('click', handleClick)
  return () => popoverWrapper.removeEventListener('click', handleClick)
}
