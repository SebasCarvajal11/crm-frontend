export async function waitForElement(
  selector: string,
  timeoutMs = 1200,
  fallbackSelector?: string
): Promise<Element | null> {
  if (typeof document === 'undefined') return null
  const existing = document.querySelector(selector)
  if (existing) return existing

  return new Promise((resolve) => {
    const start = Date.now()
    const check = () => {
      const el = document.querySelector(selector)
      if (el) {
        resolve(el)
        return
      }
      if (Date.now() - start >= timeoutMs) {
        if (fallbackSelector) {
          const fallbackEl = document.querySelector(fallbackSelector)
          resolve(fallbackEl)
          return
        }
        resolve(null)
        return
      }
      setTimeout(check, 30)
    }
    check()
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
