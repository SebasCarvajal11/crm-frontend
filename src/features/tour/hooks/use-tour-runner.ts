import { useCallback, useRef } from 'react'
import { driver, type Driver, type DriveStep } from 'driver.js'
import { useNavigate } from '@tanstack/react-router'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from './use-tour-context'
import type { CimaTourDefinition, CimaTourStep } from '../model/types'
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
import '../ui/tour-popover-theme.css'

export function useTourRunner() {
  const driverRef = useRef<Driver | null>(null)
  const navigate = useNavigate()
  const ctx = useTourContext()
  const markTourCompleted = useTourStore((s) => s.markTourCompleted)
  const setActiveTour = useTourStore((s) => s.setActiveTour)
  const pauseTour = useTourStore((s) => s.pauseTour)
  const resumeTour = useTourStore((s) => s.resumeTour)
  const isTransitioningRef = useRef(false)
  const activeListenerCleanupRef = useRef<(() => void) | null>(null)

  const stopTour = useCallback(() => {
    stopScrollSupervisor()
    stopModalSupervisor()
    if (activeListenerCleanupRef.current) {
      activeListenerCleanupRef.current()
      activeListenerCleanupRef.current = null
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

  const attachStepInteraction = useCallback(
    (element: Element, step: CimaTourStep, stepIdx: number) => {
      if (activeListenerCleanupRef.current) {
        activeListenerCleanupRef.current()
        activeListenerCleanupRef.current = null
      }

      const shouldListen =
        step.interactiveAction && step.interactiveAction !== 'none' ||
        step.onNextAction === 'openProject'

      if (!shouldListen) return

      const clickTarget =
        element.querySelector<HTMLElement>('button, a, [role="button"], [role="tab"]') ??
        (element as HTMLElement)

      const handleUserAction = async () => {
        if (isTransitioningRef.current) return
        const inst = driverRef.current
        if (!inst || !inst.isActive() || inst.getActiveIndex() !== stepIdx) return

        if (step.onNextAction === 'openProject') {
          isTransitioningRef.current = true
          await waitForElement('[data-tour="workspace-project-header"]', 2500)
          isTransitioningRef.current = false
        }

        if (step.autoAdvanceOnAction !== false) {
          setTimeout(() => {
            if (inst.isActive() && inst.getActiveIndex() === stepIdx) {
              inst.moveNext()
            }
          }, 150)
        }
      }

      clickTarget.addEventListener('click', handleUserAction, { capture: true })
      activeListenerCleanupRef.current = () => {
        clickTarget.removeEventListener('click', handleUserAction, true)
      }
    },
    []
  )

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

      startModalSupervisor({
        onModalOpen: () => pauseTour('modal'),
        onModalClose: () => {
          resumeTour()
          driverRef.current?.refresh()
        },
      })

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
          if (nextTab) switchTabIfNeeded(nextTab)

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
          if (prevTab) switchTabIfNeeded(prevTab)

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
          if (element) {
            centerElementInScrollParents(element)
            const idx = opts.driver.getActiveIndex() ?? 0
            const currentStep = filtered[idx]
            if (currentStep) {
              attachStepInteraction(element, currentStep, idx)
            }
          }
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
    [attachStepInteraction, ctx.role, markTourCompleted, navigate, pauseTour, resumeTour, setActiveTour, stopTour]
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
