import type { DriveStep } from 'driver.js'
import type { CimaTourStep } from '../model/types'

const HINT_SVG = `
<svg class="cima-tour-hint-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m9 9 5 12 1.8-5.2L21 14Z"/>
  <path d="M7.2 2.2 8 5.1"/>
  <path d="m5.1 8-2.9-.8"/>
  <path d="M14 4.1 12 6"/>
  <path d="m6 12-1.9 2"/>
</svg>`

export function buildDescriptionWithHint(
  description: string,
  actionHint?: string,
  interactiveAction?: string
): string {
  const safeHint = actionHint
    ? `<div class="cima-tour-action-hint">${HINT_SVG}<span>${actionHint}</span></div>`
    : ''

  const interactiveBadge =
    interactiveAction && interactiveAction !== 'none'
      ? `<div class="cima-tour-interactive-badge">
           <span class="cima-tour-dot"></span>
           <span>Interactivo: realiza la acción o pulsa Siguiente</span>
         </div>`
      : ''

  return `<div class="cima-tour-desc-content">
    <p class="cima-tour-desc-text">${description}</p>
    ${safeHint}
    ${interactiveBadge}
  </div>`
}

export function mapTourStepToDriveStep(st: CimaTourStep, isMobile: boolean): DriveStep {
  const chosenSide = isMobile
    ? (st.mobileSide ?? (st.side === 'top' ? 'top' : 'bottom'))
    : (st.side ?? 'bottom')

  const sideClass = chosenSide === 'top' ? 'cima-popover-top' : 'cima-popover-bottom'

  return {
    element: st.element,
    popover: {
      title: st.title,
      description: buildDescriptionWithHint(st.description, st.actionHint, st.interactiveAction),
      side: chosenSide,
      align: isMobile ? 'center' : (st.align ?? 'start'),
      popoverClass: `cima-tour-popover ${sideClass}`,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
    },
  }
}
