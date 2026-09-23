import { useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { useTourStore } from '../model/tour-store'
import { HelpCenterModal } from './help-center-modal'

export function HelpCenterWidget() {
  const toggleHelpCenter = useTourStore((s) => s.toggleHelpCenter)
  const isHelpCenterOpen = useTourStore((s) => s.isHelpCenterOpen)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true'
      if (isInput) return

      if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault()
        toggleHelpCenter()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleHelpCenter])

  return (
    <>
      <aside
        role="region"
        aria-label="Centro de asistencia y tutoriales"
        style={{ zoom: 1 }}
        className="fixed bottom-[4.75rem] right-5 z-40 flex items-center select-none"
      >
        <button
          type="button"
          onClick={toggleHelpCenter}
          aria-expanded={isHelpCenterOpen}
          aria-label="Abrir centro de ayuda y tutoriales guiados"
          title="Centro de Asistencia: Tutoriales y Guías (?)"
          data-testid="help-widget-trigger"
          data-tour="help-center-widget"
          className="relative flex h-11 w-11 items-center justify-center rounded-full
            bg-card/95 text-card-foreground border border-border/80 shadow-md backdrop-blur-md
            transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:shadow-lg
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
        >
          <HelpCircle className="size-5 text-primary" />
        </button>
      </aside>

      <HelpCenterModal />
    </>
  )
}
