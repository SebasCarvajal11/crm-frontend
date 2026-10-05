import { useEffect, type RefObject } from 'react'
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { TourSession } from '../model/tour-session'
import type { CimaTourStep } from '../model/types'

type TourPositioningOptions = {
  panelRef: RefObject<HTMLElement | null>
  session: TourSession | null
  target: HTMLElement | null
  step?: CimaTourStep
  hidden: boolean
  compactViewport: boolean
  setCompactViewport: (compact: boolean) => void
}

export function useTourPositioning({
  panelRef,
  session,
  target,
  step,
  hidden,
  compactViewport,
  setCompactViewport,
}: TourPositioningOptions) {
  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !session || hidden) return
    let disposed = false

    const update = () => {
      const viewport = window.visualViewport
      const top = viewport?.offsetTop ?? 0
      const left = viewport?.offsetLeft ?? 0
      const width = viewport?.width ?? window.innerWidth
      const height = viewport?.height ?? window.innerHeight
      const docked = width < 768
      const compact = docked && height < 340
      setCompactViewport(compact)

      panel.style.maxHeight = `${Math.max(44, docked && !session.minimized && !compact ? Math.min(height - 24, height * 0.42) : height - 24)}px`
      panel.style.width = `${Math.min(360, width - 24)}px`
      document.body.classList.toggle('cima-tour-docked', docked && !session.minimized)
      document.body.style.setProperty('--tour-guide-reserve', `${panel.offsetHeight + 24}px`)

      const rect = target?.getBoundingClientRect()
      if (width < 768 || !target || session.minimized) {
        panel.style.left = `${left + width - Math.min(360, width - 24) - 12}px`
        let ancestor = target
        let viewportPinned = false
        while (ancestor && docked) {
          if (getComputedStyle(ancestor).position === 'fixed') {
            viewportPinned = true
            break
          }
          ancestor = ancestor.parentElement
        }
        const topDock = viewportPinned && rect && rect.top > top + height / 2 && !session.minimized
        panel.style.top = `${topDock ? top + 12 : top + height - panel.offsetHeight - 12}px`
        return
      }

      void computePosition(target, panel, {
        strategy: 'fixed',
        placement: step?.side ?? 'bottom',
        middleware: [offset(16), flip({ padding: 12 }), shift({ padding: 12, crossAxis: true })],
      }).then(({ x, y }) => {
        if (disposed) return
        panel.style.left = `${x}px`
        panel.style.top = `${y}px`
      })
    }

    const cleanup = target
      ? autoUpdate(target, panel, update)
      : (() => {
          const observer = new ResizeObserver(update)
          observer.observe(panel)
          update()
          return () => observer.disconnect()
        })()

    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)

    return () => {
      disposed = true
      cleanup()
      document.body.classList.remove('cima-tour-docked')
      document.body.style.removeProperty('--tour-guide-reserve')
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [session, target, hidden, step?.side, compactViewport, panelRef, setCompactViewport])
}
