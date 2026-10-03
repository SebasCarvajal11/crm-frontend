import { useState } from 'react'
import { Search, RotateCcw, Play, Check, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogMedia,
  DialogTitle,
} from '@/components/ui/dialog'
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
      <DialogMedia variant="default">
        <HelpCircle className="size-5" />
      </DialogMedia>
      <div className="flex flex-col gap-1 text-left min-w-0">
        <DialogTitle>Centro de ayuda</DialogTitle>
        <DialogDescription>Guías prácticas para {TAB_LABEL[ctx.activeTab]}. Puedes explorar y trabajar a tu ritmo.</DialogDescription>
      </div>
    </DialogHeader>
    <DialogBody className="space-y-4">
      <div className="space-y-3">
        <label className="sr-only" htmlFor="cima-help-search">Buscar guías y acciones</label>
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
          <Input id="cima-help-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar guías y acciones" className="h-10 pl-9 rounded-xl text-xs" />
        </div>
        <div role="group" aria-label="Alcance de las guías" className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
          <Button variant={scope === 'section' ? 'secondary' : 'ghost'} aria-pressed={scope === 'section'} className="h-8 rounded-lg text-xs" onClick={() => setScope('section')}>Esta sección</Button>
          <Button variant={scope === 'all' ? 'secondary' : 'ghost'} aria-pressed={scope === 'all'} className="h-8 rounded-lg text-xs" onClick={() => setScope('all')}>Todas las guías</Button>
        </div>
      </div>
      {missions.length > 0 && <section aria-label="Recorridos disponibles" className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground">Recorridos guiados</h3>
        {missions.map((tour) => <article key={tour.id} className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-start gap-2">
            <h4 className="min-w-0 flex-1 text-xs font-semibold leading-relaxed">{tour.title}</h4>
            {completed.includes(tour.id) && <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"><Check className="size-3.5" />Completado</span>}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{tour.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground">{tour.steps.filter((step) => !step.requiredRole || step.requiredRole.includes(ctx.role)).length} pasos{tour.estimatedMinutes ? ` · ${tour.estimatedMinutes} min` : ''}</span>
            <Button size="sm" className="h-8 rounded-xl text-xs gap-1.5" aria-label={`Iniciar ${tour.title}`} onClick={() => startTour(tour)}><Play className="size-3.5" />{completed.includes(tour.id) ? 'Repetir' : 'Iniciar'}</Button>
          </div>
        </article>)}
      </section>}
      {questions.length > 0 && <section aria-label="Preguntas y acciones" className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground">Preguntas y acciones</h3>
        {questions.map((question) => <HelpCenterQuestionItem key={question.id} question={question} scopeMode={scope} tabLabel={TAB_LABEL[question.tab]} onClick={() => {
          if (question.targetElement) highlightQuestion(question)
          else {
            const tour = ALL_TOURS.find((item) => item.id === question.tourId)
            if (tour) startTour(tour)
          }
        }} />)}
      </section>}
      {!missions.length && !questions.length && <p role="status" className="py-6 text-xs text-center text-muted-foreground">No encontramos guías. Prueba otra búsqueda o consulta todas las secciones.</p>}
      <Button variant="ghost" className="h-9 w-full rounded-xl text-xs text-muted-foreground" onClick={reset}><RotateCcw className="size-3.5 shrink-0 mr-1.5" />Restablecer historial de guías</Button>
    </DialogBody>
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
