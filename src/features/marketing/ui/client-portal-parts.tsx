import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderKanban,
  MessageSquare,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { ClientCommercialSummary, ClientProposal } from '../api/portal-api'
import { planChipStyle } from './plans.utils'
import { formatCurrency } from './proposal.constants'
import { CLIENT_PROPOSAL_STATE_META, clientProposalState, formatPortalDate } from './portal.utils'

// ── Encabezado ──────────────────────────────────────────────────────────────
function Counter({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3 shadow-2xs">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone)}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function PortalHeader({ summary, isLoading }: { summary?: ClientCommercialSummary; isLoading: boolean }) {
  return (
    <header
      className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/8 via-card to-card p-4 shadow-2xs sm:p-5"
      data-tour="portal-header"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Briefcase className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Mi espacio comercial</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-48" />
          ) : (
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              Hola, {summary?.clientName || 'bienvenido'}
            </h1>
          )}
        </div>
        {summary?.plan && (
          <span
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground"
            style={planChipStyle(summary.planColor)}
            data-testid="portal-plan"
          >
            <span
              className="size-2 rounded-full bg-muted-foreground/50"
              style={summary.planColor ? { backgroundColor: summary.planColor } : undefined}
              aria-hidden="true"
            />
            Plan {summary.plan}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Aquí ves las propuestas que CIMA preparó para ti, decides si las aceptas y conversas con el equipo.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3" data-testid="portal-counters">
        <Counter
          label="Propuestas por decidir"
          value={summary?.pendingProposals ?? 0}
          icon={<FileText className="size-4" />}
          tone="bg-amber-500/10 text-amber-700 dark:text-amber-300"
        />
        <Counter
          label="Propuestas aceptadas"
          value={summary?.approvedProposals ?? 0}
          icon={<CheckCircle2 className="size-4" />}
          tone="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        />
        <Counter
          label="Mensajes sin leer"
          value={summary?.unreadMessages ?? 0}
          icon={<MessageSquare className="size-4" />}
          tone="bg-primary/10 text-primary"
        />
      </div>
    </header>
  )
}

// ── Estado de la propuesta ──────────────────────────────────────────────────
export function ClientProposalStatusChip({ status }: { status?: string | null }) {
  const state = clientProposalState(status)
  const meta = CLIENT_PROPOSAL_STATE_META[state]
  return (
    <span
      className={cn('inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold', meta.chip)}
      data-proposal-state={state}
    >
      {meta.label}
    </span>
  )
}

export function ClientProposalCard({
  proposal,
  onOpen,
}: {
  proposal: ClientProposal
  onOpen: () => void
}) {
  const pending = clientProposalState(proposal.status) === 'pending'
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex h-full w-full cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 text-left shadow-2xs transition-colors',
          'hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          pending ? 'border-amber-500/40' : 'border-border/70'
        )}
        data-testid="client-proposal-card"
        data-client-proposal-id={proposal.proposalId}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 font-semibold leading-snug">{proposal.title || `Propuesta #${proposal.proposalId}`}</p>
          <ClientProposalStatusChip status={proposal.status} />
        </div>
        <p className="text-lg font-bold tabular-nums">{formatCurrency(proposal.value)}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            {formatPortalDate(proposal.createdDate)}
          </span>
          <span className={cn('font-semibold', pending ? 'text-primary' : 'text-muted-foreground')}>
            {pending ? 'Revisar y decidir' : 'Ver detalle'}
          </span>
        </div>
      </button>
    </li>
  )
}

