import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { useSessionStore } from '@/app/session/session-store'
import { useTourContext } from '../hooks/use-tour-context'
import { useTourStore } from '../model/tour-store'
import { hasApplicationDialog, visibleElement, waitForTarget } from '../utils/tour-target'
import { TourGuidePanel } from './tour-guide-panel'
import { TourSpotlight } from './tour-spotlight'
import { useTourPositioning } from './use-tour-positioning'
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
    let scheduledTimer: ReturnType<typeof setTimeout> | null = null
    let lastRun = 0

    const check = () => {
      frame = 0
      lastRun = Date.now()
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

    const schedule = () => {
      const elapsed = Date.now() - lastRun
      if (elapsed < 120) {
        if (!scheduledTimer) {
          scheduledTimer = setTimeout(() => {
            scheduledTimer = null
            if (!frame) frame = requestAnimationFrame(check)
          }, 120 - elapsed)
        }
        return
      }
      if (!frame) frame = requestAnimationFrame(check)
    }

    const observer = new MutationObserver(schedule)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'aria-hidden', 'data-state'],
    })
    schedule()
    window.addEventListener('resize', schedule)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      if (scheduledTimer) clearTimeout(scheduledTimer)
      window.removeEventListener('resize', schedule)
    }
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

  useEffect(() => {
    if (revision === undefined) return
    const el = panelRef.current
    if (!el) return
    el.classList.add('cima-tour-morphing')
    const timer = setTimeout(() => {
      el.classList.remove('cima-tour-morphing')
    }, 300)
    return () => {
      clearTimeout(timer)
      el.classList.remove('cima-tour-morphing')
    }
  }, [revision])

  const hidden = helpOpen || modalOpen
  useTourPositioning({
    panelRef,
    session,
    target: prepared.revision === session?.revision ? prepared.target : null,
    step,
    hidden,
    compactViewport,
    setCompactViewport,
  })

  if (!session || !step || hidden) return null
  const loading = prepared.revision !== session.revision || prepared.status === 'loading'
  const missing = !loading && prepared.status === 'missing'
  const isQuestion = session.tour.id.startsWith('question:')

  return createPortal(
    <>
      <TourSpotlight
        target={prepared.target}
        status={prepared.status}
        minimized={session.minimized}
        compact={compactViewport}
        revision={session.revision}
      />
      <TourGuidePanel
        panelRef={panelRef}
        session={session}
        step={step}
        loading={loading}
        missing={missing}
        isQuestion={isQuestion}
        compactViewport={compactViewport}
        interaction={interaction}
        revision={revision}
        preparedTarget={prepared.target}
        commands={commands}
      />
    </>,
    document.body,
  )
}
