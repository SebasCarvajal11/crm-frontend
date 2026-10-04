import { memo } from 'react'
import { Check, CheckCheck } from 'lucide-react'
import type { ProjectChatMessage } from '@/features/collab/model'
import { cn } from '@/shared/lib/utils'

type ChatReadReceiptProps = {
  message: ProjectChatMessage
  onOpenDetails: (messageId: string) => void
}

export const ChatReadReceipt = memo(function ChatReadReceipt({
  message,
  onOpenDetails,
}: ChatReadReceiptProps) {
  const readStatus = message.readStatus
  const seenCount = readStatus?.seenCount ?? 0
  const requiredCount = readStatus?.requiredCount ?? 0
  const isSeenByAll = readStatus?.isSeen ?? false

  const isFullySeen = isSeenByAll || (requiredCount > 0 && seenCount >= requiredCount)
  const isPartiallySeen = seenCount > 0 && !isFullySeen

  let title = 'Enviado'
  if (isFullySeen) {
    title = `Leído por todos (${seenCount}/${requiredCount})`
  } else if (isPartiallySeen) {
    title = `Leído por ${seenCount} de ${requiredCount}`
  }

  return (
    <button
      type="button"
      data-testid="chat-read-receipt-btn"
      data-seen-state={isFullySeen ? 'fully-seen' : isPartiallySeen ? 'partially-seen' : 'sent'}
      onClick={(e) => {
        e.stopPropagation()
        onOpenDetails(message.id)
      }}
      className={cn(
        'inline-flex items-center gap-0.5 rounded p-0.5 transition-colors',
        'hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
      )}
      title={`${title} · Ver quién ha leído`}
      aria-label={`Estado de lectura: ${title}. Clic para ver detalles`}
    >
      {isFullySeen ? (
        <CheckCheck
          className="size-3 text-sky-500 animate-read-receipt-morph transition-colors"
        />
      ) : isPartiallySeen ? (
        <CheckCheck
          className="size-3 text-muted-foreground animate-read-receipt-morph transition-colors"
        />
      ) : (
        <Check className="size-3 text-muted-foreground transition-colors" />
      )}
    </button>
  )
})
