import { cn } from '@/shared/lib/utils'

export type MentionSuggestion = {
  key: string
  value: string
  label: string
}

type Props = {
  suggestions: MentionSuggestion[]
  activeIdx: number
  onApply: (value: string) => void
}

/** Menú flotante de autocompletado y sugerencias de menciones (@usuario o @rol). */
export function ChatMentionSuggestions({ suggestions, activeIdx, onApply }: Props) {
  if (suggestions.length === 0) return null

  return (
    <div
      className={cn(
        'absolute bottom-full left-0 right-[52px] z-20 mb-1 max-h-40',
        'overflow-y-auto rounded-xl border bg-popover shadow-md'
      )}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion.key}
          type="button"
          onMouseDown={(event) => {
            event.preventDefault()
            onApply(suggestion.value)
          }}
          className={cn(
            'w-full rounded-lg px-2.5 py-1.5 text-left text-xs',
            index === activeIdx
              ? 'bg-accent text-accent-foreground font-medium'
              : 'hover:bg-muted'
          )}
        >
          @{suggestion.value}{' '}
          <span className="text-muted-foreground">{suggestion.label}</span>
        </button>
      ))}
    </div>
  )
}
