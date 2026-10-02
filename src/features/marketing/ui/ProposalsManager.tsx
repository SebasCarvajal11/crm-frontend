import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  listProposalsRequest,
  listMarketingClientsRequest,
  createProposalRequest,
  updateProposalRequest,
  changeProposalStatusRequest,
  deleteProposalRequest,
  type Proposal,
  type ProposalStatus,
  type CreateProposalInput,
} from '../api/proposals-api'
import { ProposalsSummaryHeader } from './proposals-summary-header'
import { ProposalsGrid } from './proposals-grid'
import { ProposalFormDialog } from './proposal-form-dialog'
import {
  PROPOSAL_STATUSES,
  ESTADOS_PENDIENTES,
  UMBRAL_SIN_RESPUESTA_DIAS,
  diasDesde,
  todayISO,
  EMPTY_FORM,
  mensajeDeError,
} from './proposal.constants'

interface ProposalsManagerProps {
  accessToken: string
}

export function ProposalsManager({ accessToken }: ProposalsManagerProps) {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [formData, setFormData] = useState<CreateProposalInput>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const proposalsQuery = useQuery({
    queryKey: ['marketing', 'proposals'],
    queryFn: () => listProposalsRequest(accessToken),
  })

  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients'],
    queryFn: () => listMarketingClientsRequest(accessToken),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['marketing', 'proposals'] })
    void queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }

  const closeDialogs = () => {
    setIsCreateOpen(false)
    setEditingProposal(null)
    setFormData(EMPTY_FORM)
    setFormError(null)
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateProposalInput) => createProposalRequest(accessToken, input),
    onSuccess: () => {
      invalidate()
      closeDialogs()
    },
    onError: (error: unknown) => setFormError(mensajeDeError(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreateProposalInput }) =>
      updateProposalRequest(accessToken, id, input),
    onSuccess: () => {
      invalidate()
      closeDialogs()
    },
    onError: (error: unknown) => setFormError(mensajeDeError(error)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProposalStatus }) =>
      changeProposalStatusRequest(accessToken, id, status),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProposalRequest(accessToken, id),
    onSuccess: invalidate,
  })

  const proposals = useMemo(() => proposalsQuery.data ?? [], [proposalsQuery.data])
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data])

  const clientLabel = useMemo(() => {
    const mapa = new Map<string, string>()
    clients.forEach((c) => {
      mapa.set(c.clientId, c.additionalInfo || c.contactInfo || `${c.clientId.slice(0, 8)}…`)
    })
    return (clientId: string) => mapa.get(clientId) ?? `${clientId.slice(0, 8)}…`
  }, [clients])

  const filtered = useMemo(() => {
    const termino = searchTerm.trim().toLowerCase()
    return proposals.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
      if (!termino) return true
      return (
        (p.description ?? '').toLowerCase().includes(termino) ||
        clientLabel(p.clientId).toLowerCase().includes(termino)
      )
    })
  }, [proposals, searchTerm, statusFilter, clientLabel])

  const resumen = useMemo(() => {
    const pendientes = proposals.filter((p) => ESTADOS_PENDIENTES.includes(p.status))
    const vencidas = pendientes.filter((p) => {
      const dias = diasDesde(p.createdDate)
      return dias !== null && dias >= UMBRAL_SIN_RESPUESTA_DIAS && !p.responseDate
    })
    const aprobadas = proposals.filter((p) => p.status === 'Approved')
    const valorAprobado = aprobadas.reduce((acc, p) => acc + (p.estimatedValue ?? 0), 0)
    const valorPipeline = pendientes.reduce((acc, p) => acc + (p.estimatedValue ?? 0), 0)

    return {
      total: proposals.length,
      pendientes: pendientes.length,
      vencidas: vencidas.length,
      aprobadas: aprobadas.length,
      valorAprobado,
      valorPipeline,
    }
  }, [proposals])

  function openCreate() {
    setFormData({ ...EMPTY_FORM, createdDate: todayISO() })
    setFormError(null)
    setIsCreateOpen(true)
  }

  function openEdit(proposal: Proposal) {
    setEditingProposal(proposal)
    setFormData({
      clientId: proposal.clientId,
      description: proposal.description ?? '',
      documentUrl: proposal.documentUrl ?? '',
      status: proposal.status,
      estimatedValue: proposal.estimatedValue ?? null,
      createdDate: proposal.createdDate ?? todayISO(),
    })
    setFormError(null)
  }

  function handleSubmit() {
    setFormError(null)
    if (!formData.clientId) {
      setFormError('Seleccione el cliente al que va dirigida la propuesta.')
      return
    }
    if (!formData.description?.trim()) {
      setFormError('Describa brevemente el alcance de la propuesta.')
      return
    }

    if (editingProposal) {
      updateMutation.mutate({ id: editingProposal.proposalId, input: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="space-y-5">
      <div
        data-tour="marketing-proposals-action"
        className={[
          'flex flex-col gap-3.5 rounded-xl border border-border/70 bg-card p-4.5 shadow-2xs',
          'sm:flex-row sm:items-center sm:justify-between',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs',
            ].join(' ')}
          >
            <FileText className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground tracking-tight">Propuestas comerciales</h2>
            <p className="text-xs text-muted-foreground">
              Registro, seguimiento y cierre de las propuestas enviadas a clientes
            </p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 gap-2 rounded-lg font-semibold shadow-2xs shrink-0"
          data-tour="marketing-new-proposal-btn"
        >
          <Plus className="size-4" />
          Nueva Propuesta
        </Button>
      </div>

      <ProposalsSummaryHeader resumen={resumen} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 rounded-lg border-border/70 text-xs focus-visible:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar por estado de propuesta"
          className={[
            'h-9 rounded-lg border border-border/70 bg-background px-3 text-xs font-medium',
            'text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 sm:w-56',
          ].join(' ')}
        >
          <option value="ALL">Todos los estados</option>
          {PROPOSAL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <ProposalsGrid
        isLoading={proposalsQuery.isLoading}
        isError={proposalsQuery.isError}
        filtered={filtered}
        totalCount={proposals.length}
        clientLabel={clientLabel}
        isBusy={statusMutation.isPending || deleteMutation.isPending}
        onOpenCreate={openCreate}
        onEdit={openEdit}
        onChangeStatus={(id, status) => statusMutation.mutate({ id, status })}
        onDelete={(id) => deleteMutation.mutate(id)}
        onRetry={() => proposalsQuery.refetch()}
      />

      <ProposalFormDialog
        open={isCreateOpen || editingProposal !== null}
        editingProposal={editingProposal}
        formData={formData}
        clients={clients}
        isClientsError={clientsQuery.isError}
        formError={formError}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={closeDialogs}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
