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

function tabPaneProps(isActive: boolean) {
  return {
    style: { display: isActive ? 'block' : 'none' },
    className: isActive ? 'tab-pane-transition' : undefined,
  }
}

export function MarketingPanel({ accessToken }: Props) {
  const [activeTab, setActiveTab] = useState<MarketingTab>('clients')
  const [visitedTabs, setVisitedTabs] = useState<Set<MarketingTab>>(() => new Set([activeTab]))
  const [preselectedCampaignId, setPreselectedCampaignId] = useState<number | null>(null)

  const handleTabChange = (nextTab: MarketingTab) => {
    setActiveTab(nextTab)
    setVisitedTabs((prev) => (prev.has(nextTab) ? prev : new Set(prev).add(nextTab)))
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
        {visitedTabs.has('clients') && (
          <div {...tabPaneProps(activeTab === 'clients')}>
            <ClientPlansManager accessToken={accessToken} />
          </div>
        )}

        {visitedTabs.has('campaigns') && (
          <div {...tabPaneProps(activeTab === 'campaigns')}>
            <CampaignsManager
              accessToken={accessToken}
              onSelectCampaignForWorkflows={handleSelectCampaignForWorkflows}
            />
          </div>
        )}

        {visitedTabs.has('proposals') && (
          <div {...tabPaneProps(activeTab === 'proposals')}>
            <ProposalsManager accessToken={accessToken} />
          </div>
        )}

        {visitedTabs.has('workflows') && (
          <div {...tabPaneProps(activeTab === 'workflows')}>
            <WorkflowsManager
              accessToken={accessToken}
              preselectedCampaignId={preselectedCampaignId}
            />
          </div>
        )}

        {visitedTabs.has('segments') && (
          <div {...tabPaneProps(activeTab === 'segments')}>
            <SegmentsManager accessToken={accessToken} />
          </div>
        )}

        {visitedTabs.has('interactions') && (
          <div {...tabPaneProps(activeTab === 'interactions')}>
            <InteractionsManager accessToken={accessToken} />
          </div>
        )}
      </div>
    </div>
  )
}
