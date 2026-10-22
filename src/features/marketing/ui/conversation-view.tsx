import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Loader2, MessageSquare, Send, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ChatMessageBubble } from '@/components/organisms/collab/chat/chat-message-bubble'
import { cn } from '@/shared/lib/utils'
import type { MarketingMessage } from '../api/messages-api'
import {
  MESSAGE_BODY_MAX,
  buildBubbles,
  canSendMessage,
  shouldSendOnEnter,
  type ConversationPerspective,
} from './portal.utils'

export interface ConversationViewProps {
  messages?: MarketingMessage[] | null
  /** client: el cliente a la derecha; staff: CIMA a la derecha. */
  perspective: ConversationPerspective
  clientName?: string | null
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  /** Devuelve true si el mensaje se envió (entonces se limpia la caja). */
  onSend: (body: string) => Promise<boolean>
  isSending: boolean
  /** Error del último envío (p. ej. límite de 30 mensajes por hora). */
  sendError?: string | null
  emptyTitle: string
  emptyHint: string
  placeholder: string
  /** Controles extra junto al botón Enviar (p. ej. "Enviar también por correo"). */
  composerExtra?: ReactNode
  /** Encabezado de la conversación (nombre del cliente, botón volver…). */
  header?: ReactNode
  className?: string
  /** Pie bajo la caja de texto (p. ej. estado del correo enviado). */
  footer?: ReactNode
}

const noop = () => {}

/**
 * Conversación entre CIMA y un cliente. Reutiliza solo la presentación de las
 * burbujas del chat de proyectos; los datos y la API son los de marketing.
 */
export function ConversationView({
  messages,
  perspective,
  clientName,
  isLoading,
  isError,
  onRetry,
  onSend,
  isSending,
  sendError,
  emptyTitle,
  emptyHint,
  placeholder,
  composerExtra,
  header,
  className,
  footer,
}: ConversationViewProps) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const bubbles = useMemo(() => buildBubbles(messages, perspective, clientName), [messages, perspective, clientName])
  const lastId = bubbles.at(-1)?.message.id

  // Baja al último mensaje cuando llega uno nuevo.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lastId])

  const tooLong = draft.length > MESSAGE_BODY_MAX
  const sendable = canSendMessage(draft) && !isSending

  const submit = async () => {
    if (!sendable) return
    const ok = await onSend(draft.trim())
    if (ok) setDraft('')
  }

  return (
    <section
      className={cn('flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card', className)}
      data-testid="conversation-view"
    >
      {header}

      <div
        ref={scrollRef}
        className="min-h-56 flex-1 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-4"
        role="log"
        aria-live="polite"
        aria-label="Mensajes de la conversación"
      >
        {isLoading ? (
          <div className="space-y-3" role="status" aria-label="Cargando mensajes">
            <Skeleton className="h-10 w-2/3 rounded-2xl" />
            <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
            <Skeleton className="h-14 w-3/5 rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="py-10 text-center">
            <XCircle className="mx-auto mb-2 size-8 text-destructive" />
            <p className="text-sm font-medium">No se pudieron cargar los mensajes</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
        ) : bubbles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="mb-2 size-9 text-muted-foreground/50" />
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          bubbles.map((b) => (
            <div key={b.message.id} data-direction={b.isOwn ? 'own' : 'other'}>
              {b.daySeparator && (
                <div className="my-3 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span className="first-letter:uppercase">{b.daySeparator}</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}
              <ChatMessageBubble
                message={b.message}
                isOwn={b.isOwn}
                isMentioned={false}
                sameAuthorAsPrevious={b.sameAuthorAsPrevious}
                sameAuthorAsNext={b.sameAuthorAsNext}
                displayName={b.displayName}
                authorTag={b.authorTag}
                authorRole={b.authorRole}
                avatarUrl={null}
                isNewlyArrived={false}
                highlightMessageId={null}
                onOpenDetails={noop}
              />
            </div>
          ))
        )}
      </div>

      <form
        className="space-y-2 border-t border-border/70 bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (shouldSendOnEnter(e)) {
              e.preventDefault()
              void submit()
            }
          }}
          placeholder={placeholder}
          aria-label="Escribe tu mensaje"
          aria-invalid={tooLong || undefined}
          rows={2}
          className="max-h-40 min-h-16 resize-none text-sm"
          disabled={isError}
        />
        {/* Margen derecho para que los botones flotantes de ayuda no tapen "Enviar". */}
        <div className="flex flex-wrap items-center justify-between gap-2 pr-12 sm:pr-14">
          <div className="flex min-w-0 flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className={cn('tabular-nums', tooLong && 'font-semibold text-destructive')} data-testid="message-counter">
              {draft.length.toLocaleString('es-CO')}/{MESSAGE_BODY_MAX.toLocaleString('es-CO')}
            </span>
            <span className="hidden sm:inline">Enter para enviar · Shift+Enter para nueva línea</span>
            {composerExtra}
          </div>
          <Button type="submit" size="sm" disabled={!sendable} className="gap-1.5">
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar
          </Button>
        </div>
        {sendError && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300" role="alert">
            {sendError}
          </p>
        )}
        {footer}
      </form>
    </section>
  )
}
