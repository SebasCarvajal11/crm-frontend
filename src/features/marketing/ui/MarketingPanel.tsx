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
  { value: 'workflows', label: 'Automatizaciones', shortLabel: 'Flujos', icon: <Zap className="size-4" /> },
  { value: 'segments', label: 'Segmentos', icon: <Target className="size-4" /> },
  { value: 'interactions', label: 'Interacciones', icon: <MessageSquare className="size-4" /> },
]

export function MarketingPanel({ accessToken }: Props) {
  const [activeTab, setActiveTab] = useState<MarketingTab>('clients')
  const [preselectedCampaignId, setPreselectedCampaignId] = useState<number | null>(null)

  const handleTabChange = (nextTab: MarketingTab) => {
    setActiveTab(nextTab)
  }

  const handleSelectCampaignForWorkflows = (campaignId: number) => {
    setPreselectedCampaignId(campaignId)
    handleTabChange('workflows')
  }

  return (
    <div className="space-y-6">
      <div data-tour="marketing-header">
        <PageHeader
          eyebrow={
            <>
              Estrategia y <span className="font-black text-primary">Crecimiento</span>
            </>
          }
          title={
            <>
              Panel de{' '}
              <span className="font-black tracking-tight text-foreground">
                Marketing CIMA
              </span>
            </>
          }
          description="Clientes por plan, campañas, propuestas, automatizaciones, segmentos e interacciones."
          icon={Megaphone}
        />
      </div>
      <div data-tour="marketing-tabs">
        <SectionTabs
          items={TABS}
          value={activeTab}
          onValueChange={handleTabChange}
          ariaLabel="Secciones de marketing"
          itemRole="button"
          dataTourPrefix="marketing-tab"
        />
      </div>

      <div>
        {activeTab === 'clients' && (
          <div className="tab-pane-transition">
            <ClientPlansManager accessToken={accessToken} />
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="tab-pane-transition">
            <CampaignsManager
              accessToken={accessToken}
              onSelectCampaignForWorkflows={handleSelectCampaignForWorkflows}
            />
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="tab-pane-transition">
            <ProposalsManager accessToken={accessToken} />
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="tab-pane-transition">
            <WorkflowsManager
              accessToken={accessToken}
              preselectedCampaignId={preselectedCampaignId}
            />
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="tab-pane-transition">
            <SegmentsManager accessToken={accessToken} />
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="tab-pane-transition">
            <InteractionsManager accessToken={accessToken} />
          </div>
        )}
      </div>
    </div>
  )
}
