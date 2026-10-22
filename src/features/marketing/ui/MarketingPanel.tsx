import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, Megaphone, Zap, FileText, Users, MessageSquare, Target, Tag, PenLine, TrendingUp } from 'lucide-react'
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
import { MessagesInbox } from './MessagesInbox'
import type { Client360Target } from './client360-context'
import { getMessageThreadsRequest, messagesKeys } from '../api/messages-api'
import { totalUnread, unansweredThreads } from './portal.utils'

interface Props {
  accessToken: string
  /** Rol del usuario: la pestaña Planes y el correo de prueba son solo para admin. */
  role?: string
}

type MarketingTab =
  | 'home'
  | 'messages'
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
  { value: 'messages', label: 'Mensajes', icon: <Mail className="size-4" /> },
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
  // Conversaciones del portal: contador de la pestaña Mensajes y tarjeta del panel Hoy.
  const threadsQuery = useQuery({
    queryKey: messagesKeys.threads,
    queryFn: () => getMessageThreadsRequest(accessToken),
    refetchInterval: 60_000,
  })
  const unread = totalUnread(threadsQuery.data)
  const pendingThreads = useMemo(() => unansweredThreads(threadsQuery.data), [threadsQuery.data])
  const tabs = useMemo(
    () =>
      TABS.filter((t) => t.value !== 'plans' || isAdmin).map((t) =>
        t.value === 'messages' && unread > 0
          ? {
              ...t,
              badge: (
                <span
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground tabular-nums"
                  aria-label={`${unread} sin leer`}
                  data-testid="marketing-messages-badge"
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              ),
            }
          : t
      ),
    [isAdmin, unread]
  )
  const [messageTarget, setMessageTarget] = useState<Client360Target | null>(null)
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
    if (nextTab !== 'messages') setMessageTarget(null)
  }

  const goToProposal = (proposalId: number) => {
    setActiveTab('proposals')
    setHighlightProposalId(proposalId)
  }

  const newProposalFor = (clientId: string) => {
    setActiveTab('proposals')
    setNewProposalClientId(clientId)
  }

  const openConversation = useCallback((target: Client360Target) => {
    setActiveTab('messages')
    setMessageTarget(target)
  }, [])

  const handleSelectCampaignForWorkflows = (campaignId: number) => {
    setPreselectedCampaignId(campaignId)
    handleTabChange('workflows')
  }

  return (
    <Client360Provider
      accessToken={accessToken}
      onNewProposal={newProposalFor}
      onGoToTemplates={() => handleTabChange('templates')}
      onSendMessage={openConversation}
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
            description="Embudo comercial, mensajes de clientes, clientes por plan, campañas, propuestas, automatizaciones, segmentos, interacciones y plantillas."
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
                unansweredThreads={pendingThreads}
                onOpenThread={(t) => openConversation({ clientId: t.clientId, name: t.clientName })}
              />
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="tab-pane-transition">
              <MessagesInbox
                accessToken={accessToken}
                openTarget={messageTarget}
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
