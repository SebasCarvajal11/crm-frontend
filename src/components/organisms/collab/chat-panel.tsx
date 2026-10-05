import { useEffect, useMemo, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/shared/lib/utils'
import { useProjectChatData, useProjectChatSend } from '@/features/collab/hooks'
import type { ProjectMember } from '@/features/collab/model'
import type { MeResponse } from '@/shared/types'
import { buildMentionSuggestions, extractActiveMentionQuery, mentionHints, resolveMentionsFromBody } from './chat-mentions'
import { ChatExportDialog } from './chat-export-dialog'
import { ChatMessageList } from './chat-message-list'
import { ChatPanelHeader } from './chat-panel-header'
import { ChatTypingIndicator } from './chat-typing-indicator'
import { COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS } from './collab-workspace-layout'
import { useChatScrollManager } from './use-chat-scroll-manager'
import { useChatTypingSender } from './use-chat-typing-sender'

type Channel = 'external' | 'internal'

type Props = {
  accessToken: string
  projectId: string
  projectName?: string
  identity: MeResponse['data']
  isClient: boolean
  initialChannel?: Channel
  initialMessageId?: string
  members: ProjectMember[]
  onError: (msg: string) => void
  isVisible?: boolean
}

export function ChatPanel({
  accessToken,
  projectId,
  projectName,
  identity,
  isClient,
  initialChannel,
  initialMessageId,
  members,
  onError,
  isVisible = true,
}: Props) {
  const [channel, setChannel] = useState<Channel>(initialChannel ?? 'external')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [body, setBody] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(initialMessageId ?? null)
  const [cursorPos, setCursorPos] = useState(0)
  const [mentionPickerSuppressed, setMentionPickerSuppressed] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastMarkedRef = useRef<Record<Channel, string | null>>({ external: null, internal: null })

  const { messages, memberBySub, avatarBySub, hasMore, loadMore, isFetching, activeTypers } = useProjectChatData({
    accessToken,
    projectId,
    isClient,
    channel,
    members,
    lastMarkedRef,
    isVisible,
  })
  const { notifyTyping } = useChatTypingSender({ accessToken, projectId, channel })

  useChatScrollManager({
    channel,
    messageCount: messages.length,
    containerRef: logRef,
    isVisible,
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
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 44), 112)
    textarea.style.height = `${nextHeight}px`
  }, [body])

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
    accessToken, projectId, channel, identity, onError, setBody,
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
    <div
      className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm`}
      role="region"
      aria-label={channel === 'external' ? 'Chat con el cliente' : 'Chat interno del equipo'}
    >
      <ChatPanelHeader
        channel={channel}
        onChannelChange={setChannel}
        isClient={isClient}
        isAdmin={identity.role === 'admin'}
        onOpenExport={() => setExportDialogOpen(true)}
      />

      <div
        ref={logRef}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto scroll-auto scrollbar-thin px-3.5 sm:px-4 pr-14 sm:pr-4 py-4"
        role="log"
        aria-live="polite"
        aria-label="Mensajes"
      >
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
          members={members}
        />
      </div>

      <div className="shrink-0 border-t bg-muted/20 p-3 sm:p-4 pr-14 sm:pr-4 backdrop-blur-xs">
        <ChatTypingIndicator typers={activeTypers} />
        <div className="relative flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Escribe un mensaje... Usa @ para mencionar"
              value={body}
              onChange={(event) => {
                setBody(event.target.value)
                setActiveIdx(0)
                setMentionPickerSuppressed(false)
                setCursorPos(event.target.selectionStart ?? event.target.value.length)
                notifyTyping()
              }}
              onKeyDown={(event) => {
                if (mentionSuggestions.length > 0) {
                  const len = mentionSuggestions.length
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    return setActiveIdx((i) => (i + 1) % len)
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    return setActiveIdx((i) => (i - 1 + len) % len)
                  }
                  if (event.key === 'Tab' || (event.key === 'Enter' && !event.shiftKey)) {
                    event.preventDefault()
                    const idx = activeIdx < len ? activeIdx : 0
                    return applyMention(mentionSuggestions[idx]?.value ?? mentionSuggestions[0].value)
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setMentionPickerSuppressed(true)
                    return setActiveIdx(0)
                  }
                }

                if (event.key === 'Enter' && !event.shiftKey && body.trim()) {
                  event.preventDefault()
                  submitMessage()
                }
              }}
              className="min-h-[44px] max-h-28 resize-none rounded-xl border-border/80 bg-background py-2.5 px-3 text-sm leading-snug shadow-2xs focus-visible:ring-1 focus-visible:ring-primary"
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
            className={cn(
              'h-[44px] w-[44px] shrink-0 rounded-xl transition-all duration-150',
              body.trim().length > 0 && !send.isPending
                ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:scale-95'
                : 'bg-muted text-muted-foreground/50 border border-border/60 cursor-not-allowed opacity-60'
            )}
            disabled={body.trim().length < 1 || send.isPending}
            onClick={submitMessage}
            aria-label="Enviar mensaje"
          >
            <Send className="size-4" />
          </Button>

          {mentionSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-[52px] z-20 mb-1 max-h-40 overflow-y-auto rounded-xl border bg-popover shadow-md">
              {mentionSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.key}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    applyMention(suggestion.value)
                  }}
                  className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs ${index === activeIdx ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'}`}
                >
                  @{suggestion.value} <span className="text-muted-foreground">{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground/80">
          <span className="truncate">
            Menciones: <span className="font-medium text-foreground/75">{mentionHints(identity.role).join(' · ')}</span>
          </span>
          <span className="hidden sm:inline-block shrink-0 text-[10px] text-muted-foreground/60">
            Enter para enviar · Shift+Enter para nueva línea
          </span>
        </div>
      </div>

      {identity.role === 'admin' && (
        <ChatExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          accessToken={accessToken}
          projectId={projectId}
          projectName={projectName}
          currentChannel={channel}
          members={members}
          identity={identity}
          onError={onError}
        />
      )}
    </div>
  )
}
