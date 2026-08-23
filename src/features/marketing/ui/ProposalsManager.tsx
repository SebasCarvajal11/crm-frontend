import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
  Handshake,
  Link2,
  MoreVertical,
  Plus,
  Search,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface ProposalsManagerProps {
  accessToken: string
}

const PROPOSAL_STATUSES: {
  value: ProposalStatus
  label: string
  description: string
  icon: typeof FileText
  chip: string
  dot: string
}[] = [
  {
    value: 'In_diagnosis',
    label: 'En diagnóstico',
    description: 'Levantando requerimientos del cliente',
    icon: Search,
    chip: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  {
    value: 'Sent',
    label: 'Enviada',
    description: 'A la espera de respuesta del cliente',
    icon: Send,
    chip: 'bg-primary/10 text-primary border-primary/30',
    dot: 'bg-primary',
  },
  {
    value: 'In_negotiation',
    label: 'En negociación',
    description: 'Ajustando alcance o condiciones',
    icon: Handshake,
    chip: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  {
    value: 'Approved',
    label: 'Aprobada',
    description: 'Cerrada con éxito',
    icon: CheckCircle2,
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
  },
  {
    value: 'Rejected',
    label: 'Rechazada',
    description: 'El cliente declinó la propuesta',
    icon: XCircle,
    chip: 'bg-destructive/10 text-destructive border-destructive/30',
    dot: 'bg-destructive',
  },
]

const ESTADOS_PENDIENTES: ProposalStatus[] = ['Sent', 'In_negotiation']

const UMBRAL_SIN_RESPUESTA_DIAS = 15

function statusMeta(status: ProposalStatus) {
  return PROPOSAL_STATUSES.find((s) => s.value === status) ?? PROPOSAL_STATUSES[0]
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value))
}

