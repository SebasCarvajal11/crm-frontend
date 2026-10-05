import type { RefObject } from 'react'
import { ChevronLeft, ChevronRight, HelpCircle, LocateFixed, Minimize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CimaTourStep } from '../model/types'
import type { TourSession } from '../model/tour-session'
import type { useTourStore } from '../model/tour-store'

type TourGuidePanelProps = {
  panelRef: RefObject<HTMLElement | null>
  session: TourSession
  step: CimaTourStep
  loading: boolean
  missing: boolean
  isQuestion: boolean
  compactViewport: boolean
  interaction: number | null
  revision: number | undefined
  preparedTarget: HTMLElement | null
  commands: ReturnType<typeof useTourStore.getState>
}

export function TourGuidePanel({
  panelRef,
  session,
  step,
  loading,
  missing,
  isQuestion,
  compactViewport,
  interaction,
  revision,
  preparedTarget,
  commands,
}: TourGuidePanelProps) {
  const last = session.index === session.steps.length - 1

  return (
    <aside
      ref={panelRef}
      className="cima-tour-guide"
      aria-label="Tutorial guiado"
      data-testid="tour-guide"
      aria-busy={loading}
    >
      <header className="cima-tour-guide-header">
        <span className="text-xs font-semibold text-primary">
          {isQuestion ? 'Ayuda contextual' : `Paso ${session.index + 1} de ${session.steps.length}`}
        </span>
        <div className="flex shrink-0">
          <button
            type="button"
            className="cima-tour-icon"
            aria-label="Mostrar elemento"
            disabled={loading || !preparedTarget}
            onClick={() => preparedTarget?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })}
          >
            <LocateFixed className="size-4" />
          </button>
          <button
            type="button"
            className="cima-tour-icon"
            aria-label="Abrir centro de ayuda"
            onClick={commands.openHelpCenter}
          >
            <HelpCircle className="size-4" />
          </button>
          {!compactViewport && (
            <button
              type="button"
              className="cima-tour-icon"
              aria-label={session.minimized ? 'Expandir tutorial' : 'Minimizar tutorial'}
              onClick={() => commands.minimize(!session.minimized)}
            >
              <Minimize2 className="size-4" />
            </button>
          )}
          <button type="button" className="cima-tour-icon" aria-label="Cerrar tutorial" onClick={commands.stop}>
            <X className="size-4" />
          </button>
        </div>
      </header>
      {compactViewport && (
        <span className="sr-only" role="status">
          Amplía la ventana o cierra el teclado para consultar el paso completo.
        </span>
      )}
      {!session.minimized && !compactViewport && (
        <>
          <div className="cima-tour-guide-body">
            <h2 className="text-base font-bold leading-snug" aria-live="polite">
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            {step.actionHint && (
              <p className="mt-3 rounded-lg bg-primary/5 p-3 text-sm leading-relaxed">{step.actionHint}</p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">
              {loading
                ? 'Buscando el elemento…'
                : missing
                  ? step.emptyStateDescription ??
                    'Este elemento no está disponible en la vista actual. Puedes volver al paso, omitirlo o continuar trabajando.'
                  : interaction === revision
                    ? 'Interacción detectada. Continúa cuando estés listo.'
                    : 'Puedes interactuar con la aplicación. Avanza cuando estés listo.'}
            </p>
            {missing && (
              <Button variant="outline" size="sm" className="mt-3" onClick={commands.retry}>
                <LocateFixed className="size-4" /> Volver al paso
              </Button>
            )}
          </div>
          <footer className="cima-tour-guide-footer">
            <Button
              variant="outline"
              size="sm"
              className="min-h-11"
              disabled={session.index === 0 || loading}
              onClick={() => commands.move(session.index - 1)}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              size="sm"
              className="min-h-11"
              disabled={loading}
              onClick={() => (last ? commands.finish() : commands.move(session.index + 1))}
            >
              {last ? (isQuestion ? 'Entendido' : 'Finalizar') : missing ? 'Omitir paso' : 'Siguiente'}
              {!last && <ChevronRight className="size-4" />}
            </Button>
          </footer>
          {!isQuestion && last && session.visited.length < session.steps.length && (
            <p className="px-4 pb-3 text-xs text-muted-foreground">
              Hay pasos pendientes. Finalizar cerrará la guía sin marcarla como completada.
            </p>
          )}
        </>
      )}
    </aside>
  )
}
