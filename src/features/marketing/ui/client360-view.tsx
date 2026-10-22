import type { ReactNode } from 'react'
import { CalendarClock, CheckCircle2, FileText, FolderKanban, Mail, Megaphone, MessageSquare, PhoneCall, Plus, Send, Tag, UserX, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { ClientTimeline, TimelineEventType } from '../api/commercial-api'
import type { MarketingPlan } from '../api/plans-api'
import { PlanChip } from './plan-chip'
import { ScoreBar } from './score-bar'
import { formatCurrency } from './proposal.constants'
import { SCORE_FORMULA, formatShortDate, timelineLabel, timelineTone } from './commercial.utils'
import { findPlanByName } from './plans.utils'

const EVENT_ICONS: Record<TimelineEventType, typeof Tag> = {
  PLAN: Tag,
  CAMPAIGN: Megaphone,
  MESSAGE: Send,
  RESPONSE: MessageSquare,
  PROPOSAL: FileText,
  PROPOSAL_DECISION: CheckCircle2,
  PROJECT: FolderKanban,
}

export interface Client360ViewProps {
  data?: ClientTimeline | null
  isLoading: boolean
  /** 404: el cliente no existe en marketing. */
  notFound?: boolean
  isError?: boolean
  plans: MarketingPlan[]
  onRetry?: () => void
  onRegisterContact?: () => void
  onWhatsApp?: () => void
  /** Solo dentro de Marketing (abre el formulario de propuesta con el cliente). */
  onNewProposal?: () => void
  /** Solo dentro de Marketing: abre la conversación del portal con el cliente. */
  onSendMessage?: () => void
}

/** Contenido de la ficha 360°: cabecera, estadísticas, acciones y línea de tiempo. */
export function Client360View({
  data,
  isLoading,
  notFound,
  isError,
  plans,
  onRetry,
  onRegisterContact,
  onWhatsApp,
  onNewProposal,
  onSendMessage,
}: Client360ViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-5" role="status" aria-label="Cargando ficha del cliente">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="m-5 rounded-xl border border-dashed border-border py-10 text-center">
        <UserX className="mx-auto mb-3 size-9 text-muted-foreground/60" />
        <p className="font-medium">Este cliente no está en Marketing</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
          Puede que aún no se haya sincronizado desde el CRM. Pida a un administrador que ejecute
          "Sincronizar con el CRM".
        </p>
      </div>
    )
  }

  if (isError || !data?.client) {
    return (
      <div className="m-5 rounded-xl border border-destructive/40 py-10 text-center">
        <XCircle className="mx-auto mb-3 size-9 text-destructive" />
        <p className="font-medium">No se pudo cargar la ficha del cliente</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  const { client, stats } = data
  const events = Array.isArray(data.events) ? data.events : []
  const plan = findPlanByName(plans, client.plan)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5" data-testid="client360-view">
      <section className="space-y-3 rounded-xl border border-border/80 bg-card p-4" aria-label="Datos del cliente">
        <div className="flex flex-wrap items-center gap-2">
          <PlanChip name={client.plan} plan={plan} />
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <Dato icon={<Mail className="size-3.5" />} label="Correo" value={client.email || 'Sin correo'} />
          <Dato icon={<CalendarClock className="size-3.5" />} label="Alta" value={formatShortDate(client.createdAt)} />
          <Dato
            icon={<PhoneCall className="size-3.5" />}
            label="Último contacto"
            value={client.lastContact ? formatShortDate(client.lastContact, true) : 'Nunca contactado'}
          />
        </dl>
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            Puntaje de interés
            <span
              className="inline-flex size-4 cursor-help items-center justify-center rounded-full border border-border text-[10px]"
              title={SCORE_FORMULA}
              aria-label={SCORE_FORMULA}
            >
              ?
            </span>
          </p>
          <ScoreBar score={client.score} showLabel />
        </div>
      </section>

      <section aria-label="Estadísticas" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Interacciones" value={stats?.interactions ?? 0} />
        <Stat label="Respuestas" value={stats?.responses ?? 0} />
        <Stat label="Propuestas" value={stats?.proposals ?? 0} />
        <Stat label="Valor aprobado" value={formatCurrency(stats?.approvedValue ?? 0)} wide />
        <Stat label="Proyectos" value={stats?.projects ?? 0} />
      </section>

      <section aria-label="Acciones rápidas" className="flex flex-wrap gap-2" data-tour="marketing-client360-actions">
        {onRegisterContact && (
          <Button variant="outline" size="sm" className="h-9 flex-1 gap-1.5 text-xs" onClick={onRegisterContact}>
            <PhoneCall className="size-3.5" />
            Registrar contacto
          </Button>
        )}
        {onWhatsApp && (
          <Button variant="outline" size="sm" className="h-9 flex-1 gap-1.5 text-xs" onClick={onWhatsApp}>
            <MessageSquare className="size-3.5" />
            Abrir en WhatsApp
          </Button>
        )}
        {onSendMessage && (
          <Button variant="outline" size="sm" className="h-9 flex-1 gap-1.5 text-xs" onClick={onSendMessage}>
            <Send className="size-3.5" />
            Enviar mensaje
          </Button>
        )}
        {onNewProposal && (
          <Button size="sm" className="h-9 flex-1 gap-1.5 text-xs" onClick={onNewProposal}>
            <Plus className="size-3.5" />
            Nueva propuesta
          </Button>
        )}
      </section>

      <section aria-labelledby="client360-timeline-title" className="space-y-3">
        <h3 id="client360-timeline-title" className="text-sm font-bold">
          Línea de tiempo
        </h3>
        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            Todavía no hay actividad con este cliente. Registre el primer contacto.
          </p>
        ) : (
          <ol className="relative space-y-3 border-l border-border/80 pl-5">
            {events.map((event, i) => {
              const Icon = EVENT_ICONS[event.type as TimelineEventType] ?? CalendarClock
              return (
                <li key={`${event.type}-${event.refId ?? i}-${event.date ?? i}`} className="relative" data-event-type={event.type}>
                  <span
                    className={cn(
                      'absolute -left-[31px] top-0 flex size-6 items-center justify-center rounded-full ring-1',
                      timelineTone(event.type)
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="size-3" />
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-sm font-medium leading-snug">{event.title}</p>
                    <time className="text-[11px] tabular-nums text-muted-foreground" dateTime={event.date ?? undefined}>
                      {formatShortDate(event.date, true)}
                    </time>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {timelineLabel(event.type)}
                  </p>
                  {event.detail && <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}

function Dato({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 truncate" title={`${label}: ${value}`}>
        <span className="text-muted-foreground">{label}: </span>
        {value}
      </dd>
    </div>
  )
}

function Stat({ label, value, wide }: { label: string; value: number | string; wide?: boolean }) {
  return (
    <div className={cn('min-w-0 rounded-xl border border-border/80 bg-muted/20 p-3', wide && 'col-span-2')}>
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground" title={label}>{label}</p>
      <p className="mt-0.5 truncate text-base font-bold tabular-nums" title={String(value)}>
        {value}
      </p>
    </div>
  )
}
