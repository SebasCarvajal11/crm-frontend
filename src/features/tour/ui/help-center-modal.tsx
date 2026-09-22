import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Play,
  CheckCircle2,
  Search,
  X,
  Compass,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from '../hooks/use-tour-context'
import { useTourRunner } from '../hooks/use-tour-runner'
import { getActiveTourForContext, searchQuestions } from '../registry'
import type { GuidedQuestionCategory } from '../model/types'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  worker: 'Colaborador',
  client: 'Cliente',
}

const TAB_LABEL: Record<string, string> = {
  overview: 'Resumen',
  collab: 'Colaboración',
  marketing: 'Marketing',
  analytics: 'Analítica',
  admin: 'Administración',
  account: 'Mi Cuenta',
  notifications: 'Notificaciones',
}

const CATEGORIES: { id: 'all' | GuidedQuestionCategory; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'flujo', label: 'Flujo' },
  { id: 'gestion', label: 'Gestión' },
  { id: 'comunicacion', label: 'Comunicación' },
  { id: 'configuracion', label: 'Configuración' },
]

export function HelpCenterModal() {
  const isOpen = useTourStore((s) => s.isHelpCenterOpen)
  const close = useTourStore((s) => s.closeHelpCenter)
  const resetAll = useTourStore((s) => s.resetAllTours)
  const isTourCompleted = useTourStore((s) => s.isTourCompleted)

  const ctx = useTourContext()
  const { startTour, highlightTarget } = useTourRunner()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<'all' | GuidedQuestionCategory>('all')
  const modalRef = useRef<HTMLDivElement>(null)

  const activeTour = useMemo(() => getActiveTourForContext(ctx), [ctx])
  const rawQuestions = useMemo(() => searchQuestions(searchQuery, ctx), [searchQuery, ctx])
  const questions = useMemo(() => {
    if (category === 'all') return rawQuestions
    return rawQuestions.filter((q) => q.category === category)
  }, [rawQuestions, category])

  const isCompleted = activeTour ? isTourCompleted(activeTour.id) : false

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cima-help-title"
      style={{ zoom: 1 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 bg-black/50 backdrop-blur-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={modalRef}
        className="flex max-h-[88dvh] sm:max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl sm:rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Compass className="size-5" />
            </div>
            <div>
              <h2 id="cima-help-title" className="text-sm sm:text-base font-bold text-foreground">
                Centro de Asistencia y Guías
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{TAB_LABEL[ctx.activeTab] ?? ctx.activeTab}</span>
                <span>•</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                  {ROLE_LABEL[ctx.role] ?? ctx.role}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={close}
            aria-label="Cerrar centro de ayuda"
            className="rounded-full cursor-pointer hover:bg-muted"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Main Tab Tour Card */}
          {activeTour && (
            <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {activeTour.title}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                        Completado
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] py-0 font-medium">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeTour.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-primary/10">
                <span className="text-[11px] text-muted-foreground">
                  {activeTour.steps.length} pasos detallados
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => startTour(activeTour)}
                  className="gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer text-xs"
                >
                  <Play className="size-3.5 fill-current" />
                  {isCompleted ? 'Repetir Tour' : 'Iniciar Tour'}
                </Button>
              </div>
            </div>
          )}

          {/* Search Action Questions */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="cima-help-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar guías o acciones (ej. proyectos, contratos...)"
                className="pl-9 pr-8 text-xs h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Preguntas y Acciones Guiadas</span>
              <span>{questions.length}</span>
            </div>
            {questions.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No se encontraron acciones para esta búsqueda o categoría.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      if (q.targetElement) {
                        highlightTarget(
                          q.targetElement,
                          q.question,
                          q.answer,
                          'Pulsa aquí para realizar esta acción'
                        )
                      } else if (q.tourId && activeTour) {
                        startTour(activeTour)
                      }
                    }}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-border/60 p-2.5 text-left transition-colors hover:bg-muted/60 hover:border-primary/30 group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {q.question}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {q.answer}
                      </p>
                    </div>
                    <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer text-[11px]"
            title="Restablece el estado de los tutoriales"
          >
            <RotateCcw className="size-3" />
            <span>Restablecer historial de tours</span>
          </button>
          <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
            Esc para cerrar
          </span>
        </div>
      </div>
    </div>
  )
}
