import { useState } from 'react'
import { BarChart3, Megaphone, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarketingOverview } from './MarketingOverview'
import { CampaignsManager } from './CampaignsManager'
import { WorkflowsManager } from './WorkflowsManager'

interface Props {
  accessToken: string
}

type MarketingTab = 'overview' | 'campaigns' | 'workflows'

export function MarketingPanel({ accessToken }: Props) {
  const [activeTab, setActiveTab] = useState<MarketingTab>('overview')
  const [preselectedCampaignId, setPreselectedCampaignId] = useState<number | null>(null)

  const handleSelectCampaignForWorkflows = (campaignId: number) => {
    setPreselectedCampaignId(campaignId)
    setActiveTab('workflows')
  }

  return (
    <div className="space-y-6">
      {/* ── Header de Módulo ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
            <Megaphone className="size-6 text-primary" />
            Marketing & Analítica CIMA
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestión integral de campañas, flujos de reactivación y métricas de desempeño
          </p>
        </div>

        {/* Sub-navegación por Pestañas */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 text-xs font-semibold">
          <Button
            type="button"
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className={`gap-1.5 text-xs font-bold ${
              activeTab === 'overview' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="size-3.5" />
            Dashboard & KPIs
          </Button>

          <Button
            type="button"
            variant={activeTab === 'campaigns' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('campaigns')}
            className={`gap-1.5 text-xs font-bold ${
              activeTab === 'campaigns' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Megaphone className="size-3.5" />
            Campañas
          </Button>

          <Button
            type="button"
            variant={activeTab === 'workflows' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('workflows')}
            className={`gap-1.5 text-xs font-bold ${
              activeTab === 'workflows' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="size-3.5" />
            Automatizaciones
          </Button>
        </div>
      </div>

      {/* ── Contenido de la Pestaña Activa ──────────────────────────────────── */}
      {activeTab === 'overview' && (
        <MarketingOverview
          accessToken={accessToken}
          onNavigateToCampaigns={() => setActiveTab('campaigns')}
          onNavigateToWorkflows={() => setActiveTab('workflows')}
        />
      )}

      {activeTab === 'campaigns' && (
        <CampaignsManager
          accessToken={accessToken}
          onSelectCampaignForWorkflows={handleSelectCampaignForWorkflows}
        />
      )}

      {activeTab === 'workflows' && (
        <WorkflowsManager
          accessToken={accessToken}
          preselectedCampaignId={preselectedCampaignId}
        />
      )}
    </div>
  )
}
