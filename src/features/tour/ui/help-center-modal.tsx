import { useState } from 'react'
import { Search, RotateCcw, Play, Check, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react'
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
import {
  getMissionsForContext,
  searchMissions,
  searchQuestions,
  getOnboardingChecklistForRole,
  ALL_TOURS,
} from '../registry'
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
  const openWelcome = useTourStore((state) => state.openWelcome)
  const { startTour, highlightQuestion } = useTourRunner()
  const [query, setQuery] = useState(initialQuery ?? '')
  const [scope, setScope] = useState<'section' | 'all'>('section')
  const base = scope === 'section' ? getMissionsForContext(ctx) : ALL_TOURS.filter((tour) => tour.roles.includes(ctx.role))
  const missions = query.trim() ? searchMissions(query, ctx).filter((tour) => scope === 'all' || tour.tab === ctx.activeTab) : base
  const questions = searchQuestions(query, ctx, scope)
  const checklist = getOnboardingChecklistForRole(ctx.role)
  const checklistCompleted = checklist.filter((m) => completed.includes(m.id)).length
  const showChecklist = !query.trim() && checklist.length > 0

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
        <div className="relative flex items-center">
          <Search aria-hidden="true" className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="cima-help-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar guías y acciones"
            className="h-10 pl-9 pr-16 rounded-xl text-xs"
          />
          <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground select-none pointer-events-none">
            Ctrl K
          </kbd>
        </div>
        <div role="group" aria-label="Alcance de las guías" className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
          <Button variant={scope === 'section' ? 'secondary' : 'ghost'} aria-pressed={scope === 'section'} className="h-8 rounded-lg text-xs" onClick={() => setScope('section')}>Esta sección</Button>
          <Button variant={scope === 'all' ? 'secondary' : 'ghost'} aria-pressed={scope === 'all'} className="h-8 rounded-lg text-xs" onClick={() => setScope('all')}>Todas las guías</Button>
        </div>
      </div>
      {showChecklist && (
        <section aria-label="Inicio rápido recomendado" className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Inicio Rápido Recomendado
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {checklistCompleted} de {checklist.length} listos
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${Math.round((checklistCompleted / checklist.length) * 100)}%` }}
            />
          </div>
          {checklistCompleted === checklist.length && (
            <div
              data-testid="checklist-completed-banner"
              className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-xs text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="font-medium">
                ¡Felicitaciones! Has completado todas las misiones recomendadas para tu rol.
              </span>
            </div>
          )}
          <div className="space-y-1.5">
            {checklist.map((tour) => {
              const isDone = completed.includes(tour.id)
              return (
                <div
                  key={tour.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-card/80 px-2.5 py-1.5 border border-border/50 text-xs"
                >
                  <span className={`truncate ${isDone ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {tour.title}
                  </span>
                  {isDone ? (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="size-3" />
                      Completado
                    </span>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      className="h-6 text-[10px] gap-1 rounded-md"
                      onClick={() => startTour(tour)}
                    >
                      <Play className="size-2.5" />
                      Iniciar
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
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
        {questions.map((question) => <HelpCenterQuestionItem key={question.id} question={question} scopeMode={scope} tabLabel={TAB_LABEL[question.tab]} onHighlight={() => {
          if (question.targetElement) highlightQuestion(question)
          else {
            const tour = ALL_TOURS.find((item) => item.id === question.tourId)
            if (tour) startTour(tour)
          }
        }} />)}
      </section>}
      {!missions.length && !questions.length && <p role="status" className="py-6 text-xs text-center text-muted-foreground">No encontramos guías. Prueba otra búsqueda o consulta todas las secciones.</p>}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Button variant="outline" className="h-9 flex-1 rounded-xl text-xs gap-1.5" onClick={openWelcome}>
          <Sparkles className="size-3.5 text-primary" />
          Ruta de bienvenida
        </Button>
        <Button variant="ghost" className="h-9 flex-1 rounded-xl text-xs text-muted-foreground" onClick={reset}>
          <RotateCcw className="size-3.5 shrink-0 mr-1.5" />
          Restablecer historial
        </Button>
      </div>
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
