import type { CimaTourStep } from '../model/types'

/**
 * Enfoca automáticamente el primer input o textarea si el paso es de tipo entrada.
 */
export function autoFocusTargetInput(element: Element): void {
  if (typeof document === 'undefined') return
  const inputEl =
    element.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea') ??
    (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element : null)

  if (inputEl) {
    inputEl.focus({ preventScroll: true })
  }
}

/**
 * Transiciona el badge interactivo a estado exitoso con micro-animación '✓ ¡Acción detectada!'.
 */
export function triggerLiveReaction(popoverWrapper?: HTMLElement | null): void {
  if (!popoverWrapper) return
  const badge = popoverWrapper.querySelector<HTMLElement>('.cima-tour-interactive-badge')
  if (!badge) return

  badge.classList.add('cima-tour-badge-success')
  badge.innerHTML = '<span class="cima-tour-check">✓</span><span>¡Acción detectada!</span>'
}

type StepInteractionParams = {
  element: Element
  step: CimaTourStep
  stepIdx: number
  getActiveIndex: () => number | undefined
  isTourActive: () => boolean
  onAdvance: () => void
  onProjectTransition?: () => Promise<void>
}

/**
 * Conecta detectores de eventos para avance interactivo (clicks, inputs y modales).
 */
export function attachInteractiveStep(params: StepInteractionParams): () => void {
  const { element, step, stepIdx, getActiveIndex, isTourActive, onAdvance, onProjectTransition } = params
  const shouldListen = Boolean(
    (step.interactiveAction && step.interactiveAction !== 'none') ||
    step.onNextAction === 'openProject'
  )
  if (!shouldListen) return () => {}

  let fired = false
  const getPopover = () =>
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>('.driver-popover.cima-tour-popover')
      : null

  const handleAction = async () => {
    if (fired || !isTourActive() || getActiveIndex() !== stepIdx) return
    fired = true

    triggerLiveReaction(getPopover())
    if (step.onNextAction === 'openProject' && onProjectTransition) {
      await onProjectTransition()
    }

    if (step.autoAdvanceOnAction !== false) {
      setTimeout(() => {
        if (isTourActive() && getActiveIndex() === stepIdx) {
          onAdvance()
        }
      }, 350)
    }
  }

  const inputEl = element.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
  if (step.interactiveAction === 'input' && inputEl) {
    const handleInput = () => {
      if (inputEl.value.trim().length >= 2) {
        inputEl.removeEventListener('input', handleInput)
        void handleAction()
      }
    }
    inputEl.addEventListener('input', handleInput)
    return () => inputEl.removeEventListener('input', handleInput)
  }

  const clickTarget =
    element.querySelector<HTMLElement>('button, a, [role="button"], [role="tab"]') ??
    (element as HTMLElement)

  clickTarget.addEventListener('click', handleAction, { capture: true })
  return () => clickTarget.removeEventListener('click', handleAction, true)
}
