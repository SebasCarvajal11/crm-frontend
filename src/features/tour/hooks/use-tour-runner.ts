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

function buildDescriptionWithHint(description: string, actionHint?: string): string {
  const safeHint = actionHint
    ? `<div class="cima-tour-action-hint">${HINT_SVG_ICON}<span>${actionHint}</span></div>`
    : ''
  return `<div class="cima-tour-desc-content"><p class="cima-tour-desc-text">${description}</p>${safeHint}</div>`
}

function mapTourStepToDriveStep(st: CimaTourStep, isMobile: boolean): DriveStep {
  return {
    element: st.element,
    popover: {
      title: st.title,
      description: buildDescriptionWithHint(st.description, st.actionHint),
      side: isMobile ? 'bottom' : (st.side ?? 'bottom'),
      align: isMobile ? 'center' : (st.align ?? 'start'),
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
    },
  }
}

export function useTourRunner() {
  const driverRef = useRef<Driver | null>(null)
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ctx = useTourContext()
  const markTourCompleted = useTourStore((s) => s.markTourCompleted)
  const setActiveTour = useTourStore((s) => s.setActiveTour)

  const clearTimer = useCallback(() => {
    if (cursorTimerRef.current) {
      clearTimeout(cursorTimerRef.current)
      cursorTimerRef.current = null
    }
  }, [])

  const stopTour = useCallback(() => {
    clearTimer()
    removeTourCursor()
    if (driverRef.current) {
      driverRef.current.destroy()
      driverRef.current = null
    }
    setActiveTour(null)
  }, [clearTimer, setActiveTour])

  const scheduleCursor = useCallback((element?: Element) => {
    clearTimer()
    if (element) {
      cursorTimerRef.current = setTimeout(() => {
        showTourCursor(element)
      }, 220)
    }
  }, [clearTimer])

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
        duration: 240,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 6 : 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        steps,
        onHighlightStarted: () => {
          clearTimer()
          removeTourCursor()
        },
        onHighlighted: (element) => {
          scheduleCursor(element)
        },
        onDeselected: () => {
          clearTimer()
          removeTourCursor()
        },
        onDestroyed: () => {
          clearTimer()
          removeTourCursor()
          markTourCompleted(tour.id)
          setActiveTour(null)
          driverRef.current = null
        },
      })

      driverRef.current = instance
      instance.drive()
    },
    [clearTimer, ctx.role, markTourCompleted, scheduleCursor, setActiveTour, stopTour]
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
        duration: 240,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 6 : 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        onHighlighted: (element) => {
          scheduleCursor(element)
        },
        onDestroyed: () => {
          clearTimer()
          removeTourCursor()
          driverRef.current = null
        },
      })

      driverRef.current = instance
      instance.highlight({
        element: el ? targetSelector : undefined,
        popover: {
          title,
          description: buildDescriptionWithHint(description, actionHint),
          side: isMobile ? 'bottom' : 'bottom',
          align: isMobile ? 'center' : 'start',
          showButtons: ['close'],
          doneBtnText: 'Entendido',
        },
      })
    },
    [clearTimer, scheduleCursor, stopTour]
  )

  return {
    startTour,
    highlightTarget,
    stopTour,
  }
}
