import { useCallback, useRef } from 'react'
import { driver, type Driver, type DriveStep } from 'driver.js'
import { useNavigate } from '@tanstack/react-router'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from './use-tour-context'
import type { CimaTourDefinition } from '../model/types'
import { waitForElement } from '../utils/dom-target-finder'
import {
  resetHorizontalScroll,
  centerElementInScrollParents,
  scrollTargetIntoView,
  startScrollSupervisor,
  stopScrollSupervisor,
} from '../utils/scroll-helper'
import {
  mapTourStepToDriveStep,
  buildDescriptionWithHint,
} from '../utils/popover-helper'
import '../ui/tour-popover-theme.css'

function switchTabIfNeeded(targetTab?: string): void {
  if (!targetTab || typeof document === 'undefined') return
  const btn = document.querySelector<HTMLButtonElement>(`[data-tour="workspace-tab-${targetTab}"]`)
  if (btn) {
    const isSelected =
      btn.getAttribute('aria-selected') === 'true' ||
      btn.getAttribute('aria-pressed') === 'true'
    if (!isSelected) btn.click()
    centerElementInScrollParents(btn)
  }
}

async function handleActionTransition(
  action?: 'openProject' | 'closeProject',
  navigateFn?: (opts: { to: string; search: (prev: Record<string, unknown>) => Record<string, unknown>; replace: boolean }) => void
): Promise<void> {
  if (action === 'openProject') {
    const cardEl = document.querySelector<HTMLElement>('[data-tour="collab-card-first"]')
    if (cardEl) {
      const clickTarget = cardEl.querySelector<HTMLElement>('button') ?? cardEl
      clickTarget.click()
      await waitForElement('[data-tour="workspace-project-header"]', 2000)
    }
  } else if (action === 'closeProject') {
    const backBtn = document.querySelector<HTMLElement>('[data-tour="workspace-back-btn"]')
    if (backBtn) {
      const clickTarget = backBtn.querySelector<HTMLElement>('button') ?? backBtn
      clickTarget.click()
    } else if (navigateFn) {
      navigateFn({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: 'collab',
          project_id: undefined,
          workspace_tab: undefined,
        }),
        replace: true,
      })
    }
    await waitForElement('[data-tour="collab-columns-container"]', 2000)
  }
}

