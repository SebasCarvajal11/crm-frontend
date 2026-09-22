import { useCallback, useRef } from 'react'
import { driver, type Driver, type DriveStep } from 'driver.js'
import { useTourStore } from '../model/tour-store'
import type { CimaTourDefinition } from '../model/types'
import { waitForElement } from '../utils/dom-target-finder'
import '../ui/tour-popover-theme.css'

export function useTourRunner() {
  const driverRef = useRef<Driver | null>(null)
  const markTourCompleted = useTourStore((s) => s.markTourCompleted)
  const setActiveTour = useTourStore((s) => s.setActiveTour)

  const stopTour = useCallback(() => {
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

      const steps: DriveStep[] = tour.steps.map((st) => ({
        element: st.element,
        popover: {
          title: st.title,
          description: st.description,
          side: st.side ?? 'bottom',
          align: st.align ?? 'start',
          showButtons: ['next', 'previous', 'close'],
          nextBtnText: 'Siguiente',
          prevBtnText: 'Anterior',
          doneBtnText: 'Entendido',
          onPopoverRender: (popover) => {
            if (st.actionHint) {
              const existing = popover.wrapper.querySelector('.cima-tour-action-hint')
              if (!existing) {
                const hintEl = document.createElement('div')
                hintEl.className = 'cima-tour-action-hint'
                hintEl.innerHTML = `<span>👉</span> <span>${st.actionHint}</span>`
                popover.description.insertAdjacentElement('afterend', hintEl)
              }
            }
          },
        },
      }))

      // Asegurar que el primer elemento exista antes de inicializar
      if (tour.steps[0]?.element) {
        await waitForElement(tour.steps[0].element, 1000)
      }

      const instance = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        steps,
        onDestroyed: () => {
          markTourCompleted(tour.id)
          setActiveTour(null)
          driverRef.current = null
        },
      })

      driverRef.current = instance
      instance.drive()
    },
    [markTourCompleted, setActiveTour, stopTour]
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

      const instance = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayColor: '#000000',
        overlayOpacity: 0.65,
        stagePadding: 8,
        stageRadius: 10,
        popoverClass: 'cima-tour-popover',
        onDestroyed: () => {
          driverRef.current = null
        },
      })

      driverRef.current = instance
      instance.highlight({
        element: el ? targetSelector : undefined,
        popover: {
          title,
          description,
          side: 'bottom',
          align: 'start',
          showButtons: ['close'],
          doneBtnText: 'Entendido',
          onPopoverRender: (popover) => {
            if (actionHint) {
              const hintEl = document.createElement('div')
              hintEl.className = 'cima-tour-action-hint'
              hintEl.innerHTML = `<span>👉</span> <span>${actionHint}</span>`
              popover.description.insertAdjacentElement('afterend', hintEl)
            }
          },
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
