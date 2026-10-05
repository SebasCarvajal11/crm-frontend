import { cn } from '@/shared/lib/utils'
import { PRESENCE_TAB_OPTIONS, type PresenceTabKey } from '../model/presence'

export type { PresenceTabKey }

type SegmentedTabsProps = {
  activeTab: PresenceTabKey
  onChange: (tab: PresenceTabKey) => void
  counts: Record<PresenceTabKey, number>
}

function SegmentedTabButton({
  id,
  label,
  count,
  isActive,
  onClick,
}: {
  id: string
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      key={id}
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1 py-1 px-1 sm:px-1.5 rounded-lg',
        'text-[11px] sm:text-xs transition-all min-w-0',
        isActive
          ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/50'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <span className="truncate">{label}</span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums shrink-0',
          isActive ? 'bg-primary/10 text-primary font-bold' : 'bg-muted/70 text-muted-foreground'
        )}
      >
        {count}
      </span>
    </button>
  )
}

export function SegmentedTabs({ activeTab, onChange, counts }: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtro de perfiles de presencia"
      className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border/40"
    >
      {PRESENCE_TAB_OPTIONS.map((tab) => (
        <SegmentedTabButton
          key={tab.id}
          id={tab.id}
          label={tab.label}
          count={counts[tab.id]}
          isActive={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        />
      ))}
    </div>
  )
}
