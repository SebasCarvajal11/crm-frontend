import { useEffect, useState, type RefObject } from 'react'

export function useElementInViewport(
  elementRef?: RefObject<HTMLElement | null>,
  enabled = true
): boolean {
  const [isInViewport, setIsInViewport] = useState<boolean>(() => {
    if (!enabled || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return true
    }
    return !elementRef
  })

  useEffect(() => {
    if (!enabled || !elementRef?.current || typeof IntersectionObserver === 'undefined') {
      return
    }

    const node = elementRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsInViewport(entry.isIntersecting)
        }
      },
      { threshold: 0 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [elementRef, enabled])

  return isInViewport
}
