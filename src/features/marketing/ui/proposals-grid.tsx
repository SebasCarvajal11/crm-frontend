import { FileText, Plus, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Proposal, ProposalStatus } from '../api/proposals-api'
import { ProposalCard } from './proposal-card'

interface ProposalsGridProps {
  isLoading: boolean
  isError: boolean
  filtered: Proposal[]
  totalCount: number
  clientLabel: (clientId: string) => string
  isBusy: boolean
  onOpenCreate: () => void
  onEdit: (proposal: Proposal) => void
  onChangeStatus: (id: number, status: ProposalStatus) => void
  onDelete: (id: number) => void
  onRetry: () => void
}

export function ProposalsGrid({
  isLoading,
  isError,
  filtered,
  totalCount,
  clientLabel,
  isBusy,
  onOpenCreate,
  onEdit,
  onChangeStatus,
  onDelete,
  onRetry,
}: ProposalsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="py-10 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <p className="font-medium">No se pudieron cargar las propuestas</p>
          <p className="text-sm text-muted-foreground">
            Verifique que el módulo de marketing esté disponible.
          </p>
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (filtered.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">
            {totalCount === 0
              ? 'Aún no hay propuestas registradas'
              : 'Ninguna propuesta coincide con el filtro'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount === 0
              ? 'Cree la primera propuesta para empezar a hacer seguimiento comercial.'
              : 'Pruebe con otros criterios de búsqueda.'}
          </p>
          {totalCount === 0 && (
            <Button onClick={onOpenCreate} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Nueva Propuesta
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((proposal) => (
        <ProposalCard
          key={proposal.proposalId}
          proposal={proposal}
          clientLabel={clientLabel(proposal.clientId)}
          onEdit={() => onEdit(proposal)}
          onChangeStatus={(status) => onChangeStatus(proposal.proposalId, status)}
          onDelete={() => onDelete(proposal.proposalId)}
          isBusy={isBusy}
        />
      ))}
    </div>
  )
}
