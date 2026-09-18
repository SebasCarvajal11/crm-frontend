import { memo } from 'react'

type Props = {
  typers: string[]
}

function formatTypingLabel(typers: string[]): string {
  if (typers.length === 1) return `${typers[0]} está escribiendo…`
  if (typers.length === 2) return `${typers[0]} y ${typers[1]} están escribiendo…`
  return 'Varios participantes están escribiendo…'
}

export const ChatTypingIndicator = memo(function ChatTypingIndicator({ typers }: Props) {
  if (typers.length === 0) return null

  return (
    <div
      className="mb-1.5 flex items-center gap-2 px-1 text-xs text-muted-foreground animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-0.5">
        <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" />
      </span>
      <span className="font-medium text-foreground/80">{formatTypingLabel(typers)}</span>
    </div>
  )
})
