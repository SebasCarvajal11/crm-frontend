import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, X, RotateCcw, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from '../hooks/use-tour-context'
import { useTourRunner } from '../hooks/use-tour-runner'
import {
  getMissionsForContext,
  searchMissions,
  searchQuestions,
  ALL_TOURS,
} from '../registry'
import { HelpCenterQuestionItem } from './help-center-question-item'
import { HelpCenterHeader } from './help-center-header'
import { OnboardingChecklistCard } from './onboarding-checklist-card'
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
  const initialQuery = useTourStore((s) => s.initialSearchQuery)
  const close = useTourStore((s) => s.closeHelpCenter)
  const resetAll = useTourStore((s) => s.resetAllTours)
  const isTourCompleted = useTourStore((s) => s.isTourCompleted)

  const ctx = useTourContext()
  const { startTour, highlightTarget } = useTourRunner()
  const [localQuery, setLocalQuery] = useState<string | null>(null)
  const searchQuery = localQuery !== null ? localQuery : (initialQuery ?? '')
  const [scopeMode, setScopeMode] = useState<'section' | 'all'>('section')
  const [category, setCategory] = useState<'all' | GuidedQuestionCategory>('all')
  const modalRef = useRef<HTMLDivElement>(null)

  const missions = useMemo(() => getMissionsForContext(ctx), [ctx])
  const fullTour = useMemo(() => ALL_TOURS.find((t) => t.id === 'tour-collab-full'), [])
  const matchedMissions = useMemo(
    () => (searchQuery ? searchMissions(searchQuery, ctx) : []),
    [searchQuery, ctx]
  )
  const rawQuestions = useMemo(
    () => searchQuestions(searchQuery, ctx, scopeMode),
    [searchQuery, ctx, scopeMode]
  )
  const questions = useMemo(() => {
    if (category === 'all') return rawQuestions
    return rawQuestions.filter((q) => q.category === category)
  }, [rawQuestions, category])

  useEffect(() => {
    if (isOpen && initialQuery !== undefined) {
      setTimeout(() => {
        const input = document.getElementById('cima-help-search') as HTMLInputElement | null
        input?.focus()
      }, 50)
    }
  }, [isOpen, initialQuery])

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
      className={[
        'fixed inset-0 z-50 flex items-end justify-center p-0',
        'sm:items-center sm:p-4 bg-black/50 backdrop-blur-xs select-none',
      ].join(' ')}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={modalRef}
        className={[
          'flex max-h-[88dvh] sm:max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl sm:rounded-2xl',
          'border border-border/80 bg-card text-card-foreground shadow-2xl animate-in fade-in-0 zoom-in-95',
          'duration-150 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-0',
        ].join(' ')}
      >
        <HelpCenterHeader
          tabName={TAB_LABEL[ctx.activeTab] ?? ctx.activeTab}
          roleName={ROLE_LABEL[ctx.role] ?? ctx.role}
          onClose={close}
        />

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!searchQuery && missions.length > 0 && (
            <OnboardingChecklistCard
              missions={missions}
              fullTour={fullTour}
              isMissionCompleted={isTourCompleted}
              onStartMission={startTour}
            />
          )}

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="cima-help-search"
                value={searchQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Buscar guías o acciones (ej. proyectos, tareas...)"
                className="pl-9 pr-8 text-xs h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setLocalQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setScopeMode('section')}
                className={`rounded-md py-1 text-center font-medium transition-all cursor-pointer text-[11px] ${
                  scopeMode === 'section'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                De esta sección ({TAB_LABEL[ctx.activeTab] ?? ctx.activeTab})
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('all')}
                className={`rounded-md py-1 text-center font-medium transition-all cursor-pointer text-[11px] ${
                  scopeMode === 'all'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todas las guías
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={[
                    'rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer shrink-0',
                    category === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {searchQuery && matchedMissions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Misiones Sugeridas ({matchedMissions.length})
              </span>
              <div className="space-y-1.5">
                {matchedMissions.map((m) => (
                  <div
                    key={m.id}
                    className={[
                      'flex items-center justify-between gap-2 p-2 rounded-lg',
                      'border border-primary/20 bg-primary/5 text-xs',
                    ].join(' ')}
                  >
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-semibold text-foreground">{m.title}</span>
                      <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => startTour(m)}
                      className="h-6 text-[10px] gap-1 px-2 shrink-0 cursor-pointer"
                    >
                      <Play className="size-2.5 fill-current" />
                      Iniciar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div
              className={[
                'flex items-center justify-between text-[11px] font-semibold',
                'uppercase tracking-wider text-muted-foreground',
              ].join(' ')}
            >
              <span>Preguntas y Acciones Guiadas</span>
              <span>{questions.length}</span>
            </div>
            {questions.length === 0 && matchedMissions.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No se encontraron acciones para esta búsqueda o categoría.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {questions.map((q) => (
                  <HelpCenterQuestionItem
                    key={q.id}
                    question={q}
                    scopeMode={scopeMode}
                    tabLabel={TAB_LABEL[q.tab]}
                    onClick={() => {
                      if (q.targetElement) {
                        highlightTarget(
                          q.targetElement,
                          q.question,
                          q.answer,
                          'Pulsa aquí para realizar esta acción',
                          q.workspaceTab,
                          q.fallbackTargetElement
                        )
                      } else if (q.tourId) {
                        const targetTour = ALL_TOURS.find((t) => t.id === q.tourId)
                        if (targetTour) startTour(targetTour)
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={[
            'flex items-center justify-between border-t border-border/60',
            'bg-muted/20 px-5 py-3 text-xs text-muted-foreground',
          ].join(' ')}
        >
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer text-[11px]"
            title="Restablece el estado de los tutoriales"
          >
            <RotateCcw className="size-3" />
            <span>Restablecer historial de misiones</span>
          </button>
          <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
            Esc para cerrar
          </span>
        </div>
      </div>
    </div>
  )
}
