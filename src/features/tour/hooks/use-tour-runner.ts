import { useCallback, useRef } from 'react'
import { driver, type Driver, type DriveStep } from 'driver.js'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from './use-tour-context'
import type { CimaTourDefinition, CimaTourStep } from '../model/types'
import { waitForElement } from '../utils/dom-target-finder'
import { showTourCursor, removeTourCursor } from '../utils/cursor-helper'
import '../ui/tour-popover-theme.css'

let modalObserver: MutationObserver | null = null

function checkModalsAndPause(driverInst?: Driver | null): void {
  if (typeof document === 'undefined') return
  const modalSelector =
    '[role="dialog"]:not(.cima-tour-popover):not(.driver-popover), [role="alertdialog"]:not(.cima-tour-popover)'
  const openModal = document.querySelector(modalSelector)
  const isPaused = document.body.classList.contains('cima-tour-paused')

  if (openModal && !isPaused) {
    document.body.classList.add('cima-tour-paused')
  } else if (!openModal && isPaused) {
    document.body.classList.remove('cima-tour-paused')
    if (driverInst?.isActive()) {
      driverInst.refresh()
    }
  }
}

function startModalSupervisor(driverInst?: Driver | null): void {
  stopModalSupervisor()
  if (typeof document === 'undefined') return
  checkModalsAndPause(driverInst)
  modalObserver = new MutationObserver(() => checkModalsAndPause(driverInst))
  modalObserver.observe(document.body, { childList: true, subtree: true })
}

function stopModalSupervisor(): void {
  if (modalObserver) {
    modalObserver.disconnect()
    modalObserver = null
  }
  if (typeof document !== 'undefined') {
    document.body.classList.remove('cima-tour-paused')
  }
}

const HINT_SVG = `
<svg class="cima-tour-hint-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m9 9 5 12 1.8-5.2L21 14Z"/>
  <path d="M7.2 2.2 8 5.1"/>
  <path d="m5.1 8-2.9-.8"/>
  <path d="M14 4.1 12 6"/>
  <path d="m6 12-1.9 2"/>
</svg>`

