import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  listCampaignsRequest,
  createCampaignRequest,
  updateCampaignRequest,
  deleteCampaignRequest,
  type Campaign,
  type CreateCampaignInput,
} from '../api/marketing-api'
import { listClientsRequest } from '../api/clients-api'
import { CAMPAIGN_STATUSES, CAMPAIGN_TYPES } from './campaign.constants'
import { CampaignCard } from './campaign-card'
import { CampaignFormDialog } from './campaign-form-dialog'

interface CampaignsManagerProps {
  accessToken: string
  onSelectCampaignForWorkflows?: (campaignId: number) => void
}

const INITIAL_FORM_DATA: CreateCampaignInput = {
  campaignName: '',
  campaignType: 'Direct_sales',
  clientId: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: 'Active',
  platforms: 'Instagram, Facebook, Google Ads',
  objective: '',
}

export function CampaignsManager({
  accessToken,
  onSelectCampaignForWorkflows,
}: CampaignsManagerProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState<CreateCampaignInput>(INITIAL_FORM_DATA)

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
      setFormData(INITIAL_FORM_DATA)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateCampaignInput> }) =>
      updateCampaignRequest(accessToken, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
      setEditingCampaign(null)
      setFormData(INITIAL_FORM_DATA)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCampaignRequest(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing'] })
    },
  })

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
          data-tour="marketing-new-campaign-btn"
          onClick={() => {
            setFormData(INITIAL_FORM_DATA)
            setIsCreateOpen(true)
          }}
          className="gap-2 font-semibold shadow-sm"
        >
          <Plus className="size-4" />
          Nueva Campaña
        </Button>
      </div>

      <div data-tour="marketing-campaigns-filters" className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre u objetivo…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

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

      <div data-tour="marketing-campaigns-grid">
        {campaignsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : campaignsQuery.isError ? (
          <Card className="border-destructive/30 bg-destructive/5 text-center p-6">
            <p className="text-sm font-semibold text-destructive">
              Error al sincronizar las campañas publicitarias.
            </p>
          </Card>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">
                No se encontraron campañas coincidentes.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData(INITIAL_FORM_DATA)
                  setIsCreateOpen(true)
                }}
                className="text-xs"
              >
                Crear tu primera campaña
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((c) => (
              <CampaignCard
                key={c.campaignId}
                campaign={c}
                onEdit={handleOpenEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onSelectForWorkflows={onSelectCampaignForWorkflows}
              />
            ))}
          </div>
        )}
      </div>

      <CampaignFormDialog
        open={isCreateOpen || editingCampaign !== null}
        editingCampaign={editingCampaign}
        formData={formData}
        clients={clients}
        clientsLoading={clientsQuery.isLoading}
        isPending={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingCampaign(null)
        }}
        onFormDataChange={setFormData}
        onSubmit={handleSaveCampaign}
      />
    </div>
  )
}
