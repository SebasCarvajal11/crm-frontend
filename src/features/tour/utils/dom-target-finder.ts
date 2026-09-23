export async function waitForElement(
  selector: string,
  timeoutMs = 1200,
  fallbackSelector?: string
): Promise<Element | null> {
  if (typeof document === 'undefined') return null
  const existing = document.querySelector(selector)
  if (existing) return existing

  return new Promise((resolve) => {
    let resolved = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let observer: MutationObserver | null = null
    let pollInterval: ReturnType<typeof setInterval> | null = null

    const cleanup = () => {
      if (timer) clearTimeout(timer)
      if (observer) observer.disconnect()
      if (pollInterval) clearInterval(pollInterval)
    }

    const finish = (el: Element | null) => {
      if (resolved) return
      resolved = true
      cleanup()
      resolve(el)
    }

    if (typeof MutationObserver !== 'undefined' && document.body) {
      observer = new MutationObserver(() => {
        const el = document.querySelector(selector)
        if (el) finish(el)
      })
      observer.observe(document.body, { childList: true, subtree: true, attributes: true })
    } else {
      pollInterval = setInterval(() => {
        const el = document.querySelector(selector)
        if (el) finish(el)
      }, 20)
    }

    timer = setTimeout(() => {
      const finalEl = document.querySelector(selector)
      if (finalEl) {
        finish(finalEl)
        return
      }
      if (fallbackSelector) {
        const fallbackEl = document.querySelector(fallbackSelector)
        finish(fallbackEl)
        return
      }
      finish(null)
    }, timeoutMs)
  })
}

export function isElementVisible(el: Element | null): boolean {
  if (!el || typeof window === 'undefined') return false
  const htmlEl = el as HTMLElement
  if (typeof htmlEl.getBoundingClientRect !== 'function') return false
  const rect = htmlEl.getBoundingClientRect()
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    typeof window.getComputedStyle === 'function' &&
    window.getComputedStyle(htmlEl).visibility !== 'hidden' &&
    window.getComputedStyle(htmlEl).display !== 'none'
  )
}
