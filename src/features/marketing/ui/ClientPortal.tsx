import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, MessageSquare } from 'lucide-react'
import { SectionTabs, type SectionTabItem } from '@/components/molecules/section-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  decideMyProposalRequest,
  getMyMessagesRequest,
  getMyProposalsRequest,
  portalKeys,
  sendMyMessageRequest,
  type ClientProposal,
  type ProposalDecision,
} from '../api/portal-api'
import type { MarketingMessage } from '../api/messages-api'
import { usePortalSummary } from '../hooks/use-portal-summary'
import {
  ClientProposalCard,
  ClientProposalDetail,
  PortalError,
  PortalHeader,
  PortalNotSynced,
} from './client-portal-parts'
import { ConversationView } from './conversation-view'
import { ProposalDecisionDialog } from './proposal-decision-dialog'
import {
  MESSAGES_REFETCH_MS,
  httpStatus,
  isConflictError,
  isNotSyncedError,
  sendErrorMessage,
  sortClientProposals,
} from './portal.utils'

type PortalSection = 'proposals' | 'messages'

export interface ClientPortalProps {
  accessToken: string
  /** Lleva a Colaboración (al proyecto, si se conoce). */
  onGoToProjects?: (projectId?: string | null) => void
}

const CONFLICT_NOTICE =
  'Esta propuesta ya no estaba pendiente: CIMA la actualizó mientras la revisabas. Te mostramos su estado actual.'