export function useTourRunner() {
  const driverRef = useRef<Driver | null>(null)
  const navigate = useNavigate()
  const ctx = useTourContext()
  const markTourCompleted = useTourStore((s) => s.markTourCompleted)
  const setActiveTour = useTourStore((s) => s.setActiveTour)
  const isTransitioningRef = useRef(false)

  const stopTour = useCallback(() => {
    stopScrollSupervisor()
    isTransitioningRef.current = false
    resetHorizontalScroll()
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
      const filtered = tour.steps.filter((st) => !st.requiredRole || st.requiredRole.includes(ctx.role))
      const steps: DriveStep[] = filtered.map((st) => mapTourStepToDriveStep(st, isMobile))

      const initialTab = filtered[0]?.switchWorkspaceTab ?? filtered[0]?.switchMarketingTab
      if (initialTab) switchTabIfNeeded(initialTab)
      if (filtered[0]?.element) {
        await waitForElement(filtered[0].element, 1000, filtered[0].fallbackElement)
      }

      const instance = driver({
        animate: true,
        smoothScroll: false,
        duration: 200,
        allowClose: true,
        waitForElement: 1200,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 4 : 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        showProgress: true,
        progressText: 'CIMA Smart Copilot · Paso {{current}} de {{total}}',
        steps,
        onNextClick: async (_element, _step, opts) => {
          if (isTransitioningRef.current) return
          const currentIdx = opts.driver.getActiveIndex() ?? 0
          const currentStep = filtered[currentIdx]
          const nextIdx = currentIdx + 1
          const nextStep = filtered[nextIdx]

          if (currentStep?.onNextAction) {
            isTransitioningRef.current = true
            try {
              await handleActionTransition(currentStep.onNextAction, navigate)
            } finally {
              isTransitioningRef.current = false
            }
          }

          const nextTab = nextStep?.switchWorkspaceTab ?? nextStep?.switchMarketingTab
          if (nextTab) {
            switchTabIfNeeded(nextTab)
          }

          if (nextStep?.element) {
            await waitForElement(nextStep.element, 1200, nextStep.fallbackElement)
          }

          opts.driver.moveNext()
        },
        onPrevClick: async (_element, _step, opts) => {
          if (isTransitioningRef.current) return
          const currentIdx = opts.driver.getActiveIndex() ?? 0
          const prevIdx = currentIdx - 1
          const prevStep = filtered[prevIdx]

          if (prevStep?.element === '[data-tour="collab-card-first"]') {
            isTransitioningRef.current = true
            try {
              await handleActionTransition('closeProject', navigate)
            } finally {
              isTransitioningRef.current = false
            }
          }

          const prevTab = prevStep?.switchWorkspaceTab ?? prevStep?.switchMarketingTab
          if (prevTab) {
            switchTabIfNeeded(prevTab)
          }

          if (prevStep?.element) {
            await waitForElement(prevStep.element, 1200, prevStep.fallbackElement)
          }

          opts.driver.movePrevious()
        },
        onHighlightStarted: (el, _step, opts) => {
          resetHorizontalScroll()
          const activeIdx = opts?.state?.activeIndex ?? opts?.index ?? 0
          const targetTab = filtered[activeIdx]?.switchWorkspaceTab ?? filtered[activeIdx]?.switchMarketingTab
          if (targetTab) switchTabIfNeeded(targetTab)
          if (el) centerElementInScrollParents(el)
        },
        onHighlighted: (element, _step, opts) => {
          resetHorizontalScroll()
          if (element) centerElementInScrollParents(element)
          const idx = opts.driver.getActiveIndex() ?? 0
          if (filtered[idx]?.onNextAction === 'openProject' && element) {
            const clickTarget = element.querySelector<HTMLElement>('button') ?? element
            clickTarget.addEventListener('click', async () => {
              if (isTransitioningRef.current) return
              await waitForElement('[data-tour="workspace-project-header"]', 2500)
              if (driverRef.current?.isActive() && driverRef.current.getActiveIndex() === idx) {
                driverRef.current.moveNext()
              }
            }, { once: true })
          }
        },
        onDestroyed: () => {
          stopScrollSupervisor()
          markTourCompleted(tour.id)
          setActiveTour(null)
          driverRef.current = null
        },
      })

      driverRef.current = instance
      startScrollSupervisor(instance)
      instance.drive()
    },
    [ctx.role, markTourCompleted, navigate, setActiveTour, stopTour]
  )

  const highlightTarget = useCallback(
    async (
      targetSelector: string,
      title: string,
      description: string,
      actionHint?: string,
      targetTab?: string,
      fallbackSelector?: string
    ) => {
      stopTour()
      useTourStore.getState().closeHelpCenter()

      if (targetSelector.startsWith('[data-tour="workspace-') && !document.querySelector(targetSelector)) {
        await handleActionTransition('openProject', navigate)
      } else if (targetSelector.startsWith('[data-tour="collab-') && !document.querySelector(targetSelector)) {
        await handleActionTransition('closeProject', navigate)
      }

      if (targetTab) switchTabIfNeeded(targetTab)
      const el = await waitForElement(targetSelector, 1500, fallbackSelector)
      if (el) await scrollTargetIntoView(el, 50)
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

      const instance = driver({
        animate: true,
        smoothScroll: false,
        duration: 200,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 6 : 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        onDestroyed: () => {
          stopScrollSupervisor()
          driverRef.current = null
        },
      })

      driverRef.current = instance
      startScrollSupervisor(instance)
      instance.highlight({
        element: el ? (el as HTMLElement) : undefined,
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
    [navigate, stopTour]
  )

  return { startTour, highlightTarget, stopTour }
}