// ── Detalle ─────────────────────────────────────────────────────────────────
export function ClientProposalDetail({
  proposal,
  notice,
  onAccept,
  onReject,
  onGoToProjects,
}: {
  proposal: ClientProposal
  /** Aviso (p. ej. la propuesta ya fue decidida en otra sesión). */
  notice?: string | null
  onAccept: () => void
  onReject: () => void
  onGoToProjects?: (projectId?: string | null) => void
}) {
  const state = clientProposalState(proposal.status)
  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-6 sm:px-5" data-testid="client-proposal-detail">
      <div className="flex flex-wrap items-center gap-3">
        <ClientProposalStatusChip status={proposal.status} />
        <span className="text-2xl font-bold tabular-nums">{formatCurrency(proposal.value)}</span>
      </div>
      <p className="text-xs text-muted-foreground">Enviada el {formatPortalDate(proposal.createdDate)}</p>

      {notice && (
        <p
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300"
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {notice}
        </p>
      )}

      <section>
        <h3 className="mb-1.5 text-sm font-semibold">Qué incluye</h3>
        <p className="whitespace-pre-line break-words rounded-xl border border-border/70 bg-muted/20 p-3 text-sm leading-relaxed">
          {proposal.description?.trim() || 'Esta propuesta no tiene descripción.'}
        </p>
      </section>

      {proposal.documentUrl && (
        <a
          href={proposal.documentUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ExternalLink className="size-4" />
          Ver documento de la propuesta
        </a>
      )}

      {state === 'pending' ? (
        <section className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm">
            Esta propuesta espera tu decisión. Si tienes dudas, escríbele a CIMA desde <strong>Mensajes</strong> antes de
            decidir.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onAccept} className="gap-1.5">
              <CheckCircle2 className="size-4" />
              Aceptar propuesta
            </Button>
            <Button variant="outline" onClick={onReject} className="gap-1.5 text-destructive hover:text-destructive">
              <XCircle className="size-4" />
              Rechazar
            </Button>
          </div>
        </section>
      ) : state === 'accepted' || state === 'rejected' ? (
        <section
          className={cn(
            'space-y-1.5 rounded-xl border p-4',
            state === 'accepted' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-destructive/30 bg-destructive/5'
          )}
          data-testid="client-proposal-decision"
        >
          <p className={cn('flex items-center gap-1.5 text-sm font-semibold', state === 'accepted' ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive')}>
            {state === 'accepted' ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {state === 'accepted' ? 'Aceptaste esta propuesta' : 'Rechazaste esta propuesta'}
            {proposal.responseDate ? ` el ${formatPortalDate(proposal.responseDate)}` : ''}
          </p>
          {proposal.clientComment?.trim() && (
            <p className="whitespace-pre-line break-words text-sm text-foreground/80">Tu comentario: “{proposal.clientComment.trim()}”</p>
          )}
        </section>
      ) : (
        <p className="rounded-xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
          CIMA todavía está preparando esta propuesta. Te avisaremos cuando esté lista para que la revises.
        </p>
      )}

      {proposal.projectId && (
        <section className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between" data-testid="client-proposal-project">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <FolderKanban className="size-4 text-primary" />
            Tu proyecto ya fue creado
          </p>
          {onGoToProjects && (
            <Button size="sm" variant="outline" onClick={() => onGoToProjects(proposal.projectId)}>
              Ir a mis proyectos
            </Button>
          )}
        </section>
      )}
    </div>
  )
}

// ── Estados especiales ──────────────────────────────────────────────────────
export function PortalNotSynced({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border py-14 text-center" data-testid="portal-not-synced">
      <Briefcase className="mx-auto mb-3 size-10 text-muted-foreground/50" />
      <h2 className="text-base font-semibold">Tu cuenta aún no está sincronizada con marketing</h2>
      <p className="mx-auto mt-1 max-w-sm px-4 text-sm text-muted-foreground">
        El equipo de CIMA todavía no te ha registrado como cliente comercial. Cuando lo haga, aquí verás tus propuestas y
        podrás escribirles. Si crees que es un error, escríbenos desde el chat de tu proyecto.
      </p>
      <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={onRetry}>
        <RefreshCw className="size-4" />
        Volver a comprobar
      </Button>
    </div>
  )
}

export function PortalError({ onRetry, what }: { onRetry: () => void; what: string }) {
  return (
    <div className="rounded-xl border border-destructive/40 py-10 text-center">
      <XCircle className="mx-auto mb-2 size-8 text-destructive" />
      <p className="text-sm font-medium">No se pudieron cargar {what}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}
