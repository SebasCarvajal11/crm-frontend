import { useState, type ReactNode } from 'react'
import { CalendarClock, CheckCircle2, Eye, FileText, FolderKanban, MessageSquare, PhoneCall, UserX, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type {
  ApprovedWithoutProject,
  ClientWithoutContact,
  ProposalWithoutResponse,
  TodayPanel as TodayPanelData,
} from '../api/commercial-api'
import type { MarketingPlan } from '../api/plans-api'
import { ClientNameButton } from './client-name-button'
import { PlanChip } from './plan-chip'
import { findPlanByName } from './plans.utils'
import { formatCurrency } from './proposal.constants'
import { TODAY_INITIAL_ROWS, daysOpenLabel, daysSinceContactLabel, remainingLabel } from './commercial.utils'

export interface TodayPanelProps {
  data?: TodayPanelData | null
  isLoading: boolean
  isError: boolean
  plans: MarketingPlan[]
  onRetry: () => void
  onRegisterContact: (client: ClientWithoutContact) => void
  onWhatsApp: (client: ClientWithoutContact) => void
  onViewProposal: (proposalId: number) => void
  /** Botón "Crear proyecto en CIMAxios" (solo admin); null para otros roles. */
  renderCreateProject?: (item: ApprovedWithoutProject, index: number) => ReactNode
}

/** Panel "Hoy": lo que conviene atender hoy, con la acción directa en cada fila. */
export function TodayPanel({
  data,
  isLoading,
  isError,
  plans,
  onRetry,
  onRegisterContact,
  onWhatsApp,
  onViewProposal,
  renderCreateProject,
}: TodayPanelProps) {
  const clients = Array.isArray(data?.clientsWithoutContact) ? data.clientsWithoutContact : []
  const proposals = Array.isArray(data?.proposalsWithoutResponse) ? data.proposalsWithoutResponse : []
  const approved = Array.isArray(data?.approvedWithoutProject) ? data.approvedWithoutProject : []
  const counts = {
    clientsWithoutContact: data?.counts?.clientsWithoutContact ?? clients.length,
    proposalsWithoutResponse: data?.counts?.proposalsWithoutResponse ?? proposals.length,
    approvedWithoutProject: data?.counts?.approvedWithoutProject ?? approved.length,
  }

  return (
    <section aria-labelledby="today-title" data-tour="marketing-today" className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <CalendarClock className="size-5" />
        </div>
        <div>
          <h2 id="today-title" className="text-base font-bold tracking-tight">
            Hoy
          </h2>
          <p className="text-xs text-muted-foreground">
            Clientes y propuestas que necesitan atención, con la acción para resolverlos.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3" role="status" aria-label="Cargando panel Hoy">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/40 py-8 text-center">
          <XCircle className="mx-auto mb-2 size-8 text-destructive" />
          <p className="text-sm font-medium">No se pudo cargar el panel Hoy</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <TodayCard
            icon={<UserX className="size-4" />}
            title="Clientes sin contacto"
            hint="Más de 15 días sin contacto o nunca contactados."
            count={counts.clientsWithoutContact}
            items={clients}
            empty="Todos los clientes tienen contacto reciente."
            testId="today-clients"
            renderItem={(c) => (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <ClientNameButton clientId={c.clientId} name={c.name || c.clientId} className="font-medium" />
                    <p
                      className={cn(
                        'text-xs',
                        c.daysSinceContact === null ? 'font-semibold text-amber-700 dark:text-amber-300' : 'text-muted-foreground'
                      )}
                    >
                      {daysSinceContactLabel(c.daysSinceContact)}
                    </p>
                  </div>
                  <PlanChip name={c.plan} plan={findPlanByName(plans, c.plan)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 flex-1 gap-1.5 text-xs" onClick={() => onRegisterContact(c)}>
                    <PhoneCall className="size-3.5" />
                    Registrar contacto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 gap-1.5 text-xs"
                    onClick={() => onWhatsApp(c)}
                    aria-label={`Abrir en WhatsApp a ${c.name}`}
                  >
                    <MessageSquare className="size-3.5" />
                    WhatsApp
                  </Button>
                </div>
              </>
            )}
            itemKey={(c) => c.clientId}
          />

          <TodayCard
            icon={<FileText className="size-4" />}
            title="Propuestas sin respuesta"
            hint="Enviadas hace más de 7 días y sin respuesta del cliente."
            count={counts.proposalsWithoutResponse}
            items={proposals}
            empty="Ninguna propuesta está esperando respuesta."
            testId="today-proposals"
            renderItem={(p: ProposalWithoutResponse) => (
              <>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium" title={p.title}>
                    {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <ClientNameButton clientId={p.clientId} name={p.clientName} /> · {daysOpenLabel(p.daysOpen)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold tabular-nums">{formatCurrency(p.value ?? null)}</span>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onViewProposal(p.proposalId)}>
                    <Eye className="size-3.5" />
                    Ver propuesta
                  </Button>
                </div>
              </>
            )}
            itemKey={(p) => String(p.proposalId)}
          />

          <TodayCard
            icon={<FolderKanban className="size-4" />}
            title="Aprobadas sin proyecto"
            hint="Propuestas aprobadas que aún no tienen proyecto en CIMAxios."
            count={counts.approvedWithoutProject}
            items={approved}
            empty="Todas las propuestas aprobadas ya tienen proyecto."
            testId="today-approved"
            renderItem={(a: ApprovedWithoutProject, i) => (
              <>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium" title={a.title}>
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <ClientNameButton clientId={a.clientId} name={a.clientName} />
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold tabular-nums">{formatCurrency(a.value ?? null)}</span>
                  {renderCreateProject ? (
                    renderCreateProject(a, i)
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Un administrador debe crear el proyecto.</span>
                  )}
                </div>
              </>
            )}
            itemKey={(a) => String(a.proposalId)}
          />
        </div>
      )}
    </section>
  )
}

interface TodayCardProps<T> {
  icon: ReactNode
  title: string
  hint: string
  count: number
  items: T[]
  empty: string
  testId: string
  renderItem: (item: T, index: number) => ReactNode
  itemKey: (item: T) => string
}

function TodayCard<T>({ icon, title, hint, count, items, empty, testId, renderItem, itemKey }: TodayCardProps<T>) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, TODAY_INITIAL_ROWS)
  const hiddenLoaded = items.length - visible.length
  const rest = remainingLabel(count, visible.length)

  return (
    <article className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-xs" data-testid={testId}>
      <header className="flex items-start justify-between gap-3 border-b p-4">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-primary" aria-hidden="true">
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          </div>
        </div>
        <span
          className={cn(
            'min-w-8 rounded-full px-2 py-0.5 text-center text-sm font-extrabold tabular-nums',
            count > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
          aria-label={`${count} en total`}
        >
          {count}
        </span>
      </header>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-6 text-center">
          <CheckCircle2 className="size-8 text-emerald-500" aria-hidden="true" />
          <p className="text-sm font-semibold">¡Todo al día!</p>
          <p className="text-xs text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <>
          <ul className="divide-y">
            {visible.map((item, i) => (
              <li key={itemKey(item)} className="flex flex-col gap-2 p-4">
                {renderItem(item, i)}
              </li>
            ))}
          </ul>
          {(hiddenLoaded > 0 || rest) && (
            <div className="mt-auto flex items-center justify-between gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground">
              {hiddenLoaded > 0 ? (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setExpanded(true)}>
                  Mostrar {hiddenLoaded} más
                </Button>
              ) : (
                <span>{rest}</span>
              )}
            </div>
          )}
        </>
      )}
    </article>
  )
}
