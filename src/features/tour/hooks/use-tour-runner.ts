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
import { startModalSupervisor, stopModalSupervisor } from '../utils/modal-supervisor'
import { switchTabIfNeeded, handleActionTransition } from '../utils/action-transition'
import {
  autoFocusTargetInput,
  attachInteractiveStep,
} from '../utils/step-interaction-helper'
import { bindMinimapClicks } from '../utils/minimap-helper'
import {
  startViewportSupervisor,
  stopViewportSupervisor,
} from '../utils/viewport-supervisor'
import '../ui/tour-popover-theme.css'

function isTabAlreadySelected(tabName?: string): boolean {
  if (!tabName || typeof document === 'undefined') return false
  const btn = document.querySelector<HTMLElement>(`[data-tour="workspace-tab-${tabName}"]`)
  if (!btn) return false
  return (
    btn.getAttribute('aria-selected') === 'true' ||
    btn.getAttribute('aria-pressed') === 'true' ||
    btn.getAttribute('data-state') === 'active' ||
    btn.classList.contains('active')
  )
}

export function useTourRunner() {
  const driverRef = useRef<Driver | null>(null)
  const navigate = useNavigate()
  const ctx = useTourContext()
  const markTourCompleted = useTourStore((s) => s.markTourCompleted)
  const setActiveTour = useTourStore((s) => s.setActiveTour)
  const pauseTour = useTourStore((s) => s.pauseTour)
  const resumeTour = useTourStore((s) => s.resumeTour)
  const isTransitioningRef = useRef(false)
  const cleanupListenerRef = useRef<(() => void) | null>(null)

  const stopTour = useCallback(() => {
    stopScrollSupervisor()
    stopModalSupervisor()
    stopViewportSupervisor()
    if (cleanupListenerRef.current) {
      cleanupListenerRef.current()
      cleanupListenerRef.current = null
    }
    isTransitioningRef.current = false
    resetHorizontalScroll()
    if (driverRef.current) {
      driverRef.current.destroy()
      driverRef.current = null
    }
    resumeTour()
    setActiveTour(null)
  }, [resumeTour, setActiveTour])

  const startTour = useCallback(
    async (tour: CimaTourDefinition) => {
      stopTour()
      useTourStore.getState().closeHelpCenter()
      setActiveTour(tour.id)

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
      const filtered = tour.steps.filter((st) => !st.requiredRole || st.requiredRole.includes(ctx.role))
      const totalSteps = filtered.length
      const steps: DriveStep[] = filtered.map((st, i) => mapTourStepToDriveStep(st, isMobile, i, totalSteps))

      const initialTab = filtered[0]?.switchWorkspaceTab ?? filtered[0]?.switchMarketingTab
      if (initialTab) switchTabIfNeeded(initialTab)
      if (filtered[0]?.element) {
        await waitForElement(filtered[0].element, 1000, filtered[0].fallbackElement)
      }

      startModalSupervisor({
        onModalOpen: () => pauseTour('modal'),
        onModalClose: () => {
          resumeTour()
          driverRef.current?.refresh()
        },
      })

      startViewportSupervisor(() => {
        driverRef.current?.refresh()
      })

      const instance = driver({
        animate: false,
        smoothScroll: false,
        duration: 0,
        allowClose: true,
        waitForElement: 1200,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 3 : 5,
        stageRadius: 8,
        popoverClass: 'cima-tour-popover',
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        steps,
        onPopoverRender: (popover) => {
          bindMinimapClicks(popover.wrapper, (targetIdx) => {
            if (isTransitioningRef.current || !instance.isActive()) return
            const currentIdx = instance.getActiveIndex() ?? 0
            if (targetIdx === currentIdx) return
            const targetStep = filtered[targetIdx]
            const tab = targetStep?.switchWorkspaceTab ?? targetStep?.switchMarketingTab
            if (tab) switchTabIfNeeded(tab)
            instance.moveTo(targetIdx)
          })
        },
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
          if (nextTab) switchTabIfNeeded(nextTab)

          if (nextStep?.element) {
            const targetEl = await waitForElement(nextStep.element, 1200, nextStep.fallbackElement)
            if (targetEl) centerElementInScrollParents(targetEl)
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
          if (prevTab) switchTabIfNeeded(prevTab)

          if (prevStep?.element) {
            const targetEl = await waitForElement(prevStep.element, 1200, prevStep.fallbackElement)
            if (targetEl) centerElementInScrollParents(targetEl)
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
          if (!element) return
          centerElementInScrollParents(element)
          opts.driver.refresh()
          const idx = opts.driver.getActiveIndex() ?? 0
          const currentStep = filtered[idx]
          if (!currentStep) return

          if (currentStep.targetPulse) {
            element.classList.add('cima-tour-target-pulse')
            setTimeout(() => element.classList.remove('cima-tour-target-pulse'), 1800)
          }

          if (currentStep.interactiveAction === 'input') {
            autoFocusTargetInput(element)
          }

          // Omisión predictiva si la pestaña ya está activa
          if (
            currentStep.interactiveAction === 'tab-change' &&
            isTabAlreadySelected(currentStep.switchWorkspaceTab) &&
            opts.driver.hasNextStep()
          ) {
            setTimeout(() => {
              if (opts.driver.isActive() && opts.driver.getActiveIndex() === idx) {
                opts.driver.moveNext()
              }
            }, 80)
            return
          }

          if (cleanupListenerRef.current) cleanupListenerRef.current()
          cleanupListenerRef.current = attachInteractiveStep({
            element,
            step: currentStep,
            stepIdx: idx,
            getActiveIndex: () => driverRef.current?.getActiveIndex(),
            isTourActive: () => Boolean(driverRef.current?.isActive()),
            onAdvance: () => opts.driver.moveNext(),
            onProjectTransition: async () => {
              isTransitioningRef.current = true
              try {
                await waitForElement('[data-tour="workspace-project-header"]', 2500)
              } finally {
                isTransitioningRef.current = false
              }
            },
          })
        },
        onDestroyed: () => {
          stopTour()
          markTourCompleted(tour.id)
        },
      })

      driverRef.current = instance
      startScrollSupervisor(instance)
      instance.drive()
    },
    [ctx.role, markTourCompleted, navigate, pauseTour, resumeTour, setActiveTour, stopTour]
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
        animate: false,
        smoothScroll: false,
        duration: 0,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: isMobile ? 3 : 5,
        stageRadius: 8,
        popoverClass: 'cima-tour-popover',
        onDestroyed: () => {
          stopTour()
        },
      })

      driverRef.current = instance
      startScrollSupervisor(instance)
      instance.highlight({
        element: el ? (el as HTMLElement) : undefined,
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
    [navigate, stopTour]
  )

  return { startTour, highlightTarget, stopTour }
}
