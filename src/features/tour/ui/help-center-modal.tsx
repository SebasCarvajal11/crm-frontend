import { useState } from 'react'
import { Search, RotateCcw, Play, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from '../hooks/use-tour-context'
import { useTourRunner } from '../hooks/use-tour-runner'
import { getMissionsForContext, searchMissions, searchQuestions, ALL_TOURS } from '../registry'
import { HelpCenterQuestionItem } from './help-center-question-item'

const TAB_LABEL: Record<string, string> = {
  overview: 'Resumen', collab: 'Colaboración', marketing: 'Marketing', analytics: 'Analítica',
  admin: 'Administración', account: 'Mi cuenta', notifications: 'Notificaciones',
}

function HelpContent() {
  const ctx = useTourContext()
  const initialQuery = useTourStore((state) => state.initialSearchQuery)
  const completed = useTourStore((state) => state.completedTourIds)
  const reset = useTourStore((state) => state.resetAllTours)
  const { startTour, highlightQuestion } = useTourRunner()
  const [query, setQuery] = useState(initialQuery ?? '')
  const [scope, setScope] = useState<'section' | 'all'>('section')
  const base = scope === 'section' ? getMissionsForContext(ctx) : ALL_TOURS.filter((tour) => tour.roles.includes(ctx.role))
  const missions = query.trim() ? searchMissions(query, ctx).filter((tour) => scope === 'all' || tour.tab === ctx.activeTab) : base
  const questions = searchQuestions(query, ctx, scope)

  return <>
    <DialogHeader>
      <DialogTitle>Centro de ayuda</DialogTitle>
      <DialogDescription>Guías prácticas para {TAB_LABEL[ctx.activeTab]}. Puedes explorar y trabajar a tu ritmo.</DialogDescription>
    </DialogHeader>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">
      <div className="space-y-3">
        <label className="sr-only" htmlFor="cima-help-search">Buscar guías y acciones</label>
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input id="cima-help-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar guías y acciones" className="h-11 pl-9 text-base sm:text-sm" />
        </div>
        <div role="group" aria-label="Alcance de las guías" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          <Button variant={scope === 'section' ? 'secondary' : 'ghost'} aria-pressed={scope === 'section'} className="h-auto min-h-11 whitespace-normal" onClick={() => setScope('section')}>Esta sección</Button>
          <Button variant={scope === 'all' ? 'secondary' : 'ghost'} aria-pressed={scope === 'all'} className="h-auto min-h-11 whitespace-normal" onClick={() => setScope('all')}>Todas las guías</Button>
        </div>
      </div>
      {missions.length > 0 && <section aria-label="Recorridos disponibles" className="space-y-3">
        <h3 className="text-sm font-semibold">Recorridos guiados</h3>
        {missions.map((tour) => <article key={tour.id} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-start gap-2">
            <h4 className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">{tour.title}</h4>
            {completed.includes(tour.id) && <span className="inline-flex shrink-0 items-center gap-1 text-xs text-primary"><Check className="size-4" />Completado</span>}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{tour.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{tour.steps.filter((step) => !step.requiredRole || step.requiredRole.includes(ctx.role)).length} pasos{tour.estimatedMinutes ? ` · ${tour.estimatedMinutes} min` : ''}</span>
            <Button size="sm" className="min-h-11" aria-label={`Iniciar ${tour.title}`} onClick={() => startTour(tour)}><Play className="size-4" />{completed.includes(tour.id) ? 'Repetir' : 'Iniciar'}</Button>
          </div>
        </article>)}
      </section>}
      {questions.length > 0 && <section aria-label="Preguntas y acciones" className="space-y-3">
        <h3 className="text-sm font-semibold">Preguntas y acciones</h3>
        {questions.map((question) => <HelpCenterQuestionItem key={question.id} question={question} scopeMode={scope} tabLabel={TAB_LABEL[question.tab]} onClick={() => {
          if (question.targetElement) highlightQuestion(question)
          else {
            const tour = ALL_TOURS.find((item) => item.id === question.tourId)
            if (tour) startTour(tour)
          }
        }} />)}
      </section>}
      {!missions.length && !questions.length && <p role="status" className="py-6 text-sm text-muted-foreground">No encontramos guías. Prueba otra búsqueda o consulta todas las secciones.</p>}
      <Button variant="ghost" className="min-h-11 w-full whitespace-normal text-muted-foreground" onClick={reset}><RotateCcw className="size-4 shrink-0" />Restablecer historial de guías</Button>
    </div>
  </>
}

export function HelpCenterModal() {
  const open = useTourStore((state) => state.isHelpCenterOpen)
  const close = useTourStore((state) => state.closeHelpCenter)
  const initialQuery = useTourStore((state) => state.initialSearchQuery)
  return <Dialog open={open} onOpenChange={(next) => { if (!next) close() }}>
    <DialogContent data-testid="help-center" className="flex flex-col overflow-hidden" style={{
      maxHeight: 'calc((100dvh - 2rem) / var(--app-zoom, 1))',
      maxWidth: 'min(32rem, calc((100vw - 2rem) / var(--app-zoom, 1)))',
    }} onCloseAutoFocus={(event) => {
      event.preventDefault()
      document.querySelector<HTMLButtonElement>('[data-testid="help-widget-trigger"]')?.focus({ preventScroll: true })
    }}>
      {open && <HelpContent key={initialQuery ?? 'default'} />}
    </DialogContent>
  </Dialog>
}
