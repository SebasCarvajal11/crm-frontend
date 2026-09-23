import { waitForElement } from './dom-target-finder'
import { centerElementInScrollParents } from './scroll-helper'

export type NavigateOptions = {
  to: string
  search: (prev: Record<string, unknown>) => Record<string, unknown>
  replace: boolean
}

export type NavigateFunction = (opts: NavigateOptions) => void

/**
 * Conmuta la subpestaña del espacio de trabajo si es necesario.
 */
export function switchTabIfNeeded(targetTab?: string): void {
  if (!targetTab || typeof document === 'undefined') return
  const btn = document.querySelector<HTMLButtonElement>(`[data-tour="workspace-tab-${targetTab}"]`)
  if (btn) {
    const isSelected =
      btn.getAttribute('aria-selected') === 'true' ||
      btn.getAttribute('aria-pressed') === 'true'
    if (!isSelected) btn.click()
    centerElementInScrollParents(btn)
  }
}

/**
 * Ejecuta transiciones de navegación entre Kanban y Espacio de Trabajo durante el tour.
 */
export async function handleActionTransition(
  action?: 'openProject' | 'closeProject',
  navigateFn?: NavigateFunction
): Promise<void> {
  if (action === 'openProject') {
    const cardEl = document.querySelector<HTMLElement>('[data-tour="collab-card-first"]')
    if (cardEl) {
      const clickTarget = cardEl.querySelector<HTMLElement>('button') ?? cardEl
      clickTarget.click()
      await waitForElement('[data-tour="workspace-project-header"]', 2000)
    }
  } else if (action === 'closeProject') {
    const backBtn = document.querySelector<HTMLElement>('[data-tour="workspace-back-btn"]')
    if (backBtn) {
      const clickTarget = backBtn.querySelector<HTMLElement>('button') ?? backBtn
      clickTarget.click()
    } else if (navigateFn) {
      navigateFn({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: 'collab',
          project_id: undefined,
          workspace_tab: undefined,
        }),
        replace: true,
      })
    }
    await waitForElement('[data-tour="collab-columns-container"]', 2000)
  }
}
