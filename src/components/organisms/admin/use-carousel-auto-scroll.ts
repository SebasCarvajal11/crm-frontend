import { useEffect, useRef } from 'react'

export type AutoScrollOptions = {
  containerRef: React.RefObject<HTMLDivElement | null>
  itemCount: number
  isHovered: boolean
  isInteracting: boolean
  speed?: number
}

/** Hook para desplazamiento horizontal continuo y pausado con cursor/foco/visibilidad. */
export function useCarouselAutoScroll({
  containerRef,
  itemCount,
  isHovered,
  isInteracting,
  speed = 36,
}: AutoScrollOptions) {
  const scrollPosRef = useRef(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el || itemCount <= 1) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) return

    let isVisible = true
    let rafId: number | null = null
    let lastTime = performance.now()
    scrollPosRef.current = el.scrollLeft

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry ? entry.isIntersecting : true
      },
      { threshold: 0, rootMargin: '100px 0px' }
    )
    observer.observe(el)

    const onVisibility = () => {
      isVisible = document.visibilityState === 'visible'
      lastTime = performance.now()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const tick = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const canScroll =
        isVisible && !isHovered && !isInteracting && el.scrollWidth > el.clientWidth

      if (canScroll) {
        scrollPosRef.current += speed * delta
        const loopDistance = parseFloat(el.dataset.loopDistance || '0')
        if (loopDistance > 0 && scrollPosRef.current >= loopDistance) {
          scrollPosRef.current -= loopDistance
        } else if (loopDistance <= 0) {
          const maxScroll = el.scrollWidth - el.clientWidth
          if (scrollPosRef.current >= maxScroll) {
            scrollPosRef.current = 0
          }
        }
        el.scrollLeft = scrollPosRef.current
      } else {
        scrollPosRef.current = el.scrollLeft
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [containerRef, itemCount, isHovered, isInteracting, speed])
}
