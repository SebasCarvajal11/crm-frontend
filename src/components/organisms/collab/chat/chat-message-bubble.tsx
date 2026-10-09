import { memo } from 'react'
import { Sparkles } from 'lucide-react'
import type { ProjectChatMessage } from '@/features/collab/model'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { cn } from '@/shared/lib/utils'
import { ChatReadReceipt } from './chat-read-receipt'
import { formatMessageDateTime, formatMessageTime } from './chat-message-types'

type ChatMessageBubbleProps = {
  message: ProjectChatMessage
  isOwn: boolean
  isMentioned: boolean
  sameAuthorAsPrevious: boolean
  sameAuthorAsNext: boolean
  displayName: string
  authorTag: string
  authorRole?: 'admin' | 'worker' | 'client' | null
  avatarUrl: string | null
  avatarColor?: string | null
  isNewlyArrived: boolean
  highlightMessageId: string | null
  onOpenDetails: (messageId: string) => void
}

export const ChatMessageBubble = memo(function ChatMessageBubble({
  message,
  isOwn,
  isMentioned,
  sameAuthorAsPrevious,
  sameAuthorAsNext,
  displayName,
  authorTag,
  authorRole,
  avatarUrl,
  avatarColor,
  isNewlyArrived,
  highlightMessageId,
  onOpenDetails,
}: ChatMessageBubbleProps) {
  const isMilestone = message.messageType === 'milestone'

  return (
    <div
      data-message-id={message.id}
      data-newly-arrived={isNewlyArrived ? 'true' : 'false'}
      className={cn(
        'flex gap-2 transition-colors',
        isNewlyArrived
          ? 'animate-chat-message-settle'
          : 'animate-in fade-in-0 duration-150',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        sameAuthorAsNext ? 'mb-0.5' : 'mb-2.5',
        highlightMessageId === message.id
          ? 'rounded-lg bg-amber-100/60 px-1 py-1 dark:bg-amber-300/15'
          : ''
      )}
    >
      <div className="flex w-7 shrink-0 items-end">
        {!sameAuthorAsNext && (
          <UserAvatar
            src={avatarUrl}
            color={avatarColor}
            name={displayName}
            userId={message.authorSub}
            role={authorRole}
            size="sm"
            alt={`Avatar de ${displayName}`}
          />
        )}
      </div>

      <div
        className={cn(
          'flex max-w-[75%] flex-col',
          isOwn ? 'items-end' : 'items-start',
          sameAuthorAsPrevious ? 'pt-0' : 'pt-0.5'
        )}
      >
        {!isOwn && !sameAuthorAsPrevious && (
          <span className="mb-0.5 px-3 text-[11px] font-semibold text-muted-foreground">
            {displayName} · {authorTag}
            {isMentioned && (
              <span
                className={cn(
                  'ml-2 inline-flex items-center rounded-full border border-amber-300/70',
                  'bg-amber-100/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-800'
                )}
              >
                Te mencionó
              </span>
            )}
          </span>
        )}

        {isMilestone && (
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>Hito del proyecto</span>
          </div>
        )}

        <div
          className={cn(
            'break-words px-3.5 py-2 text-sm leading-relaxed transition-all duration-150',
            isMilestone
              ? isOwn
                ? 'rounded-2xl rounded-br-xs bg-emerald-600 text-white ring-2 ring-emerald-400/40 shadow-sm'
                : 'rounded-2xl rounded-bl-xs bg-emerald-500/5 border border-emerald-500/30 text-foreground ring-1 ring-emerald-500/20 shadow-sm'
              : isOwn
                ? 'rounded-2xl rounded-br-xs bg-primary text-primary-foreground shadow-2xs'
                : 'rounded-2xl rounded-bl-xs bg-card border border-border/70 text-foreground shadow-2xs',
            isMentioned && !isOwn && !isMilestone
              ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
              : ''
          )}
        >
          {message.body}
        </div>

        {!sameAuthorAsNext && (
          <span
            className="mt-0.5 inline-flex items-center gap-1 px-1 text-[10px] text-muted-foreground"
            title={formatMessageDateTime(message.createdAt)}
          >
            {formatMessageTime(message.createdAt)}
            {isOwn && (
              <ChatReadReceipt message={message} onOpenDetails={onOpenDetails} />
            )}
          </span>
        )}
      </div>
    </div>
  )
})
