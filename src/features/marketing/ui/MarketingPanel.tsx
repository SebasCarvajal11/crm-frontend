import { useState } from 'react'
import { Megaphone, Zap, FileText, Users, MessageSquare, Target } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { SectionTabs, type SectionTabItem } from '@/components/molecules/section-tabs'
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

const TABS: SectionTabItem<MarketingTab>[] = [
  { value: 'clients', label: 'Clientes', icon: <Users className="size-4" /> },
  { value: 'campaigns', label: 'Campañas', icon: <Megaphone className="size-4" /> },
  { value: 'proposals', label: 'Propuestas', icon: <FileText className="size-4" /> },
  { value: 'workflows', label: 'Automatizaciones', icon: <Zap className="size-4" /> },
  { value: 'segments', label: 'Segmentos', icon: <Target className="size-4" /> },
  { value: 'interactions', label: 'Interacciones', icon: <MessageSquare className="size-4" /> },
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
      <PageHeader
        title="Marketing CIMA"
        description="Gestión integral de campañas, flujos de reactivación y métricas de desempeño."
        icon={Megaphone}
      />
      <SectionTabs
        items={TABS}
        value={activeTab}
        onValueChange={setActiveTab}
        ariaLabel="Secciones de marketing"
      />

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
