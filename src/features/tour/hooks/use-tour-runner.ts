import { useCallback, useRef } from 'react'
import { driver, type Driver, type DriveStep } from 'driver.js'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from './use-tour-context'
import type { CimaTourDefinition, CimaTourStep } from '../model/types'
import { waitForElement } from '../utils/dom-target-finder'
import { showTourCursor, removeTourCursor } from '../utils/cursor-helper'
import '../ui/tour-popover-theme.css'

const HINT_SVG_ICON = `
<svg class="cima-tour-hint-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m9 9 5 12 1.8-5.2L21 14Z"/>
  <path d="M7.2 2.2 8 5.1"/>
  <path d="m5.1 8-2.9-.8"/>
  <path d="M14 4.1 12 6"/>
  <path d="m6 12-1.9 2"/>
</svg>
`

function buildActionHintElement(hintText: string): HTMLElement {
  const hintEl = document.createElement('div')
  hintEl.className = 'cima-tour-action-hint'
  hintEl.innerHTML = `${HINT_SVG_ICON}<span>${hintText}</span>`
  return hintEl
}

function mapTourStepToDriveStep(st: CimaTourStep, isMobile: boolean): DriveStep {
  return {
    element: st.element,
    popover: {
      title: st.title,
      description: st.description,
      side: isMobile ? 'bottom' : (st.side ?? 'bottom'),
      align: isMobile ? 'center' : (st.align ?? 'start'),
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      onPopoverRender: (popover) => {
        if (st.actionHint && !popover.wrapper.querySelector('.cima-tour-action-hint')) {
          const hint = buildActionHintElement(st.actionHint)
          popover.description.insertAdjacentElement('afterend', hint)
        }
      },
    },
    onHighlighted: (element) => {
      if (element && st.showPointer !== false) {
        showTourCursor(element)
      }
    },
    onDeselected: () => {
      removeTourCursor()
    },
  }
}

export function useTourRunner() {
  const driverRef = useRef<Driver | null>(null)
  const ctx = useTourContext()
  const markTourCompleted = useTourStore((s) => s.markTourCompleted)
  const setActiveTour = useTourStore((s) => s.setActiveTour)

  const stopTour = useCallback(() => {
    removeTourCursor()
    if (driverRef.current) {
      driverRef.current.destroy()
      driverRef.current = null
    }
    setActiveTour(null)
  }, [setActiveTour])

  const startTour = useCallback(
    async (tour: CimaTourDefinition) => {
      stopTour()
      useTourStore.getState().closeHelpCenter()
      setActiveTour(tour.id)

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
      const filtered = tour.steps.filter((st) => {
        if (st.requiredRole && !st.requiredRole.includes(ctx.role)) return false
        return true
      })

      const steps: DriveStep[] = filtered.map((st) => mapTourStepToDriveStep(st, isMobile))

      if (filtered[0]?.element) {
        await waitForElement(filtered[0].element, 1000)
      }

      const instance = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 4 : 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        steps,
        onDestroyed: () => {
          removeTourCursor()
          markTourCompleted(tour.id)
          setActiveTour(null)
          driverRef.current = null
        },
      })

      driverRef.current = instance
      instance.drive()
    },
    [ctx.role, markTourCompleted, setActiveTour, stopTour]
  )

  const highlightTarget = useCallback(
    async (
      targetSelector: string,
      title: string,
      description: string,
      actionHint?: string
    ) => {
      stopTour()
      useTourStore.getState().closeHelpCenter()
      const el = await waitForElement(targetSelector, 1200)
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

      const instance = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 4 : 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        onDestroyed: () => {
          removeTourCursor()
          driverRef.current = null
        },
      })

      driverRef.current = instance
      instance.highlight({
        element: el ? targetSelector : undefined,
        popover: {
          title,
          description,
          side: isMobile ? 'bottom' : 'bottom',
          align: isMobile ? 'center' : 'start',
          showButtons: ['close'],
          doneBtnText: 'Entendido',
          onPopoverRender: (popover) => {
            if (actionHint && !popover.wrapper.querySelector('.cima-tour-action-hint')) {
              const hint = buildActionHintElement(actionHint)
              popover.description.insertAdjacentElement('afterend', hint)
            }
          },
        },
        onHighlighted: (element) => {
          if (element) {
            showTourCursor(element)
          }
        },
        onDeselected: () => {
          removeTourCursor()
        },
      })
    },
    [stopTour]
  )

  return {
    startTour,
    highlightTarget,
    stopTour,
  }
}

