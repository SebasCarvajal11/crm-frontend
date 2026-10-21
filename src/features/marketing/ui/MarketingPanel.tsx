import { useMemo, useState } from 'react'
import { Megaphone, Zap, FileText, Users, MessageSquare, Target, Tag, PenLine, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { SectionTabs, type SectionTabItem } from '@/components/molecules/section-tabs'
import { CampaignsManager } from './CampaignsManager'
import { WorkflowsManager } from './WorkflowsManager'
import { ProposalsManager } from './ProposalsManager'
import { ClientPlansManager } from './ClientPlansManager'
import { InteractionsManager } from './InteractionsManager'
import { SegmentsManager } from './SegmentsManager'
import { PlansManager } from './PlansManager'
import { TemplatesManager } from './TemplatesManager'
import { MarketingHome } from './MarketingHome'
import { Client360Provider } from './Client360Provider'

interface Props {
  accessToken: string
  /** Rol del usuario: la pestaña Planes y el correo de prueba son solo para admin. */
  role?: string
}

type MarketingTab =
  | 'home'
  | 'clients'
  | 'campaigns'
  | 'proposals'
  | 'workflows'
  | 'segments'
  | 'interactions'
  | 'templates'
  | 'plans'

const TABS: SectionTabItem<MarketingTab>[] = [
  { value: 'home', label: 'Inicio', icon: <TrendingUp className="size-4" /> },
  { value: 'clients', label: 'Clientes', icon: <Users className="size-4" /> },
  { value: 'campaigns', label: 'Campañas', icon: <Megaphone className="size-4" /> },
  { value: 'proposals', label: 'Propuestas', icon: <FileText className="size-4" /> },
  { value: 'workflows', label: 'Automatizaciones', shortLabel: 'Flujos', icon: <Zap className="size-4" /> },
  { value: 'segments', label: 'Segmentos', icon: <Target className="size-4" /> },
  { value: 'interactions', label: 'Interacciones', icon: <MessageSquare className="size-4" /> },
  { value: 'templates', label: 'Plantillas', icon: <PenLine className="size-4" /> },
  { value: 'plans', label: 'Planes', icon: <Tag className="size-4" /> },
]

export function MarketingPanel({ accessToken, role }: Props) {
  const isAdmin = role === 'admin'
  const tabs = useMemo(() => TABS.filter((t) => t.value !== 'plans' || isAdmin), [isAdmin])
  const [activeTabState, setActiveTab] = useState<MarketingTab>('home')
  // Si el rol cambia y la pestaña ya no está disponible, vuelve a Inicio.
  const activeTab = tabs.some((t) => t.value === activeTabState) ? activeTabState : 'home'
  // "Ver propuesta" (panel Hoy) y "Nueva propuesta" (ficha 360°) llevan a Propuestas.
  const [highlightProposalId, setHighlightProposalId] = useState<number | null>(null)
  const [newProposalClientId, setNewProposalClientId] = useState<string | null>(null)
  const [preselectedCampaignId, setPreselectedCampaignId] = useState<number | null>(null)

  const handleTabChange = (nextTab: MarketingTab) => {
    setActiveTab(nextTab)
    if (nextTab !== 'proposals') setHighlightProposalId(null)
  }

  const goToProposal = (proposalId: number) => {
    setActiveTab('proposals')
    setHighlightProposalId(proposalId)
  }

  const newProposalFor = (clientId: string) => {
    setActiveTab('proposals')
    setNewProposalClientId(clientId)
  }

  const handleSelectCampaignForWorkflows = (campaignId: number) => {
    setPreselectedCampaignId(campaignId)
    handleTabChange('workflows')
  }

  return (
    <Client360Provider
      accessToken={accessToken}
      onNewProposal={newProposalFor}
      onGoToTemplates={() => handleTabChange('templates')}
    >
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
            description="Embudo comercial, clientes por plan, campañas, propuestas, automatizaciones, segmentos, interacciones y plantillas."
            icon={Megaphone}
          />
        </div>
        <div data-tour="marketing-tabs">
          <SectionTabs
            items={tabs}
            value={activeTab}
            onValueChange={handleTabChange}
            ariaLabel="Secciones de marketing"
            itemRole="button"
            dataTourPrefix="marketing-tab"
          />
        </div>

        <div>
          {activeTab === 'home' && (
            <div className="tab-pane-transition">
              <MarketingHome
                accessToken={accessToken}
                isAdmin={isAdmin}
                onViewProposal={goToProposal}
                onGoToTemplates={() => handleTabChange('templates')}
              />
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="tab-pane-transition">
              <ClientPlansManager
                accessToken={accessToken}
                onGoToTemplates={() => handleTabChange('templates')}
              />
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
              <ProposalsManager
                accessToken={accessToken}
                isAdmin={isAdmin}
                highlightProposalId={highlightProposalId}
                newProposalForClientId={newProposalClientId}
                onNewProposalHandled={() => setNewProposalClientId(null)}
              />
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="tab-pane-transition">
              <WorkflowsManager
                accessToken={accessToken}
                preselectedCampaignId={preselectedCampaignId}
                isAdmin={isAdmin}
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
              <InteractionsManager
                accessToken={accessToken}
                onGoToTemplates={() => handleTabChange('templates')}
              />
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="tab-pane-transition">
              <TemplatesManager accessToken={accessToken} />
            </div>
          )}

          {activeTab === 'plans' && isAdmin && (
            <div className="tab-pane-transition">
              <PlansManager accessToken={accessToken} />
            </div>
          )}
        </div>
      </div>
    </Client360Provider>
  )
}
