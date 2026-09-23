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
                Marketing & Analítica CIMA
              </span>
            </>
          }
          description="Gestión integral de campañas, flujos de reactivación y métricas de desempeño."
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
        />
      </div>

      <div className="tab-pane-transition">
        {visitedTabs.has('clients') && (
          <div style={{ display: activeTab === 'clients' ? 'block' : 'none' }}>
            <ClientPlansManager accessToken={accessToken} />
          </div>
        )}

        {visitedTabs.has('campaigns') && (
          <div style={{ display: activeTab === 'campaigns' ? 'block' : 'none' }}>
            <CampaignsManager
              accessToken={accessToken}
              onSelectCampaignForWorkflows={handleSelectCampaignForWorkflows}
            />
          </div>
        )}

        {visitedTabs.has('proposals') && (
          <div style={{ display: activeTab === 'proposals' ? 'block' : 'none' }}>
            <ProposalsManager accessToken={accessToken} />
          </div>
        )}

        {visitedTabs.has('workflows') && (
          <div style={{ display: activeTab === 'workflows' ? 'block' : 'none' }}>
            <WorkflowsManager
              accessToken={accessToken}
              preselectedCampaignId={preselectedCampaignId}
            />
          </div>
        )}

        {visitedTabs.has('segments') && (
          <div style={{ display: activeTab === 'segments' ? 'block' : 'none' }}>
            <SegmentsManager accessToken={accessToken} />
          </div>
        )}

        {visitedTabs.has('interactions') && (
          <div style={{ display: activeTab === 'interactions' ? 'block' : 'none' }}>
            <InteractionsManager accessToken={accessToken} />
          </div>
        )}
      </div>
    </div>
  )
}
