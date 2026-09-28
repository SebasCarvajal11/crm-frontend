import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { ChevronLeft, ChevronRight, Minimize2, X, LocateFixed, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/app/session/session-store'
import { useTourContext } from '../hooks/use-tour-context'
import { useTourStore } from '../model/tour-store'
import { hasApplicationDialog, visibleElement, waitForTarget } from '../utils/tour-target'
import './tour-popover-theme.css'

type Prepared = { revision: number; target: HTMLElement | null; status: 'loading' | 'ready' | 'missing'; fallback: boolean }
const INITIAL: Prepared = { revision: -1, target: null, status: 'loading', fallback: false }

/** The only owner of navigation, DOM observation, positioning and cancellation. */
export function TourRuntime() {
  const session = useTourStore((state) => state.session)
  const helpOpen = useTourStore((state) => state.isHelpCenterOpen)
  const token = useSessionStore((state) => state.token)
  const email = useSessionStore((state) => state.email)
  const ctx = useTourContext()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const router = useRouter()
  const [prepared, setPrepared] = useState<Prepared>(INITIAL)
  const [modalOpen, setModalOpen] = useState(false)
  const [interaction, setInteraction] = useState<number | null>(null)
  const [compactViewport, setCompactViewport] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const revision = session?.revision
  const step = session?.steps[session.index]
  const commands = useTourStore.getState()

  useEffect(() => {
    useTourStore.getState().setHistoryOwner(token ? email : null)
  }, [token, email])

  useEffect(() => {
    if (!session) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !event.isComposing && !hasApplicationDialog()) {
        useTourStore.getState().stop()
      }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [session])

  useEffect(() => {
    if (session && (!token || pathname !== '/dashboard' || session.role !== ctx.role)) {
      useTourStore.getState().stop()
    }
  }, [token, pathname, ctx.role, session])

  useEffect(() => {
    if (revision === undefined) return
    const active = useTourStore.getState().session
    if (!active) return
    const controller = new AbortController()
    const { signal } = controller
    const current = active.steps[active.index]
    const cancelled = () => signal.aborted || useTourStore.getState().session?.revision !== revision
    const prepare = async () => {
      if (cancelled()) return
      setPrepared({ ...INITIAL, revision })
      setInteraction(null)
      const expectedTab = current.navigateTab ?? active.tour.tab
      const search = router.state.location.search as Record<string, unknown>
      if (search.tab !== expectedTab || (current.scope === 'kanban' && search.project_id)) {
        await navigate({
          to: '/dashboard',
          search: (previous) => ({ ...previous, tab: expectedTab,
            project_id: current.scope === 'kanban' || expectedTab !== 'collab' ? undefined : previous.project_id,
            workspace_tab: current.scope === 'kanban' || expectedTab !== 'collab' ? undefined : previous.workspace_tab }),
          replace: true,
        })
      }
      if (cancelled()) return
      // Only explicitly declared, read-only navigation is automated. Never create or submit data.
      if (current.scope === 'workspace' && !router.state.location.search.project_id) {
        const card = await waitForTarget('[data-tour="collab-card-first"]', signal)
        if (cancelled()) return
        if (card && !hasApplicationDialog()) {
          card.click()
          await waitForTarget('[data-tour="workspace-project-header"]', signal)
        }
      }
      if (cancelled()) return
      if (current.switchWorkspaceTab && router.state.location.search.project_id) {
        await navigate({ to: '/dashboard', search: (previous) => ({
          ...previous, workspace_tab: current.switchWorkspaceTab,
        }), replace: true })
      }
      if (cancelled()) return
      if (current.switchMarketingTab) {
        const tab = await waitForTarget(`[data-tour="marketing-tab-${current.switchMarketingTab}"]`, signal)
        if (cancelled()) return
        if (tab?.getAttribute('aria-pressed') !== 'true' && !hasApplicationDialog()) tab?.click()
      }
      if (current.sidebar && !visibleElement(current.element)) {
        visibleElement('[data-tour="mobile-navigation-trigger"]')?.click()
      }
      if (cancelled()) return
      const target = await waitForTarget(current.element, signal)
      if (cancelled()) return
      const fallback = !target && !!current.fallbackElement
      const resolved = target ?? (current.fallbackElement ? visibleElement(current.fallbackElement) : null)
      // Respect existing input focus and application dialogs, including the virtual keyboard.
      if (resolved && !hasApplicationDialog() && !document.activeElement?.matches('input, textarea, [contenteditable="true"]')) {
        resolved.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
      }
      setPrepared({ revision, target: resolved, status: target ? 'ready' : 'missing', fallback })
      if (target) useTourStore.getState().visit(revision)
    }
    // Deferring also makes teardown safe under StrictMode's setup/cleanup replay.
    void Promise.resolve().then(prepare).catch((error: unknown) => {
      if (!cancelled()) {
        console.warn('tour:preparation-failed', { tourId: active.tour.id, stepIndex: active.index, error })
        setPrepared({ revision, target: null, status: 'missing', fallback: false })
      }
    })
    return () => controller.abort()
  }, [revision, navigate, router])

  useEffect(() => {
    if (revision === undefined || !step) return
    let frame = 0
    const check = () => {
      frame = 0
      setModalOpen(hasApplicationDialog())
      const primary = visibleElement(step.element)
      if (primary) useTourStore.getState().visit(revision)
      setPrepared((previous) => {
        if (previous.revision !== revision || previous.status === 'loading') return previous
        const target = primary
        const fallback = target ? false : !!step.fallbackElement
        const resolved = target ?? (step.fallbackElement ? visibleElement(step.fallbackElement) : null)
        const status = target ? 'ready' : 'missing'
        return previous.target === resolved && previous.status === status && previous.fallback === fallback
          ? previous : { revision, target: resolved, status, fallback }
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden', 'aria-hidden', 'data-state'] })
    schedule()
    window.addEventListener('resize', schedule)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', schedule) }
  }, [revision, step])

  useEffect(() => {
    if (!step || !prepared.target || revision === undefined) return
    const target = prepared.target
    const interacted = () => setInteraction(revision)
    // Observe real interactions without intercepting, submitting, focusing or advancing.
    target.addEventListener('click', interacted)
    target.addEventListener('input', interacted)
    target.addEventListener('change', interacted)
    return () => {
      target.removeEventListener('click', interacted)
      target.removeEventListener('input', interacted)
      target.removeEventListener('change', interacted)
    }
  }, [prepared.target, revision, step])

  const hidden = helpOpen || modalOpen
  useEffect(() => {
    const panel = panelRef.current
    const highlight = highlightRef.current
    if (!panel || !session || hidden) return
    const target = prepared.revision === session.revision ? prepared.target : null
    let disposed = false
    const update = () => {
      const viewport = window.visualViewport
      const top = viewport?.offsetTop ?? 0
      const left = viewport?.offsetLeft ?? 0
      const width = viewport?.width ?? window.innerWidth
      const height = viewport?.height ?? window.innerHeight
      const docked = width < 768
      const compact = docked && height < 340
      setCompactViewport(compact)
      panel.style.maxHeight = `${Math.max(44, docked && !session.minimized && !compact ? Math.min(height - 24, height * 0.42) : height - 24)}px`
      panel.style.width = `${Math.min(360, width - 24)}px`
      document.body.classList.toggle('cima-tour-docked', docked && !session.minimized)
      document.body.style.setProperty('--tour-guide-reserve', `${panel.offsetHeight + 24}px`)
      const rect = target?.getBoundingClientRect()
      if (highlight && rect) {
        const x = Math.max(left + 2, rect.left - 3)
        const y = Math.max(top + 2, rect.top - 3)
        highlight.style.left = `${x}px`
        highlight.style.top = `${y}px`
        highlight.style.width = `${Math.max(0, Math.min(rect.right + 3, left + width - 2) - x)}px`
        highlight.style.height = `${Math.max(0, Math.min(rect.bottom + 3, top + height - 2) - y)}px`
      }
      if (width < 768 || !target || session.minimized) {
        panel.style.left = `${left + width - Math.min(360, width - 24) - 12}px`
        // A stable bottom dock keeps application navigation free. The dashboard reserves its height.
        let ancestor = target
        let viewportPinned = false
        while (ancestor && docked) {
          if (getComputedStyle(ancestor).position === 'fixed') { viewportPinned = true; break }
          ancestor = ancestor.parentElement
        }
        const topDock = viewportPinned && rect && rect.top > top + height / 2 && !session.minimized
        panel.style.top = `${topDock ? top + 12 : top + height - panel.offsetHeight - 12}px`
        return
      }
      void computePosition(target, panel, {
        strategy: 'fixed', placement: step?.side ?? 'bottom',
        middleware: [offset(16), flip({ padding: 12 }), shift({ padding: 12, crossAxis: true })],
      }).then(({ x, y }) => {
        if (disposed) return
        panel.style.left = `${x}px`
        panel.style.top = `${y}px`
      })
    }
    const cleanup = target ? autoUpdate(target, panel, update) : (() => {
      const observer = new ResizeObserver(update)
      observer.observe(panel)
      update()
      return () => observer.disconnect()
    })()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      disposed = true; cleanup()
      document.body.classList.remove('cima-tour-docked')
      document.body.style.removeProperty('--tour-guide-reserve')
      window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [session, prepared, hidden, step?.side, compactViewport])

  if (!session || !step || hidden) return null
  const loading = prepared.revision !== session.revision || prepared.status === 'loading'
  const missing = !loading && prepared.status === 'missing'
  const last = session.index === session.steps.length - 1
  const isQuestion = session.tour.id.startsWith('question:')
  return createPortal(
    <>
      {!session.minimized && !compactViewport && prepared.target && !loading &&
        <div ref={highlightRef} className="cima-tour-highlight" aria-hidden="true" />}
      <aside ref={panelRef} className="cima-tour-guide" aria-label="Tutorial guiado" data-testid="tour-guide" aria-busy={loading}>
        <header className="cima-tour-guide-header">
          <span className="text-xs font-semibold text-primary">{isQuestion ? 'Ayuda contextual' : `Paso ${session.index + 1} de ${session.steps.length}`}</span>
          <div className="flex shrink-0">
            <button type="button" className="cima-tour-icon" aria-label="Mostrar elemento" disabled={loading || !prepared.target} onClick={() => prepared.target?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })}><LocateFixed className="size-4" /></button>
            <button type="button" className="cima-tour-icon" aria-label="Abrir centro de ayuda" onClick={commands.openHelpCenter}><HelpCircle className="size-4" /></button>
            {!compactViewport && <button type="button" className="cima-tour-icon" aria-label={session.minimized ? 'Expandir tutorial' : 'Minimizar tutorial'} onClick={() => commands.minimize(!session.minimized)}><Minimize2 className="size-4" /></button>}
            <button type="button" className="cima-tour-icon" aria-label="Cerrar tutorial" onClick={commands.stop}><X className="size-4" /></button>
          </div>
        </header>
        {compactViewport && <span className="sr-only" role="status">Amplía la ventana o cierra el teclado para consultar el paso completo.</span>}
        {!session.minimized && !compactViewport && <>
          <div className="cima-tour-guide-body">
            <h2 className="text-base font-bold leading-snug" aria-live="polite">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            {step.actionHint && <p className="mt-3 rounded-lg bg-primary/5 p-3 text-sm leading-relaxed">{step.actionHint}</p>}
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">
              {loading ? 'Buscando el elemento…' : missing
                ? (step.emptyStateDescription ?? 'Este elemento no está disponible en la vista actual. Puedes volver al paso, omitirlo o continuar trabajando.')
                : interaction === revision ? 'Interacción detectada. Continúa cuando estés listo.'
                : 'Puedes interactuar con la aplicación. Avanza cuando estés listo.'}
            </p>
            {missing && <Button variant="outline" size="sm" className="mt-3" onClick={commands.retry}><LocateFixed className="size-4" /> Volver al paso</Button>}
          </div>
          <footer className="cima-tour-guide-footer">
            <Button variant="outline" size="sm" className="min-h-11" disabled={session.index === 0 || loading} onClick={() => commands.move(session.index - 1)}><ChevronLeft className="size-4" />Anterior</Button>
            <Button size="sm" className="min-h-11" disabled={loading} onClick={() => last ? commands.finish() : commands.move(session.index + 1)}>
              {last ? (isQuestion ? 'Entendido' : 'Finalizar') : missing ? 'Omitir paso' : 'Siguiente'}{!last && <ChevronRight className="size-4" />}
            </Button>
          </footer>
          {!isQuestion && last && session.visited.length < session.steps.length &&
            <p className="px-4 pb-3 text-xs text-muted-foreground">Hay pasos pendientes. Finalizar cerrará la guía sin marcarla como completada.</p>}
        </>}
      </aside>
    </>,
    document.body,
  )
}