function diasDesde(value?: string | null): number | null {
  if (!value) return null
  const dias = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
  return Number.isFinite(dias) ? dias : null
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM: CreateProposalInput = {
  clientId: '',
  description: '',
  documentUrl: '',
  status: 'In_diagnosis',
  estimatedValue: null,
  createdDate: todayISO(),
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

  const proposals = proposalsQuery.data ?? []
  const clients = clientsQuery.data ?? []

  const clientLabel = useMemo(() => {
    const mapa = new Map<string, string>()
    clients.forEach((c) => {
      mapa.set(c.clientId, c.contactInfo || c.additionalInfo || `${c.clientId.slice(0, 8)}…`)
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

  function closeDialogs() {
    setIsCreateOpen(false)
    setEditingProposal(null)
    setFormData(EMPTY_FORM)
    setFormError(null)
  }

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

  const isSaving = createMutation.isPending || updateMutation.isPending
  const isDialogOpen = isCreateOpen || editingProposal !== null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FileText className="h-6 w-6 text-primary" />
            PROPUESTAS COMERCIALES
          </h2>
          <p className="text-sm text-muted-foreground">
            Registro, seguimiento y cierre de las propuestas enviadas a clientes
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Propuesta
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="En seguimiento"
          value={String(resumen.pendientes)}
          hint={formatCurrency(resumen.valorPipeline)}
          icon={Clock}
          accent="border-l-primary"
        />
        <SummaryCard
          label="Sin respuesta"
          value={String(resumen.vencidas)}
          hint={`Más de ${UMBRAL_SIN_RESPUESTA_DIAS} días`}
          icon={AlertTriangle}
          accent="border-l-amber-500"
        />
        <SummaryCard
          label="Aprobadas"
          value={String(resumen.aprobadas)}
          hint={formatCurrency(resumen.valorAprobado)}
          icon={CheckCircle2}
          accent="border-l-emerald-600"
        />
        <SummaryCard
          label="Total registradas"
          value={String(resumen.total)}
          hint="Histórico completo"
          icon={FileText}
          accent="border-l-muted-foreground"
        />
      </div>

      {resumen.vencidas > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              {resumen.vencidas} propuesta(s) llevan más de {UMBRAL_SIN_RESPUESTA_DIAS} días sin respuesta
            </p>
            <p className="text-amber-800">
              Son las que el planificador tomará al ejecutar los flujos con disparador
              «Propuesta sin respuesta».
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-56"
        >
          <option value="ALL">Todos los estados</option>
          {PROPOSAL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {proposalsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      ) : proposalsQuery.isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-10 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="font-medium">No se pudieron cargar las propuestas</p>
            <p className="text-sm text-muted-foreground">
              Verifique que el módulo de marketing esté disponible.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => proposalsQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">
              {proposals.length === 0
                ? 'Aún no hay propuestas registradas'
                : 'Ninguna propuesta coincide con el filtro'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {proposals.length === 0
                ? 'Cree la primera propuesta para empezar a hacer seguimiento comercial.'
                : 'Pruebe con otros criterios de búsqueda.'}
            </p>
            {proposals.length === 0 && (
              <Button onClick={openCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Nueva Propuesta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((proposal) => (
            <ProposalCard
              key={proposal.proposalId}
              proposal={proposal}
              clientLabel={clientLabel(proposal.clientId)}
              onEdit={() => openEdit(proposal)}
              onChangeStatus={(status) =>
                statusMutation.mutate({ id: proposal.proposalId, status })
              }
              onDelete={() => deleteMutation.mutate(proposal.proposalId)}
              isBusy={statusMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProposal ? 'Editar propuesta' : 'Nueva propuesta comercial'}
            </DialogTitle>
            <DialogDescription>
              La propuesta queda asociada al cliente y alimenta los indicadores de
              ingresos estimados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <select
                id="clientId"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                disabled={Boolean(editingProposal)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
              >
                <option value="">Seleccione un cliente…</option>
                {clients.map((c) => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.contactInfo || c.additionalInfo || c.clientId}
                    {c.plan ? ` · ${c.plan}` : ''}
                  </option>
                ))}
              </select>
              {clientsQuery.isError && (
                <p className="text-xs text-destructive">
                  No se pudo cargar la lista de clientes. Ejecute la sincronización con el CRM.
                </p>
              )}
              {editingProposal && (
                <p className="text-xs text-muted-foreground">
                  El cliente no se puede cambiar una vez creada la propuesta.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                rows={3}
                value={formData.description ?? ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Producción audiovisual y pauta digital para lanzamiento…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Valor estimado (COP)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  min={0}
                  step={1000}
                  value={formData.estimatedValue ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedValue: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="4500000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdDate">Fecha de la propuesta</Label>
                <Input
                  id="createdDate"
                  type="date"
                  value={formData.createdDate ?? ''}
                  onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProposalStatus })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {PROPOSAL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} — {s.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentUrl">Enlace al documento (opcional)</Label>
              <Input
                id="documentUrl"
                value={formData.documentUrl ?? ''}
                onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                placeholder="https://drive.google.com/…"
              />
            </div>

            {formError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Guardando…' : editingProposal ? 'Guardar cambios' : 'Crear propuesta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: typeof FileText
  accent: string
}) {
  return (
    <Card className={`border-l-4 ${accent}`}>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold leading-none">{value}</p>
          <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-full bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function ProposalCard({
  proposal,
  clientLabel,
  onEdit,
  onChangeStatus,
  onDelete,
  isBusy,
}: {
  proposal: Proposal
  clientLabel: string
  onEdit: () => void
  onChangeStatus: (status: ProposalStatus) => void
  onDelete: () => void
  isBusy: boolean
}) {
  const meta = statusMeta(proposal.status)
  const StatusIcon = meta.icon

  const dias = diasDesde(proposal.createdDate)
  const estaPendiente = ESTADOS_PENDIENTES.includes(proposal.status) && !proposal.responseDate
  const venceSinRespuesta =
    estaPendiente && dias !== null && dias >= UMBRAL_SIN_RESPUESTA_DIAS

  return (
    <Card
      className={`flex flex-col overflow-hidden border-l-4 transition-shadow hover:shadow-md ${
        venceSinRespuesta ? 'border-l-amber-500' : 'border-l-primary'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.chip}`}
          >
            <StatusIcon className="h-3 w-3" />
            {meta.label}
          </span>

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
        </div>

        <CardTitle className="mt-2 text-base leading-snug">
          {formatCurrency(proposal.estimatedValue)}
        </CardTitle>
        <CardDescription className="truncate" title={clientLabel}>
          {clientLabel}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-3 min-h-[3.5rem] rounded-md bg-muted/50 p-3 text-sm">
          {proposal.description || 'Sin descripción registrada'}
        </p>

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
          <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Sin respuesta hace {dias} días — candidata a seguimiento automático</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">#{proposal.proposalId}</span>

          {estaPendiente && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
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
      </CardContent>
    </Card>
  )
}

function mensajeDeError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    return 'No se pudo guardar la propuesta. Verifique que el cliente exista en el CRM.'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}
