import { Sparkles, Play, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTourStore } from '../model/tour-store'
import { useTourContext } from '../hooks/use-tour-context'
import { useTourRunner } from '../hooks/use-tour-runner'
import { getOnboardingChecklistForRole } from '../registry'
import type { TourUserRole } from '../model/types'

const WELCOME_MESSAGES: Record<TourUserRole, { title: string; description: string }> = {
  client: {
    title: '¡Te damos la bienvenida a CIMA CRM!',
    description: 'Tu portal transparente para aprobar cotizaciones, contratos y seguir el avance de tus proyectos.',
  },
  worker: {
    title: '¡Te damos la bienvenida a tu espacio de trabajo!',
    description: 'Gestiona tus tareas asignadas, colabora con el equipo y entrega resultados con total claridad.',
  },
  admin: {
    title: '¡Te damos la bienvenida a CIMA CRM!',
    description: 'Supervisa tu pipeline comercial, coordina operaciones y analiza métricas clave en una plataforma.',
  },
}

export type OnboardingWelcomeContentProps = {
  role: TourUserRole
  onStart: () => void
  onDismiss: () => void
}

export function OnboardingWelcomeContent({ role, onStart, onDismiss }: OnboardingWelcomeContentProps) {
  const content = WELCOME_MESSAGES[role]
  const checklist = getOnboardingChecklistForRole(role)

  return (
    <>
      <DialogHeader>
        <DialogMedia variant="default">
          <Sparkles className="size-5" />
        </DialogMedia>
        <div className="flex flex-col gap-1 text-left min-w-0">
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tu ruta de inicio recomendada
          </h4>
          <div className="space-y-2" data-testid="welcome-checklist-preview">
            {checklist.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/60 p-2.5 text-sm"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium text-foreground truncate">{item.title}</span>
                <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">~1 min</span>
              </div>
            ))}
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDismiss}
          className="w-full sm:w-auto cursor-pointer"
        >
          Explorar por mi cuenta
        </Button>
        <Button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto gap-1.5 cursor-pointer"
        >
          <Play className="size-3.5 fill-current" />
          <span>Comenzar recorrido</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </DialogFooter>
    </>
  )
}

export function OnboardingWelcomeDialog() {
  const isOpen = useTourStore((s) => s.isWelcomeOpen)
  const dismissWelcome = useTourStore((s) => s.dismissWelcome)
  const ctx = useTourContext()
  const { startTour } = useTourRunner()
  const checklist = getOnboardingChecklistForRole(ctx.role)

  const handleStart = () => {
    dismissWelcome()
    if (checklist[0]) {
      startTour(checklist[0])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) dismissWelcome() }}>
      <DialogContent size="lg" className="sm:max-w-md p-6">
        <OnboardingWelcomeContent
          role={ctx.role}
          onStart={handleStart}
          onDismiss={dismissWelcome}
        />
      </DialogContent>
    </Dialog>
  )
}