/** "Mi espacio comercial": propuestas de CIMA y conversación con el equipo (solo clientes). */
export function ClientPortal({ accessToken, onGoToProjects }: ClientPortalProps) {
  const queryClient = useQueryClient()
  const [section, setSection] = useState<PortalSection>('proposals')
  const [openId, setOpenId] = useState<number | null>(null)
  const [decision, setDecision] = useState<ProposalDecision | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const summaryQuery = usePortalSummary(accessToken)
  const notSynced = isNotSyncedError(summaryQuery.error)

  const proposalsQuery = useQuery({
    queryKey: portalKeys.proposals,
    queryFn: () => getMyProposalsRequest(accessToken),
    enabled: !notSynced,
    retry: (count, error) => !isNotSyncedError(error) && count < 2,
  })

  const messagesOpen = section === 'messages' && !notSynced
  const messagesQuery = useQuery({
    queryKey: portalKeys.messages,
    queryFn: async () => {
      const data = await getMyMessagesRequest(accessToken)
      // El backend marca como leídos los mensajes de CIMA al pedirlos.
      void queryClient.invalidateQueries({ queryKey: portalKeys.summary })
      return data
    },
    enabled: messagesOpen,
    refetchInterval: messagesOpen ? MESSAGES_REFETCH_MS : false,
    retry: (count, error) => !isNotSyncedError(error) && count < 2,
  })

  const proposals = useMemo(() => sortClientProposals(proposalsQuery.data ?? []), [proposalsQuery.data])
  const openProposal = proposals.find((p) => p.proposalId === openId) ?? null

  const decideMutation = useMutation({
    mutationFn: ({ id, decision: d, comment }: { id: number; decision: ProposalDecision; comment: string }) =>
      decideMyProposalRequest(accessToken, id, { decision: d, comment: comment || null }),
    onSuccess: (updated) => {
      queryClient.setQueryData<ClientProposal[]>(portalKeys.proposals, (prev) =>
        (prev ?? []).map((p) => (p.proposalId === updated.proposalId ? { ...p, ...updated } : p))
      )
      void queryClient.invalidateQueries({ queryKey: portalKeys.summary })
      setDecision(null)
      setNotice(null)
    },
    onError: (error) => {
      if (isConflictError(error)) {
        setDecision(null)
        setNotice(CONFLICT_NOTICE)
        void queryClient.invalidateQueries({ queryKey: portalKeys.proposals })
        void queryClient.invalidateQueries({ queryKey: portalKeys.summary })
        return
      }
      setDecisionError(
        httpStatus(error) === 400
          ? 'Revisa el comentario: es obligatorio al rechazar y admite máximo 1000 caracteres.'
          : 'No se pudo registrar tu decisión. Inténtalo de nuevo en unos segundos.'
      )
    },
  })

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMyMessageRequest(accessToken, body),
    onSuccess: (message) => {
      queryClient.setQueryData<MarketingMessage[]>(portalKeys.messages, (prev) => [...(prev ?? []), message])
      setSendError(null)
    },
    onError: (error) => setSendError(sendErrorMessage(error)),
  })

  const summary = summaryQuery.data
  const tabs: SectionTabItem<PortalSection>[] = [
    {
      value: 'proposals',
      label: 'Mis propuestas',
      shortLabel: 'Propuestas',
      icon: <FileText className="size-4" />,
      badge: summary?.pendingProposals ? <TabCount value={summary.pendingProposals} /> : undefined,
    },
    {
      value: 'messages',
      label: 'Mensajes con CIMA',
      shortLabel: 'Mensajes',
      icon: <MessageSquare className="size-4" />,
      badge: summary?.unreadMessages ? <TabCount value={summary.unreadMessages} /> : undefined,
    },
  ]

  if (notSynced) {
    return (
      <div className="space-y-6" data-tour="portal-root">
        <PortalNotSynced onRetry={() => void summaryQuery.refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6" data-tour="portal-root">
      <PortalHeader summary={summary} isLoading={summaryQuery.isLoading} />

      <div data-tour="portal-tabs">
        <SectionTabs
          items={tabs}
          value={section}
          onValueChange={setSection}
          ariaLabel="Secciones de mi espacio comercial"
          itemRole="button"
          dataTourPrefix="portal-tab"
        />
      </div>

      {section === 'proposals' && (
        <section className="tab-pane-transition space-y-3" data-tour="portal-proposals" aria-label="Mis propuestas">
          {notice && openId === null && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300" role="status">
              {notice}
            </p>
          )}
          {proposalsQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando propuestas">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : proposalsQuery.isError ? (
            <PortalError what="tus propuestas" onRetry={() => void proposalsQuery.refetch()} />
          ) : proposals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <FileText className="mx-auto mb-2 size-9 text-muted-foreground/50" />
              <p className="text-sm font-medium">Aún no tienes propuestas</p>
              <p className="mt-1 text-xs text-muted-foreground">Cuando CIMA te envíe una, aparecerá aquí para que la revises.</p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {proposals.map((p) => (
                <ClientProposalCard
                  key={p.proposalId}
                  proposal={p}
                  onOpen={() => {
                    setOpenId(p.proposalId)
                    setNotice(null)
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {section === 'messages' && (
        <section className="tab-pane-transition" data-tour="portal-messages" aria-label="Mensajes con CIMA">
          <ConversationView
            className="h-[min(70vh,40rem)]"
            messages={messagesQuery.data}
            perspective="client"
            clientName={summary?.clientName}
            isLoading={messagesQuery.isLoading}
            isError={messagesQuery.isError}
            onRetry={() => void messagesQuery.refetch()}
            onSend={async (body) => {
              try {
                await sendMutation.mutateAsync(body)
                return true
              } catch {
                return false
              }
            }}
            isSending={sendMutation.isPending}
            sendError={sendError}
            emptyTitle="Todavía no hay mensajes"
            emptyHint="Escríbele al equipo de CIMA: dudas sobre una propuesta, cambios o lo que necesites. Te responderán aquí."
            placeholder="Escribe tu mensaje para CIMA…"
          />
        </section>
      )}

      <Sheet
        open={openProposal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenId(null)
            setNotice(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full gap-0 sm:data-[side=right]:max-w-xl">
          <SheetHeader className="pr-12 sm:px-5">
            <SheetTitle className="text-lg font-bold tracking-tight">
              {openProposal?.title || 'Propuesta'}
            </SheetTitle>
            <SheetDescription>Detalle de la propuesta que te envió CIMA.</SheetDescription>
          </SheetHeader>
          {openProposal && (
            <ClientProposalDetail
              proposal={openProposal}
              notice={notice}
              onAccept={() => {
                setDecisionError(null)
                setDecision('ACCEPTED')
              }}
              onReject={() => {
                setDecisionError(null)
                setDecision('REJECTED')
              }}
              onGoToProjects={onGoToProjects}
            />
          )}
        </SheetContent>
      </Sheet>

      <ProposalDecisionDialog
        decision={decision}
        proposalTitle={openProposal?.title || 'Propuesta'}
        isSubmitting={decideMutation.isPending}
        serverError={decisionError}
        onClose={() => setDecision(null)}
        onConfirm={(comment) => {
          if (!openProposal || !decision) return
          setDecisionError(null)
          decideMutation.mutate({ id: openProposal.proposalId, decision, comment })
        }}
      />
    </div>
  )
}

function TabCount({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground tabular-nums">
      {value > 99 ? '99+' : value}
    </span>
  )
}
