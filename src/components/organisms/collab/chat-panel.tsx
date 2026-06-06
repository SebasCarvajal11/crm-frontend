import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Shield, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useProjectChatData, useProjectChatSend } from '@/features/collab/hooks'
import type { ProjectMember } from '@/features/collab/model'
import type { MeResponse } from '@/shared/types'
import { buildMentionSuggestions, extractActiveMentionQuery, mentionHints, resolveMentionsFromBody } from './chat-mentions'
import { ChatMessageList } from './chat-message-list'
import { useChatScrollManager } from './use-chat-scroll-manager'

type Channel = 'external' | 'internal'

type Props = {
  accessToken: string
  projectId: string
  identity: MeResponse['data']
  isClient: boolean
  initialChannel?: Channel
  initialMessageId?: string
  members: ProjectMember[]
  onError: (msg: string) => void
}

export function ChatPanel({ accessToken, projectId, identity, isClient, initialChannel, initialMessageId, members, onError }: Props) {
  const [channel, setChannel] = useState<Channel>(initialChannel ?? 'external')
  const [body, setBody] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(initialMessageId ?? null)
  const [cursorPos, setCursorPos] = useState(0)
  const [mentionPickerSuppressed, setMentionPickerSuppressed] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastMarkedRef = useRef<Record<Channel, string | null>>({ external: null, internal: null })

  const { messages, memberBySub, avatarBySub, hasMore, loadMore, isFetching } = useProjectChatData({
    accessToken,
    projectId,
    isClient,
    channel,
    members,
    lastMarkedRef,
  })

  useChatScrollManager({
    channel,
    messageCount: messages.length,
    containerRef: logRef,
  })

  const mentionQuery = useMemo(() => {
    if (mentionPickerSuppressed) return null
    return extractActiveMentionQuery(body, cursorPos || body.length)
  }, [body, cursorPos, mentionPickerSuppressed])

  const mentionSuggestions = useMemo(
    () => (mentionQuery ? buildMentionSuggestions(mentionQuery.query, identity.role, members) : []),
    [mentionQuery, identity.role, members]
  )

  useEffect(() => {
    if (!highlightMessageId || messages.length === 0) return

    const node = logRef.current?.querySelector<HTMLElement>(`[data-message-id="${highlightMessageId}"]`)
    if (!node) return

    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timer = window.setTimeout(() => {
      setHighlightMessageId((current) => (current === highlightMessageId ? null : current))
    }, 2200)

    return () => window.clearTimeout(timer)
  }, [highlightMessageId, messages])

  const applyMention = (value: string) => {
    const caret = textareaRef.current?.selectionStart ?? body.length
    const mentionInfo = extractActiveMentionQuery(body, caret)
    if (!mentionInfo) return

    const before = body.slice(0, mentionInfo.start)
    const after = body.slice(caret)
    const nextBody = `${before}@${value} ${after}`

    setBody(nextBody)
    setActiveIdx(0)
    setMentionPickerSuppressed(false)

    requestAnimationFrame(() => {
      const nextCaretPosition = before.length + value.length + 2
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextCaretPosition, nextCaretPosition)
      setCursorPos(nextCaretPosition)
    })
  }

  const { send } = useProjectChatSend({
    accessToken,
    projectId,
    channel,
    identity,
    onError,
    setBody,
  })

  const submitMessage = () => {
    const trimmedBody = body.trim()
    if (!trimmedBody) return

    send.mutate({
      trimmedBody,
      mentions: resolveMentionsFromBody(trimmedBody, identity.role, members),
    })
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm" style={{ height: 'min(600px, 70vh)' }} role="region" aria-label={channel === 'external' ? 'Chat con el cliente' : 'Chat interno del equipo'}>
      <div className="shrink-0 border-b bg-muted/20 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{channel === 'external' ? 'Chat con el Cliente' : 'Chat del Equipo'}</p>
            <p className="text-xs text-muted-foreground">
              {channel === 'external' ? 'Canal compartido con el cliente' : (
                <span className="flex items-center gap-1">
                  <Shield className="size-3 inline" />
                  Canal privado del equipo
                </span>
              )}
            </p>
          </div>
          {!isClient && (
            <div className="flex gap-1 rounded-lg border bg-background p-0.5" role="tablist" aria-label="Seleccionar canal">
              {(['external', 'internal'] as const).map((nextChannel) => (
                <button
                  key={nextChannel}
                  role="tab"
                  aria-selected={channel === nextChannel}
                  onClick={() => setChannel(nextChannel)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${channel === nextChannel ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {nextChannel === 'external' ? (
                    <>
                      <Users className="size-3" aria-hidden="true" />
                      Cliente
                    </>
                  ) : (
                    <>
                      <User className="size-3" aria-hidden="true" />
                      Equipo
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={logRef} className="flex-1 space-y-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Mensajes">
        {hasMore && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={isFetching}
              className="text-[11px] h-7 px-3 text-muted-foreground hover:text-foreground"
            >
              {isFetching ? 'Cargando anteriores…' : 'Cargar mensajes anteriores'}
            </Button>
          </div>
        )}
        <ChatMessageList
          messages={messages}
          identity={identity}
          memberBySub={memberBySub}
          avatarBySub={avatarBySub}
          highlightMessageId={highlightMessageId}
        />
      </div>

      <div className="shrink-0 border-t bg-background/80 p-3">
        <div className="relative flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={`Escribe un mensaje ${channel === 'internal' ? 'al equipo' : 'al cliente'}... Usa @ para mencionar`}
              value={body}
              onChange={(event) => {
                setBody(event.target.value)
                setActiveIdx(0)
                setMentionPickerSuppressed(false)
                setCursorPos(event.target.selectionStart ?? event.target.value.length)
              }}
              onKeyDown={(event) => {
                if (mentionSuggestions.length > 0) {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setActiveIdx((currentIndex) => (currentIndex + 1) % mentionSuggestions.length)
                    return
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setActiveIdx((currentIndex) => (currentIndex - 1 + mentionSuggestions.length) % mentionSuggestions.length)
                    return
                  }
                  if (event.key === 'Tab' || (event.key === 'Enter' && !event.shiftKey)) {
                    event.preventDefault()
                    const mentionIndex = activeIdx < mentionSuggestions.length ? activeIdx : 0
                    applyMention(mentionSuggestions[mentionIndex]?.value ?? mentionSuggestions[0].value)
                    return
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setMentionPickerSuppressed(true)
                    setActiveIdx(0)
                    return
                  }
                }

                if (event.key === 'Enter' && !event.shiftKey && body.trim()) {
                  event.preventDefault()
                  submitMessage()
                }
              }}
              className="min-h-[44px] max-h-28 resize-none text-sm"
              rows={1}
              aria-label="Escribir mensaje"
              onSelect={(event) => {
                setMentionPickerSuppressed(false)
                setCursorPos((event.target as HTMLTextAreaElement).selectionStart ?? body.length)
              }}
            />
          </div>

          <Button
            size="icon"
            className="h-[44px] w-[44px] shrink-0 rounded-lg"
            disabled={body.trim().length < 1 || send.isPending}
            onClick={submitMessage}
            aria-label="Enviar mensaje"
          >
            <Send className="size-4" />
          </Button>

          {mentionSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-[52px] z-20 mb-1 max-h-40 overflow-y-auto rounded-md border bg-popover shadow-md">
              {mentionSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.key}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    applyMention(suggestion.value)
                  }}
                  className={`w-full rounded px-2 py-1 text-left text-xs ${index === activeIdx ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                >
                  @{suggestion.value} <span className="text-muted-foreground">{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground">Menciones permitidas: {mentionHints(identity.role).join(' · ')}</p>
      </div>
    </div>
  )
}
