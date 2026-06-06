import { Check, CheckCheck, MessageSquare } from 'lucide-react'
import type { MeResponse } from '@/shared/types'
import type { ProjectChatMessage, ProjectMember } from '@/features/collab/model'
import type { UserAvatarsResponse } from '@/shared/types'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import { getAvatarColor } from './avatar-color'

type Props = {
  messages: ProjectChatMessage[]
  identity: MeResponse['data']
  memberBySub: Map<string, ProjectMember>
  avatarBySub: UserAvatarsResponse['data']['items']
  highlightMessageId: string | null
}


const getInitials = (message: ProjectChatMessage): string => {
  const fullName = `${message.authorFirstName ?? ''} ${message.authorLastName ?? ''}`.trim()
  if (fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }

  if (!message.authorEmail) return '?'
  return message.authorEmail.slice(0, 2).toUpperCase()
}

const formatMessageTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })

const formatMessageDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  })

const isSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

const formatDaySeparator = (iso: string): string => {
  const date = new Date(iso)
  const now = new Date()
  if (isSameDay(date, now)) return 'Hoy'
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Ayer'
  return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function ChatMessageList({ messages, identity, memberBySub, avatarBySub, highlightMessageId }: Props) {
  const getDisplayName = (message: ProjectChatMessage): string => {
    const member = message.authorSub ? memberBySub.get(message.authorSub) : undefined
    const memberFullName = `${member?.first_name ?? ''} ${member?.last_name ?? ''}`.trim()
    const fullName = `${message.authorFirstName ?? ''} ${message.authorLastName ?? ''}`.trim()
    return memberFullName || fullName || member?.email || message.authorEmail || 'Sistema'
  }

  const getAuthorTag = (message: ProjectChatMessage): string => {
    const member = message.authorSub ? memberBySub.get(message.authorSub) : undefined
    const profession = member?.profession ?? message.authorProfession
    const role = member?.role ?? message.authorRole
    if (role === 'worker' && profession) return `Worker · ${profession}`
    if (role === 'worker') return 'Worker'
    if (role === 'admin') return 'Administrador'
    if (role === 'client') return 'Cliente'
    return 'Sistema'
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <MessageSquare className="size-10 opacity-20" aria-hidden="true" />
        <p className="text-sm">Aun no hay mensajes en este canal.</p>
      </div>
    )
  }

  return messages.map((message, index) => {
    const isOwn = message.authorSub === identity.id
    const isSystem = message.messageType !== 'text'
    const isMentionedToCurrentUser = Array.isArray(message.mentionedSubs) && message.mentionedSubs.includes(identity.id)
    const previousMessage = index > 0 ? messages[index - 1] : null
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null
    const showDaySeparator = !previousMessage || !isSameDay(new Date(previousMessage.createdAt), new Date(message.createdAt))
    const sameAuthorAsPrevious =
      !!previousMessage &&
      previousMessage.messageType === message.messageType &&
      previousMessage.authorSub === message.authorSub &&
      previousMessage.authorEmail === message.authorEmail &&
      isSameDay(new Date(previousMessage.createdAt), new Date(message.createdAt))
    const sameAuthorAsNext =
      !!nextMessage &&
      nextMessage.messageType === message.messageType &&
      nextMessage.authorSub === message.authorSub &&
      nextMessage.authorEmail === message.authorEmail &&
      isSameDay(new Date(nextMessage.createdAt), new Date(message.createdAt))

    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center py-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2.5 py-1 text-[10px] text-muted-foreground">
            <MessageSquare className="size-3 shrink-0" />
            {message.body}
            <span className="opacity-60">{formatMessageTime(message.createdAt)}</span>
          </span>
        </div>
      )
    }

    return (
      <div key={message.id}>
        {showDaySeparator && (
          <div className="my-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
              {formatDaySeparator(message.createdAt)}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}
        <div
          data-message-id={message.id}
          className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${sameAuthorAsNext ? 'mb-0.5' : 'mb-2.5'} ${highlightMessageId === message.id ? 'rounded-lg bg-amber-100/60 px-1 py-1 dark:bg-amber-300/15' : ''}`}
        >
          {!isOwn && (
            <div className="flex w-7 shrink-0 items-end">
              {!sameAuthorAsNext && (
                <div className={`size-7 select-none overflow-hidden rounded-full text-[10px] font-bold text-white ${getAvatarColor(message.authorSub)}`} title={message.authorEmail ?? undefined}>
                  {message.authorSub && pickAvatarUrl(avatarBySub[message.authorSub]?.urls, '64') ? (
                    <img
                      src={pickAvatarUrl(avatarBySub[message.authorSub]?.urls, '64')!}
                      alt={`Avatar de ${getDisplayName(message)}`}
                      className="size-7 object-cover"
                    />
                  ) : (
                    <div className="flex size-7 items-center justify-center">{getInitials(message)}</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className={`flex max-w-[75%] flex-col ${isOwn ? 'items-end' : 'items-start'} ${sameAuthorAsPrevious ? 'pt-0' : 'pt-0.5'}`}>
            {!isOwn && !sameAuthorAsPrevious && (
              <span className="mb-0.5 px-3 text-[11px] font-semibold text-muted-foreground">
                {getDisplayName(message)} · {getAuthorTag(message)}
                {isMentionedToCurrentUser && (
                  <span className="ml-2 inline-flex items-center rounded-full border border-amber-300/70 bg-amber-100/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                    Te menciono
                  </span>
                )}
              </span>
            )}
            <div
              className={`break-words px-3.5 py-1.5 text-sm leading-relaxed shadow-sm ${
                isOwn
                  ? sameAuthorAsPrevious
                    ? 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-t-2xl rounded-bl-2xl rounded-br-sm bg-primary text-primary-foreground'
                  : sameAuthorAsPrevious
                    ? 'rounded-2xl rounded-bl-sm bg-muted'
                    : 'rounded-t-2xl rounded-br-2xl rounded-bl-sm bg-muted'
              } ${isMentionedToCurrentUser && !isOwn ? 'bg-amber-50 ring-1 ring-amber-300/70' : ''}`}
            >
              {message.body}
            </div>
            {!sameAuthorAsNext && (
              <span className="mt-0.5 inline-flex items-center gap-1 px-1 text-[10px] text-muted-foreground" title={formatMessageDateTime(message.createdAt)}>
                {formatMessageTime(message.createdAt)}
                {isOwn && (
                  message.readStatus?.isSeen
                    ? <CheckCheck className="size-3 text-sky-500" />
                    : <Check className="size-3 text-muted-foreground" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  })
}
