import { useState } from 'react'
import { BarChart3, Megaphone, Zap, FileText, Users, MessageSquare, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarketingOverview } from './MarketingOverview'
import { CampaignsManager } from './CampaignsManager'
import { WorkflowsManager } from './WorkflowsManager'
import { ProposalsManager } from './ProposalsManager'
import { ClientPlansManager } from './ClientPlansManager'
import { InteractionsManager } from './InteractionsManager'
import { SegmentsManager } from './SegmentsManager'

interface Props {
  accessToken: string
}

type MarketingTab =
  | 'clients'
  | 'campaigns'
  | 'proposals'
  | 'workflows'
  | 'segments'
  | 'interactions'

const TABS: { id: MarketingTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'campaigns', label: 'Campañas', icon: Megaphone },
  { id: 'proposals', label: 'Propuestas', icon: FileText },
  { id: 'workflows', label: 'Automatizaciones', icon: Zap },
  { id: 'segments', label: 'Segmentos', icon: Target },
  { id: 'interactions', label: 'Interacciones', icon: MessageSquare },
]

export function MarketingPanel({ accessToken }: Props) {
  const [activeTab, setActiveTab] = useState<MarketingTab>('clients')
  const [preselectedCampaignId, setPreselectedCampaignId] = useState<number | null>(null)

  const handleSelectCampaignForWorkflows = (campaignId: number) => {
    setPreselectedCampaignId(campaignId)
    setActiveTab('workflows')
  }

  return (
    <div className="space-y-6">
      {/* Header de Módulo */}
      <div className="flex flex-col gap-4 border-b pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-black uppercase tracking-tight text-foreground">
            <Megaphone className="size-6 text-primary" />
            Marketing & Analítica CIMA
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestión integral de campañas, flujos de reactivación y métricas de desempeño
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1 text-xs font-semibold">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Button
                key={tab.id}
                type="button"
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`gap-1.5 text-xs font-bold ${
                  isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {activeTab === 'clients' && <ClientPlansManager accessToken={accessToken} />}

      {activeTab === 'campaigns' && (
        <CampaignsManager
          accessToken={accessToken}
          onSelectCampaignForWorkflows={handleSelectCampaignForWorkflows}
        />
      )}

      {activeTab === 'proposals' && <ProposalsManager accessToken={accessToken} />}

      {activeTab === 'workflows' && (
        <WorkflowsManager
          accessToken={accessToken}
          preselectedCampaignId={preselectedCampaignId}
        />
      )}

      {activeTab === 'segments' && <SegmentsManager accessToken={accessToken} />}

      {activeTab === 'interactions' && <InteractionsManager accessToken={accessToken} />}
    </div>
  )
}