function buildDescriptionWithHint(description: string, actionHint?: string): string {
  const safeHint = actionHint
    ? `<div class="cima-tour-action-hint">${HINT_SVG}<span>${actionHint}</span></div>`
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

function resetHorizontalScroll(): void {
  if (typeof window !== 'undefined' && window.scrollX !== 0) {
    window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' })
  }
}

function switchTabIfNeeded(targetTab?: string): void {
  if (!targetTab || typeof document === 'undefined') return
  const btn = document.querySelector<HTMLButtonElement>(`[data-tour="workspace-tab-${targetTab}"]`)
  if (btn && btn.getAttribute('aria-selected') !== 'true') {
    btn.click()
  }
}

async function handleActionTransition(action?: 'openProject' | 'closeProject'): Promise<void> {
  if (action === 'openProject') {
    const cardEl = document.querySelector<HTMLElement>('[data-tour="collab-card-first"]')
    if (cardEl) cardEl.click()
    await waitForElement('[data-tour="workspace-project-header"]', 2500)
  } else if (action === 'closeProject') {
    const backBtn = document.querySelector<HTMLElement>('[data-tour="workspace-back-btn"]')
    if (backBtn) backBtn.click()
    await waitForElement('[data-tour="collab-columns-container"]', 2500)
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
    stopModalSupervisor()
    removeTourCursor()
    resetHorizontalScroll()
    if (driverRef.current) {
      driverRef.current.destroy()
      driverRef.current = null
    }
    setActiveTour(null)
  }, [clearTimer, setActiveTour])

  const scheduleCursor = useCallback((element?: Element) => {
    clearTimer()
    if (element) {
      cursorTimerRef.current = setTimeout(() => showTourCursor(element), 220)
    }
  }, [clearTimer])

  const startTour = useCallback(
    async (tour: CimaTourDefinition) => {
      stopTour()
      useTourStore.getState().closeHelpCenter()
      setActiveTour(tour.id)

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
      const filtered = tour.steps.filter((st) => !st.requiredRole || st.requiredRole.includes(ctx.role))
      const steps: DriveStep[] = filtered.map((st) => mapTourStepToDriveStep(st, isMobile))

      if (filtered[0]?.switchWorkspaceTab) switchTabIfNeeded(filtered[0].switchWorkspaceTab)
      if (filtered[0]?.element) await waitForElement(filtered[0].element, 1000)

      const instance = driver({
        animate: true,
        smoothScroll: true,
        duration: 240,
        allowClose: true,
        waitForElement: 1500,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 4 : 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        steps,
        onNextClick: async (_element, _step, opts) => {
          const idx = opts.driver.getActiveIndex() ?? 0
          const action = filtered[idx]?.onNextAction
          if (action) await handleActionTransition(action)
          opts.driver.moveNext()
        },
        onPrevClick: async (_element, _step, opts) => {
          const idx = opts.driver.getActiveIndex() ?? 0
          if (filtered[idx - 1]?.element === '[data-tour="collab-card-first"]') {
            await handleActionTransition('closeProject')
          }
          opts.driver.movePrevious()
        },
        onHighlightStarted: (_el, _step, opts) => {
          clearTimer()
          removeTourCursor()
          resetHorizontalScroll()
          const activeIdx = opts?.state?.activeIndex ?? opts?.index ?? 0
          const targetTab = filtered[activeIdx]?.switchWorkspaceTab
          if (targetTab) switchTabIfNeeded(targetTab)
        },
        onHighlighted: (element, _step, opts) => {
          resetHorizontalScroll()
          scheduleCursor(element)
          const idx = opts.driver.getActiveIndex() ?? 0
          if (filtered[idx]?.onNextAction === 'openProject' && element) {
            element.addEventListener('click', async () => {
              await waitForElement('[data-tour="workspace-project-header"]', 2500)
              if (driverRef.current?.isActive() && driverRef.current.getActiveIndex() === idx) {
                driverRef.current.moveNext()
              }
            }, { once: true })
          }
        },
        onDeselected: () => {
          clearTimer()
          removeTourCursor()
        },
        onDestroyed: () => {
          clearTimer()
          stopModalSupervisor()
          removeTourCursor()
          markTourCompleted(tour.id)
          setActiveTour(null)
          driverRef.current = null
        },
      })

      driverRef.current = instance
      startModalSupervisor(instance)
      instance.drive()
    },
    [clearTimer, ctx.role, markTourCompleted, scheduleCursor, setActiveTour, stopTour]
  )

  const highlightTarget = useCallback(
    async (
      targetSelector: string,
      title: string,
      description: string,
      actionHint?: string,
      targetTab?: string
    ) => {
      stopTour()
      useTourStore.getState().closeHelpCenter()

      if (targetSelector.startsWith('[data-tour="workspace-') && !document.querySelector(targetSelector)) {
        await handleActionTransition('openProject')
      } else if (targetSelector.startsWith('[data-tour="collab-') && !document.querySelector(targetSelector)) {
        await handleActionTransition('closeProject')
      }

      if (targetTab) switchTabIfNeeded(targetTab)
      const el = await waitForElement(targetSelector, 1500)
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
        onHighlighted: (element) => scheduleCursor(element),
        onDestroyed: () => {
          clearTimer()
          stopModalSupervisor()
          removeTourCursor()
          driverRef.current = null
        },
      })

      driverRef.current = instance
      startModalSupervisor(instance)
      instance.highlight({
        element: el ? targetSelector : undefined,
        popover: {
          title,
          description: buildDescriptionWithHint(description, actionHint),
          side: 'bottom',
          align: isMobile ? 'center' : 'start',
          showButtons: ['close'],
          doneBtnText: 'Entendido',
        },
      })
    },
    [clearTimer, scheduleCursor, stopTour]
  )

  return { startTour, highlightTarget, stopTour }
}
