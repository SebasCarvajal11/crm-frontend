import { memo, useMemo, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import type { MeResponse, UserAvatarsResponse } from '@/shared/types'
import type { ProjectChatMessage, ProjectMember } from '@/features/collab/model'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import { ChatMessageInfoDialog } from './chat-message-info-dialog'
import { ChatMessageBubble } from './chat/chat-message-bubble'
import {
  formatDaySeparator,
  formatMessageTime,
  getAuthorDisplayName,
  getAuthorRoleTag,
} from './chat/chat-message-types'
import { useNewlyArrivedMessages } from './chat/use-newly-arrived-messages'

type Props = {
  messages: ProjectChatMessage[]
  identity: MeResponse['data']
  memberBySub: Map<string, ProjectMember>
  avatarBySub: UserAvatarsResponse['data']['items']
  highlightMessageId: string | null
  members?: ProjectMember[]
}

function ChatSystemMessageItem({ message }: { message: ProjectChatMessage }) {
  return (
    <div className="flex justify-center py-1.5 animate-in fade-in-0 duration-150">
      <span
        className={[
          'inline-flex items-center gap-1.5 rounded-full border bg-muted/60',
          'px-2.5 py-1 text-[10px] text-muted-foreground',
        ].join(' ')}
      >
        <MessageSquare className="size-3 shrink-0" />
        {message.body}
        <span className="opacity-60">{formatMessageTime(message.createdAt)}</span>
      </span>
    </div>
  )
}

function ChatDaySeparatorItem({ isoDate }: { isoDate: string }) {
  return (
    <div className="my-2.5 flex items-center gap-2">
      <div className="h-px flex-1 bg-border/60" />
      <span
        className={[
          'rounded-full border border-border/70 bg-card/90 px-3 py-0.5',
          'text-[10px] font-semibold tracking-wide uppercase text-muted-foreground',
          'shadow-2xs backdrop-blur-xs',
        ].join(' ')}
      >
        {formatDaySeparator(isoDate)}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}

export const ChatMessageList = memo(function ChatMessageList({
  messages,
  identity,
  memberBySub,
  avatarBySub,
  highlightMessageId,
  members: propMembers,
}: Props) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const { isNewlyArrived } = useNewlyArrivedMessages(messages)

  const selectedMessageForInfo = useMemo(
    () => (selectedMessageId ? messages.find((m) => m.id === selectedMessageId) ?? null : null),
    [messages, selectedMessageId]
  )

  const resolvedMembers = useMemo(() => {
    if (propMembers && propMembers.length > 0) return propMembers
    return Array.from(memberBySub.values())
  }, [propMembers, memberBySub])

  const messageDateKeys = useMemo(
    () =>
      messages.map((m) => {
        const d = new Date(m.createdAt)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      }),
    [messages]
  )

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <MessageSquare className="size-10 opacity-20" aria-hidden="true" />
        <p className="text-sm">Aun no hay mensajes en este canal.</p>
      </div>
    )
  }

  return (
    <>
      {messages.map((message, index) => {
        const isOwn = message.authorSub === identity.id
        const isSystem = message.messageType !== 'text'
        const isMentioned =
          Array.isArray(message.mentionedSubs) && message.mentionedSubs.includes(identity.id)
        const prev = index > 0 ? messages[index - 1] : null
        const next = index < messages.length - 1 ? messages[index + 1] : null

        const isSameDayAsPrev = Boolean(prev && messageDateKeys[index] === messageDateKeys[index - 1])
        const isSameDayAsNext = Boolean(next && messageDateKeys[index] === messageDateKeys[index + 1])
        const showDaySeparator = !prev || !isSameDayAsPrev
        const sameAuthorAsPrev =
          Boolean(
            prev &&
            isSameDayAsPrev &&
            prev.messageType === message.messageType &&
            prev.authorSub === message.authorSub &&
            prev.authorEmail === message.authorEmail
          )
        const sameAuthorAsNext =
          Boolean(
            next &&
            isSameDayAsNext &&
            next.messageType === message.messageType &&
            next.authorSub === message.authorSub &&
            next.authorEmail === message.authorEmail
          )

        if (isSystem) {
          return <ChatSystemMessageItem key={message.id} message={message} />
        }

        const avatarUrl = message.authorSub
          ? pickAvatarUrl(avatarBySub[message.authorSub]?.urls, '64')
          : null

        return (
          <div key={message.id}>
            {showDaySeparator && <ChatDaySeparatorItem isoDate={message.createdAt} />}
            <ChatMessageBubble
              message={message}
              isOwn={isOwn}
              isMentioned={isMentioned}
              sameAuthorAsPrevious={sameAuthorAsPrev}
              sameAuthorAsNext={sameAuthorAsNext}
              displayName={getAuthorDisplayName(message, memberBySub)}
              authorTag={getAuthorRoleTag(message, memberBySub)}
              avatarUrl={avatarUrl}
              isNewlyArrived={isNewlyArrived(message.id)}
              highlightMessageId={highlightMessageId}
              onOpenDetails={setSelectedMessageId}
            />
          </div>
        )
      })}

      <ChatMessageInfoDialog
        open={Boolean(selectedMessageId)}
        onOpenChange={(open) => {
          if (!open) setSelectedMessageId(null)
        }}
        message={selectedMessageForInfo}
        members={resolvedMembers}
        avatarBySub={avatarBySub}
      />
    </>
  )
})
