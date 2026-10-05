export function visibleElement(selector: string): HTMLElement | null {
  if (!selector) return null
  return [...document.querySelectorAll<HTMLElement>(selector)].find((element) => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return element.isConnected && rect.width > 0 && rect.height > 0 &&
      style.visibility !== 'hidden' && style.display !== 'none' &&
      !element.closest('[hidden], [inert], [aria-hidden="true"]')
  }) ?? null
}

/** Cancellable readiness, including visibility changes in retained tab panels. */
export function waitForTarget(selector: string, signal: AbortSignal, timeout = 2500): Promise<HTMLElement | null> {
  if (signal.aborted) return Promise.resolve(null)
  const current = visibleElement(selector)
  if (current) return Promise.resolve(current)
  return new Promise((resolve) => {
    const finish = (element: HTMLElement | null) => {
      observer.disconnect()
      clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      resolve(element)
    }
    const abort = () => finish(null)
    const observer = new MutationObserver(() => {
      const target = visibleElement(selector)
      if (target) finish(target)
    })
    const timer = setTimeout(() => finish(visibleElement(selector)), timeout)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden', 'aria-hidden', 'data-state'] })
    signal.addEventListener('abort', abort, { once: true })
  })
}

export function hasApplicationDialog(): boolean {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]')
  for (let i = 0; i < dialogs.length; i++) {
    const el = dialogs[i]
    if (el.getAttribute('data-state') !== 'closed' && el.getClientRects().length > 0) {
      return true
    }
  }
  return false
}
