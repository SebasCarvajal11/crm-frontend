import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Layers,
  Megaphone,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Tag,
  Trash2,
  Edit2,
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
  listCampaignsRequest,
  createCampaignRequest,
  updateCampaignRequest,
  deleteCampaignRequest,
  type Campaign,
  type CampaignType,
  type CampaignStatus,
  type CreateCampaignInput,
} from '../api/marketing-api'
import { listClientsRequest, type MarketingClient } from '../api/clients-api'

interface CampaignsManagerProps {
  accessToken: string
  onSelectCampaignForWorkflows?: (campaignId: number) => void
}

const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'Positioning', label: 'Posicionamiento' },
  { value: 'Direct_sales', label: 'Venta Directa' },
  { value: 'Value_content', label: 'Contenido de Valor' },
  { value: 'Testimonial', label: 'Testimoniales / Social Proof' },
  { value: 'Reactivation', label: 'Reactivación' },
]

const CAMPAIGN_STATUSES: { value: CampaignStatus; label: string; badge: 'default' | 'secondary' | 'outline' | 'destructive' }[] = [
  { value: 'Active', label: 'Activa', badge: 'default' },
  { value: 'Draft', label: 'Borrador', badge: 'secondary' },
  { value: 'Paused', label: 'Pausada', badge: 'outline' },
  { value: 'Completed', label: 'Completada', badge: 'default' },
  { value: 'Cancelled', label: 'Cancelada', badge: 'destructive' },
]

function clientLabel(client: MarketingClient) {
  return client.contactInfo || client.additionalInfo || client.clientId
}

