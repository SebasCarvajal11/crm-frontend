import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Edit2,
  Link2,
  MoreVertical,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Proposal, ProposalStatus } from '../api/proposals-api'
import {
  statusMeta,
  formatCurrency,
  formatDate,
  diasDesde,
  ESTADOS_PENDIENTES,
  UMBRAL_SIN_RESPUESTA_DIAS,
  PROPOSAL_STATUSES,
} from './proposal.constants'

interface ProposalCardProps {
  proposal: Proposal
  clientLabel: string
  onEdit: () => void
  onChangeStatus: (status: ProposalStatus) => void
  onDelete: () => void
  isBusy: boolean
}

function ProposalMenuActions({
  proposal,
  isBusy,
  onEdit,
  onChangeStatus,
  onDelete,
}: {
  proposal: Proposal
  isBusy: boolean
  onEdit: () => void
  onChangeStatus: (status: ProposalStatus) => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {PROPOSAL_STATUSES.filter((s) => s.value !== proposal.status).map((s) => (
          <DropdownMenuItem key={s.value} onClick={() => onChangeStatus(s.value)}>
            <span className={`mr-2 h-2 w-2 rounded-full ${s.dot}`} />
            Marcar como {s.label.toLowerCase()}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProposalCardHeader(props: {
  proposal: Proposal
  clientLabel: string
  isBusy: boolean
  onEdit: () => void
  onChangeStatus: (status: ProposalStatus) => void
  onDelete: () => void
}) {
  const meta = statusMeta(props.proposal.status)
  const StatusIcon = meta.icon

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.chip}`}
        >
          <StatusIcon className="h-3 w-3" />
          {meta.label}
        </span>
        <ProposalMenuActions {...props} />
      </div>

      <CardTitle className="mt-2 text-base leading-snug tabular-nums">
        {formatCurrency(props.proposal.estimatedValue)}
      </CardTitle>
      <CardDescription className="truncate" title={props.clientLabel}>
        {props.clientLabel}
      </CardDescription>
    </CardHeader>
  )
}

function ProposalTimelineMeta({
  proposal,
  dias,
  venceSinRespuesta,
}: {
  proposal: Proposal
  dias: number | null
  venceSinRespuesta: boolean
}) {
  return (
    <>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          <span>Enviada el {formatDate(proposal.createdDate)}</span>
          {dias !== null && <span>· hace {dias} d</span>}
        </div>

        {proposal.responseDate && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Respondida el {formatDate(proposal.responseDate)}</span>
          </div>
        )}

        {proposal.documentUrl && (
          <a
            href={proposal.documentUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Link2 className="h-3.5 w-3.5" />
            Ver documento
          </a>
        )}
      </div>

      {venceSinRespuesta && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Sin respuesta hace {dias} días — candidata a seguimiento automático</span>
        </div>
      )}
    </>
  )
}

function ProposalCardFooter({
  proposalId,
  estaPendiente,
  isBusy,
  onChangeStatus,
}: {
  proposalId: number
  estaPendiente: boolean
  isBusy: boolean
  onChangeStatus: (status: ProposalStatus) => void
}) {
  return (
    <div className="mt-auto flex items-center justify-between border-t pt-3">
      <span className="text-xs text-muted-foreground">#{proposalId}</span>

      {estaPendiente && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
            onClick={() => onChangeStatus('Approved')}
            disabled={isBusy}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprobar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/5"
            onClick={() => onChangeStatus('Rejected')}
            disabled={isBusy}
          >
            <XCircle className="h-3.5 w-3.5" />
            Rechazar
          </Button>
        </div>
      )}
    </div>
  )
}

export function ProposalCard(props: ProposalCardProps) {
  const { proposal, isBusy, onChangeStatus } = props
  const dias = diasDesde(proposal.createdDate)
  const estaPendiente =
    ESTADOS_PENDIENTES.includes(proposal.status) && !proposal.responseDate
  const venceSinRespuesta =
    estaPendiente && dias !== null && dias >= UMBRAL_SIN_RESPUESTA_DIAS

  return (
    <Card
      className={`group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ${
        venceSinRespuesta ? 'border-l-2 border-l-amber-500' : 'border-l-2 border-l-primary'
      }`}
    >
      <ProposalCardHeader {...props} />

      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-3 min-h-[3.5rem] rounded-md bg-muted/50 p-3 text-sm">
          {proposal.description || 'Sin descripción registrada'}
        </p>

        <ProposalTimelineMeta
          proposal={proposal}
          dias={dias}
          venceSinRespuesta={venceSinRespuesta}
        />

        <ProposalCardFooter
          proposalId={proposal.proposalId}
          estaPendiente={estaPendiente}
          isBusy={isBusy}
          onChangeStatus={onChangeStatus}
        />
      </CardContent>
    </Card>
  )
}
