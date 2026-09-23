import { useEffect, useMemo } from 'react'
import { HelpCircle } from 'lucide-react'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from '../hooks/use-tour-context'
import { getMissionsForContext } from '../registry'
import { HelpCenterModal } from './help-center-modal'

export function HelpCenterWidget() {
  const toggleHelpCenter = useTourStore((s) => s.toggleHelpCenter)
  const focusHelpCenterWithQuery = useTourStore((s) => s.focusHelpCenterWithQuery)
  const isHelpCenterOpen = useTourStore((s) => s.isHelpCenterOpen)
  const isTourCompleted = useTourStore((s) => s.isTourCompleted)

  const ctx = useTourContext()
  const missions = useMemo(() => getMissionsForContext(ctx), [ctx])
  const hasIncompleteMissions = useMemo(
    () => missions.some((m) => !isTourCompleted(m.id)),
    [missions, isTourCompleted]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true'
      if (isInput) return

      const isSearchShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'
      const isHelpShortcut = e.key === '?' || ((e.ctrlKey || e.metaKey) && e.key === '/')

      if (isSearchShortcut) {
        e.preventDefault()
        focusHelpCenterWithQuery('')
        return
      }

      if (isHelpShortcut) {
        e.preventDefault()
        toggleHelpCenter()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleHelpCenter, focusHelpCenterWithQuery])

  return (
    <>
      <aside
        role="region"
        aria-label="CIMA Smart Copilot: Asistencia y Tutoriales"
        style={{ zoom: 1 }}
        className="fixed bottom-[4.75rem] right-5 z-40 flex items-center select-none"
      >
        <button
          type="button"
          onClick={toggleHelpCenter}
          aria-expanded={isHelpCenterOpen}
          aria-label="Abrir CIMA Smart Copilot y tutoriales guiados (Ctrl+K o ?)"
          title="CIMA Smart Copilot: Guías y Búsqueda (Ctrl+K o ?)"
          data-testid="help-widget-trigger"
          data-tour="help-center-widget"
          className="relative flex h-11 w-11 items-center justify-center rounded-full
            bg-card/95 text-card-foreground border border-border/80 shadow-md backdrop-blur-md
            transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:shadow-lg
            focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
        >
          <HelpCircle className="size-5 text-primary" />
          {hasIncompleteMissions && (
            <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
          )}
        </button>
      </aside>

      <HelpCenterModal />
    </>
  )
}
