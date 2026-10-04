import { useEffect, useRef } from 'react'

type TourSpotlightProps = {
  target: HTMLElement | null
  status: 'loading' | 'ready' | 'missing'
  minimized: boolean
  compact: boolean
  revision: number | undefined
}

export function TourSpotlight({
  target,
  status,
  minimized,
  compact,
  revision,
}: TourSpotlightProps) {
  const highlightRef = useRef<HTMLDivElement>(null)

  // Direct DOM synchronization for coordinate morphing without cascading renders
  useEffect(() => {
    if (revision === undefined) return
    const el = highlightRef.current
    if (!el) return

    el.classList.add('cima-tour-morphing')
    el.setAttribute('data-morphing', 'true')
    const timer = setTimeout(() => {
      el.classList.remove('cima-tour-morphing')
      el.setAttribute('data-morphing', 'false')
    }, 300)

    return () => clearTimeout(timer)
  }, [revision])

  useEffect(() => {
    const el = highlightRef.current
    if (!el || !target) return

    const updateGeometry = () => {
      const viewport = window.visualViewport
      const top = viewport?.offsetTop ?? 0
      const left = viewport?.offsetLeft ?? 0
      const width = viewport?.width ?? window.innerWidth
      const height = viewport?.height ?? window.innerHeight
      const rect = target.getBoundingClientRect()

      const x = Math.max(left + 2, rect.left - 3)
      const y = Math.max(top + 2, rect.top - 3)
      const w = Math.max(0, Math.min(rect.right + 3, left + width - 2) - x)
      const h = Math.max(0, Math.min(rect.bottom + 3, top + height - 2) - y)

      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.width = `${w}px`
      el.style.height = `${h}px`
    }

    updateGeometry()

    window.addEventListener('resize', updateGeometry)
    window.addEventListener('scroll', updateGeometry, true)
    window.visualViewport?.addEventListener('resize', updateGeometry)
    window.visualViewport?.addEventListener('scroll', updateGeometry)

    return () => {
      window.removeEventListener('resize', updateGeometry)
      window.removeEventListener('scroll', updateGeometry, true)
      window.visualViewport?.removeEventListener('resize', updateGeometry)
      window.visualViewport?.removeEventListener('scroll', updateGeometry)
    }
  }, [target, revision])

  if (minimized || compact || !target) {
    return null
  }

  return (
    <div
      ref={highlightRef}
      data-testid="tour-spotlight"
      data-status={status}
      data-morphing="false"
      className="cima-tour-highlight"
      aria-hidden="true"
    />
  )
}
