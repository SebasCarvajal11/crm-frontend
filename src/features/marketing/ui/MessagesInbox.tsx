import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Mail, MessageSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import {
  getClientMessagesRequest,
  getMessageThreadsRequest,
  markClientMessagesReadRequest,
  messagesKeys,
  sendClientMessageRequest,
  type MarketingMessage,
  type MessageThread,
  type StaffMessage,
} from '../api/messages-api'
import { usePlans } from '../hooks/use-plans'
import type { Client360Target } from './client360-context'
import { ClientNameButton } from './client-name-button'
import { ConversationView } from './conversation-view'
import { DeliveryBadge } from './delivery-badge'
import { PlanChip } from './plan-chip'
import { findPlanByName } from './plans.utils'
import {
  MESSAGES_REFETCH_MS,
  formatThreadTime,
  lastMessagePreview,
  sendErrorMessage,
  sortThreads,
} from './portal.utils'

export interface MessagesInboxProps {
  accessToken: string
  /** Conversación a abrir al entrar (desde la ficha 360° o el panel Hoy). */
  openTarget?: Client360Target | null
}

/** Bandeja de mensajes del portal: conversaciones con cada cliente y respuesta de CIMA. */
export function MessagesInbox({ accessToken, openTarget }: MessagesInboxProps) {
  const queryClient = useQueryClient()
  const { plans } = usePlans(accessToken)
  const [selected, setSelected] = useState<Client360Target | null>(openTarget ?? null)
  // Si piden abrir otra conversación con la bandeja ya montada (p. ej. desde la ficha 360°).
  const [prevTarget, setPrevTarget] = useState(openTarget)
  if (openTarget !== prevTarget) {
    setPrevTarget(openTarget)
    if (openTarget) setSelected(openTarget)
  }
  const [search, setSearch] = useState('')

  const threadsQuery = useQuery({
    queryKey: messagesKeys.threads,
    queryFn: () => getMessageThreadsRequest(accessToken),
    refetchInterval: MESSAGES_REFETCH_MS,
  })

  const threads = useMemo(() => {
    const term = search.trim().toLowerCase()
    const sorted = sortThreads(threadsQuery.data)
    return term ? sorted.filter((t) => (t.clientName || '').toLowerCase().includes(term)) : sorted
  }, [threadsQuery.data, search])

  const selectedThread = selected ? threadsQuery.data?.find((t) => t.clientId === selected.clientId) : undefined

  return (
    <div className="space-y-4" data-tour="marketing-messages">
      <div className="flex flex-col gap-1 rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
          <MessageSquare className="size-5 text-primary" />
          Mensajes de los clientes
        </h2>
        <p className="text-xs text-muted-foreground">
          Lo que los clientes escriben desde su portal llega aquí. Responda en la conversación; si marca “Enviar también
          por correo”, el cliente lo recibe además en su correo.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
        <aside
          className={cn(
            'flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card lg:h-[min(72vh,42rem)]',
            selected && 'hidden lg:flex'
          )}
          aria-label="Conversaciones"
          data-tour="marketing-messages-threads"
        >
          <div className="border-b border-border/70 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente…"
                aria-label="Buscar conversación por cliente"
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>
          <ThreadList
            threads={threads}
            plans={plans}
            isLoading={threadsQuery.isLoading}
            isError={threadsQuery.isError}
            hasAny={(threadsQuery.data?.length ?? 0) > 0}
            selectedId={selected?.clientId ?? null}
            onRetry={() => void threadsQuery.refetch()}
            onSelect={(t) => setSelected({ clientId: t.clientId, name: t.clientName })}
          />
        </aside>

        {selected ? (
          <StaffConversation
            key={selected.clientId}
            accessToken={accessToken}
            clientId={selected.clientId}
            clientName={selectedThread?.clientName || selected.name || 'Cliente'}
            planName={selectedThread?.plan}
            plans={plans}
            onBack={() => setSelected(null)}
            onMarkedRead={() => {
              queryClient.setQueryData<MessageThread[]>(messagesKeys.threads, (prev) =>
                (prev ?? []).map((t) => (t.clientId === selected.clientId ? { ...t, unread: 0 } : t))
              )
            }}
            onSent={() => void queryClient.invalidateQueries({ queryKey: messagesKeys.threads })}
          />
        ) : (
          <div className="hidden min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center lg:flex">
            <MessageSquare className="mb-2 size-9 text-muted-foreground/50" />
            <p className="text-sm font-medium">Elija una conversación</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Las conversaciones con mensajes sin leer aparecen primero.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ThreadList({
  threads,
  plans,
  isLoading,
  isError,
  hasAny,
  selectedId,
  onRetry,
  onSelect,
}: {
  threads: MessageThread[]
  plans: ReturnType<typeof usePlans>['plans']
  isLoading: boolean
  isError: boolean
  hasAny: boolean
  selectedId: string | null
  onRetry: () => void
  onSelect: (thread: MessageThread) => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3" role="status" aria-label="Cargando conversaciones">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }
  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-medium">No se pudieron cargar las conversaciones</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }
  if (threads.length === 0) {
    return (
      <div className="p-6 text-center">
        <MessageSquare className="mx-auto mb-2 size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">{hasAny ? 'Ningún cliente coincide' : 'Aún no hay conversaciones'}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasAny
            ? 'Pruebe con otro nombre.'
            : 'Aparecen cuando un cliente escribe desde su portal o cuando usted le envía un mensaje desde su ficha 360°.'}
        </p>
      </div>
    )
  }
  return (
    <ul className="min-h-0 flex-1 divide-y divide-border/70 overflow-y-auto" data-testid="message-threads">
      {threads.map((t) => {
        const active = t.clientId === selectedId
        return (
          <li key={t.clientId}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex w-full cursor-pointer flex-col gap-1 px-3 py-3 text-left transition-colors hover:bg-muted/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50',
                active && 'bg-primary/5'
              )}
              data-thread-client={t.clientId}
              data-unread={t.unread}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn('min-w-0 truncate text-sm', t.unread > 0 ? 'font-bold' : 'font-medium')}>
                  {t.clientName || t.clientId}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{formatThreadTime(t.lastAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={cn('min-w-0 truncate text-xs', t.unread > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                  {lastMessagePreview(t)}
                </span>
                {t.unread > 0 && (
                  <span
                    className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground tabular-nums"
                    aria-label={`${t.unread} sin leer`}
                  >
                    {t.unread}
                  </span>
                )}
              </div>
              {t.plan && <PlanChip name={t.plan} plan={findPlanByName(plans, t.plan)} className="w-fit text-[10px]" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function StaffConversation({
  accessToken,
  clientId,
  clientName,
  planName,
  plans,
  onBack,
  onMarkedRead,
  onSent,
}: {
  accessToken: string
  clientId: string
  clientName: string
  planName?: string | null
  plans: ReturnType<typeof usePlans>['plans']
  onBack: () => void
  onMarkedRead: () => void
  onSent: () => void
}) {
  const queryClient = useQueryClient()
  const [alsoEmail, setAlsoEmail] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [lastEmail, setLastEmail] = useState<Pick<StaffMessage, 'emailDeliveryStatus' | 'emailDetail'> | null>(null)

  const messagesQuery = useQuery({
    queryKey: messagesKeys.thread(clientId),
    queryFn: () => getClientMessagesRequest(accessToken, clientId),
    refetchInterval: MESSAGES_REFETCH_MS,
  })

  // Al abrir (y cuando lleguen mensajes nuevos del cliente) se marcan como leídos.
  const markRead = useMutation({
    mutationFn: () => markClientMessagesReadRequest(accessToken, clientId),
    onSuccess: () => {
      onMarkedRead()
      void queryClient.invalidateQueries({ queryKey: messagesKeys.thread(clientId) })
    },
  })
  const { mutate: markReadMutate } = markRead
  useEffect(() => {
    markReadMutate()
  }, [markReadMutate])
  // Si llega un mensaje nuevo del cliente con la conversación abierta, también se marca.
  const lastUnreadInbound = (messagesQuery.data ?? []).filter((m) => m.direction === 'INBOUND' && !m.readAt).at(-1)?.messageId
  const lastMarked = useRef<string | null>(null)
  useEffect(() => {
    if (!lastUnreadInbound || lastUnreadInbound === lastMarked.current) return
    lastMarked.current = lastUnreadInbound
    markReadMutate()
  }, [lastUnreadInbound, markReadMutate])

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendClientMessageRequest(accessToken, clientId, { body, alsoEmail }),
    onSuccess: (message) => {
      queryClient.setQueryData<MarketingMessage[]>(messagesKeys.thread(clientId), (prev) => [...(prev ?? []), message])
      setLastEmail(message.emailDeliveryStatus ? message : null)
      setSendError(null)
      onSent()
    },
    onError: (error) => setSendError(sendErrorMessage(error)),
  })

  return (
    <ConversationView
      className="h-[min(78vh,44rem)] lg:h-[min(72vh,42rem)]"
      messages={messagesQuery.data}
      perspective="staff"
      clientName={clientName}
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
      emptyTitle="Todavía no hay mensajes con este cliente"
      emptyHint="Escríbale: el mensaje aparecerá en su portal (Mi espacio comercial)."
      placeholder={`Responder a ${clientName}…`}
      header={
        <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 lg:hidden"
            onClick={onBack}
            aria-label="Volver a las conversaciones"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <ClientNameButton clientId={clientId} name={clientName} className="block truncate text-sm font-bold" />
            <p className="text-[11px] text-muted-foreground">Pulse el nombre para ver la ficha 360°</p>
          </div>
          {planName && <PlanChip name={planName} plan={findPlanByName(plans, planName)} />}
        </div>
      }
      composerExtra={
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-foreground/80">
          <Checkbox checked={alsoEmail} onCheckedChange={(v) => setAlsoEmail(v === true)} aria-label="Enviar también por correo" />
          <Mail className="size-3.5" aria-hidden="true" />
          Enviar también por correo
        </label>
      }
      footer={
        lastEmail?.emailDeliveryStatus ? (
          <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground" data-testid="message-email-status">
            Correo del último mensaje:
            <DeliveryBadge status={lastEmail.emailDeliveryStatus} error={lastEmail.emailDetail} />
          </p>
        ) : null
      }
    />
  )
}
