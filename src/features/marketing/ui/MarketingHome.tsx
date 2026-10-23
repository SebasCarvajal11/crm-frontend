import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { markWhatsappSentRequest } from '../api/whatsapp-api'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  commercialKeys,
  getFunnelClientsRequest,
  getFunnelRequest,
  getTodayPanelRequest,
  type FunnelStageKey,
} from '../api/commercial-api'
import { usePlans } from '../hooks/use-plans'
import { FunnelView } from './funnel-view'
import { FunnelStageClients } from './funnel-stage-clients'
import { TodayPanel } from './today-panel'
import { RegisterContactDialog } from './RegisterContactDialog'
import { WhatsAppDialog, type WhatsAppTarget } from './WhatsAppDialog'
import { CreateProjectFromProposal } from './CreateProjectFromProposal'
import { FUNNEL_STAGE_HELP, funnelPeriodOptions } from './commercial.utils'
import type { MessageThread } from '../api/messages-api'

interface MarketingHomeProps {
  accessToken: string
  isAdmin: boolean
  /** "Ver propuesta": lleva a la pestaña Propuestas y la resalta. */
  onViewProposal: (proposalId: number) => void
  onGoToTemplates?: () => void
  /** Conversaciones con mensajes del cliente sin leer (tarjeta "Mensajes sin responder"). */
  unansweredThreads?: MessageThread[] | null
  onOpenThread?: (thread: MessageThread) => void
}

/** Pestaña "Inicio" de Marketing: embudo comercial y panel Hoy. */
export function MarketingHome({
  accessToken,
  isAdmin,
  onViewProposal,
  onGoToTemplates,
  unansweredThreads,
  onOpenThread,
}: MarketingHomeProps) {
  const { plans } = usePlans(accessToken)
  const [period, setPeriod] = useState('')
  const periodOptions = useMemo(() => funnelPeriodOptions(), [])
  const [stage, setStage] = useState<{ key: FunnelStageKey; label: string } | null>(null)
  const [contactClientId, setContactClientId] = useState<string | null>(null)
  const [whatsApp, setWhatsApp] = useState<WhatsAppTarget | null>(null)

  const periodValue = period || null
  const funnelQuery = useQuery({
    queryKey: commercialKeys.funnel(periodValue),
    queryFn: () => getFunnelRequest(accessToken, periodValue),
  })
  const queryClient = useQueryClient()
  const markSent = useMutation({
    mutationFn: (interactionId: number) => markWhatsappSentRequest(accessToken, interactionId),
    // Desde ahí cuenta como contacto: se refrescan Hoy, el embudo y las interacciones.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: commercialKeys.today })
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'interactions'] })
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'funnel'] })
    },
  })
  const todayQuery = useQuery({
    queryKey: commercialKeys.today,
    queryFn: () => getTodayPanelRequest(accessToken),
  })
  const stageQuery = useQuery({
    queryKey: commercialKeys.funnelClients(stage?.key ?? 'none', periodValue),
    queryFn: () => getFunnelClientsRequest(accessToken, stage!.key, periodValue),
    enabled: stage !== null,
  })

  const periodLabel = periodOptions.find((o) => o.value === period)?.label ?? 'Histórico'

  return (
    <div className="space-y-6">
      <FunnelView
        data={funnelQuery.data}
        isLoading={funnelQuery.isLoading}
        isError={funnelQuery.isError}
        period={period}
        periodOptions={periodOptions}
        onPeriodChange={setPeriod}
        onStageClick={(key, label) => setStage({ key, label })}
        onRetry={() => void funnelQuery.refetch()}
      />

      <TodayPanel
        data={todayQuery.data}
        isLoading={todayQuery.isLoading}
        isError={todayQuery.isError}
        plans={plans}
        onRetry={() => void todayQuery.refetch()}
        onRegisterContact={(c) => setContactClientId(c.clientId)}
        onWhatsApp={(c) => setWhatsApp({ clientId: c.clientId, clientName: c.name })}
        onViewProposal={onViewProposal}
        unansweredThreads={unansweredThreads}
        onMarkWhatsappSent={(w) => markSent.mutate(w.interactionId)}
        markingWhatsappId={markSent.isPending ? markSent.variables : null}
        onOpenThread={onOpenThread}
        renderCreateProject={
          isAdmin
            ? (item, index) => (
                <CreateProjectFromProposal
                  accessToken={accessToken}
                  proposal={item}
                  dataTour={index === 0 ? 'marketing-create-project-btn' : undefined}
                />
              )
            : undefined
        }
      />

      <Sheet open={stage !== null} onOpenChange={(open) => !open && setStage(null)}>
        <SheetContent side="right" className="w-full gap-0 sm:data-[side=right]:max-w-lg" data-tour="marketing-funnel-sheet">
          <SheetHeader className="pr-12 sm:px-5">
            <SheetTitle className="text-lg font-bold tracking-tight">
              {stage ? `Etapa: ${stage.label}` : 'Etapa del embudo'}
            </SheetTitle>
            <SheetDescription>
              {stage ? `${FUNNEL_STAGE_HELP[stage.key].meaning} ${FUNNEL_STAGE_HELP[stage.key].next}` : ''} Período:{' '}
              {periodLabel.toLowerCase()}.
            </SheetDescription>
          </SheetHeader>
          {stage && (
            <FunnelStageClients
              clients={stageQuery.data}
              isLoading={stageQuery.isLoading}
              isError={stageQuery.isError}
              plans={plans}
              onRetry={() => void stageQuery.refetch()}
            />
          )}
        </SheetContent>
      </Sheet>

      <RegisterContactDialog
        accessToken={accessToken}
        hideTrigger
        open={contactClientId !== null}
        onOpenChange={(open) => !open && setContactClientId(null)}
        initialClientId={contactClientId}
      />
      <WhatsAppDialog
        accessToken={accessToken}
        target={whatsApp}
        onClose={() => setWhatsApp(null)}
        onGoToTemplates={
          onGoToTemplates
            ? () => {
                setWhatsApp(null)
                onGoToTemplates()
              }
            : undefined
        }
      />
    </div>
  )
}