export function CampaignsManager({ accessToken, onSelectCampaignForWorkflows }: CampaignsManagerProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  // Form states for Create/Edit
  const [formData, setFormData] = useState<CreateCampaignInput>({
    campaignName: '',
    campaignType: 'Direct_sales',
    clientId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active',
    platforms: 'Instagram, Facebook, Google Ads',
    objective: '',
  })

  const campaignsQuery = useQuery({
    queryKey: ['marketing', 'campaigns', accessToken],
    queryFn: () => listCampaignsRequest(accessToken),
  })

  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients', accessToken],
    queryFn: () => listClientsRequest(accessToken),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateCampaignInput) => createCampaignRequest(accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateCampaignInput> }) =>
      updateCampaignRequest(accessToken, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      setEditingCampaign(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCampaignRequest(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
    },
  })

  const resetForm = () => {
    setFormData({
      campaignName: '',
      campaignType: 'Direct_sales',
      clientId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Active',
      platforms: 'Instagram, Facebook, Google Ads',
      objective: '',
    })
  }

  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      campaignName: campaign.campaignName,
      campaignType: campaign.campaignType,
      clientId: campaign.clientId,
      startDate: campaign.startDate,
      endDate: campaign.endDate || '',
      status: campaign.status,
      platforms: campaign.platforms || '',
      objective: campaign.objective || '',
    })
  }

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCampaign) {
      updateMutation.mutate({
        id: editingCampaign.campaignId,
        input: formData,
      })
    } else {
      createMutation.mutate(formData)
    }
  }

  const campaigns = campaignsQuery.data || []
  const clients = clientsQuery.data || []

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.objective && c.objective.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    const matchesType = typeFilter === 'ALL' || c.campaignType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* ── Barra Superior de Acciones y Filtros ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            Campañas de Marketing
          </h2>
          <p className="text-xs text-muted-foreground">
            Diseño, programación y seguimiento de campañas publicitarias y de contenidos
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setIsCreateOpen(true)
          }}
          className="gap-2 font-semibold shadow-sm"
        >
          <Plus className="size-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* ── Barra de Búsqueda y Filtros ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre u objetivo…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Filtro por Estado */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por estado de campaña"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Todos los Estados</option>
            {CAMPAIGN_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filtrar por tipo de campaña"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Todos los Tipos</option>
            {CAMPAIGN_TYPES.map((tp) => (
              <option key={tp.value} value={tp.value}>
                {tp.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Listado de Campañas ──────────────────────────────────────────────── */}
      {campaignsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <Megaphone className="mx-auto size-10 text-muted-foreground/50" />
            <h3 className="text-base font-bold text-foreground">No se encontraron campañas</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Intenta ajustar los filtros de búsqueda.'
                : 'Comienza creando la primera campaña de marketing para tus clientes.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm()
                setIsCreateOpen(true)
              }}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Crear Campaña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((c) => {
            const statusConfig = CAMPAIGN_STATUSES.find((s) => s.value === c.status)
            const typeConfig = CAMPAIGN_TYPES.find((t) => t.value === c.campaignType)

            return (
              <Card
                key={c.campaignId}
                className="flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all border hover:border-primary/40"
              >
                <div>
                  <div className="border-b bg-muted/20 px-4 py-3 flex items-center justify-between">
                    <Badge variant={statusConfig?.badge || 'default'} className="text-[10px] uppercase font-bold">
                      {statusConfig?.label || c.status}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="size-7">
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => handleOpenEdit(c)} className="gap-2">
                            <Edit2 className="size-3.5" /> Editar Campaña
                          </DropdownMenuItem>
                          {onSelectCampaignForWorkflows && (
                            <DropdownMenuItem
                              onClick={() => onSelectCampaignForWorkflows(c.campaignId)}
                              className="gap-2"
                            >
                              <Layers className="size-3.5" /> Ver Automatizaciones
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm(`¿Eliminar la campaña "${c.campaignName}"?`)) {
                                deleteMutation.mutate(c.campaignId)
                              }
                            }}
                            className="gap-2 text-destructive"
                          >
                            <Trash2 className="size-3.5" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold text-foreground leading-tight line-clamp-1">
                      {c.campaignName}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-primary flex items-center gap-1.5 mt-1">
                      <Tag className="size-3" />
                      {typeConfig?.label || c.campaignType}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3 text-xs">
                    {c.objective && (
                      <p className="text-muted-foreground line-clamp-2 bg-muted/40 p-2 rounded text-[11px] leading-relaxed">
                        <span className="font-semibold text-foreground">Objetivo: </span>
                        {c.objective}
                      </p>
                    )}

                    <div className="space-y-1.5 pt-1">
                      {c.platforms && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Share2 className="size-3 text-primary shrink-0" />
                          <span className="truncate font-medium text-foreground">{c.platforms}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3 text-zinc-500 shrink-0" />
                        <span>
                          {c.startDate} {c.endDate ? `hasta ${c.endDate}` : '(En curso)'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="border-t bg-muted/10 p-3 px-4 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">ID #{c.campaignId}</span>
                  {onSelectCampaignForWorkflows && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectCampaignForWorkflows(c.campaignId)}
                      className="text-xs h-7 gap-1 font-semibold text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Layers className="size-3" />
                      Automatizar
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Modal de Creación / Edición de Campaña ──────────────────────────── */}
      <Dialog
        open={isCreateOpen || editingCampaign !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditingCampaign(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveCampaign} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase text-foreground">
                {editingCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configura los parámetros clave de la estrategia publicitaria
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div>
                <Label htmlFor="campaignClient" className="text-xs font-semibold">
                  Cliente *
                </Label>
                <select
                  id="campaignClient"
                  required
                  value={formData.clientId}
                  disabled={clientsQuery.isLoading || clients.length === 0}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {clientsQuery.isLoading
                      ? 'Cargando clientes…'
                      : clients.length === 0
                        ? 'No hay clientes sincronizados'
                        : 'Selecciona un cliente'}
                  </option>
                  {clients.map((client) => (
                    <option key={client.clientId} value={client.clientId}>
                      {clientLabel(client)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="campaignName" className="text-xs font-semibold">
                  Nombre de la Campaña *
                </Label>
                <Input
                  id="campaignName"
                  required
                  placeholder="Ej. Promoción Lanzamiento Q4"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="campaignType" className="text-xs font-semibold">
                    Tipo de Campaña
                  </Label>
                  <select
                    id="campaignType"
                    value={formData.campaignType}
                    onChange={(e) => setFormData({ ...formData, campaignType: e.target.value as CampaignType })}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium"
                  >
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-xs font-semibold">
                    Estado
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CampaignStatus })}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium"
                  >
                    {CAMPAIGN_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="platforms" className="text-xs font-semibold">
                  Plataformas y Canales
                </Label>
                <Input
                  id="platforms"
                  placeholder="Instagram, Facebook, TikTok, Google Ads"
                  value={formData.platforms || ''}
                  onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startDate" className="text-xs font-semibold">
                    Fecha de Inicio *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs font-semibold">
                    Fecha de Cierre
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="objective" className="text-xs font-semibold">
                  Objetivo Estratégico / KPI
                </Label>
                <textarea
                  id="objective"
                  rows={3}
                  placeholder="Detalla el objetivo comercial, meta de leads o incremento porcentual…"
                  value={formData.objective || ''}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingCampaign(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending || (!editingCampaign && !formData.clientId)}
                className="font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Guardando…'
                  : editingCampaign
                  ? 'Guardar Cambios'
                  : 'Crear Campaña'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
