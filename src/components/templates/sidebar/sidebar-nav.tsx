import { useMemo } from 'react'
import { cn } from '@/shared/lib/utils'
import type { SidebarItem } from './types'
import { navItemBaseClass, visibleItems } from './utils'

export function SidebarNav({
  items,
  compact = false,
  onItemClick,
}: {
  items: SidebarItem[]
  compact?: boolean
  onItemClick: () => void
}) {
  const filteredItems = useMemo(() => visibleItems(items), [items])

  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 scrollbar-thin" aria-label="Navegacion principal" data-tour="sidebar-nav">
      {filteredItems.map((item) => (
        <button
          key={item.key}
          type="button"
          data-tour={`sidebar-tab-${item.key}`}
          onMouseEnter={item.onMouseEnter}
          onFocus={item.onMouseEnter}
          onClick={() => {
            item.onClick()
            onItemClick()
          }}
          title={compact ? item.label : undefined}
          aria-label={item.label}
          aria-current={item.isActive ? 'page' : undefined}
          className={cn(
            navItemBaseClass,
            item.isActive
              ? 'bg-white/18 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_2px_4px_rgba(0,0,0,0.25)] font-semibold backdrop-blur-xs'
              : 'text-white/75 hover:bg-white/10 hover:text-white',
            compact && 'justify-center px-2.5'
          )}
        >
          <span className="shrink-0 transition-transform duration-150 group-hover:scale-105" aria-hidden="true">{item.icon}</span>
          {!compact && <span className="truncate">{item.label}</span>}
          {item.isActive && (
            <span
              className={cn(
                'ml-auto inline-block h-2 w-2 shrink-0 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] ring-2 ring-white/30',
                compact && 'absolute -right-1 top-1/2 -translate-y-1/2'
              )}
              aria-hidden="true"
            />
          )}
        </button>
      ))}
    </nav>
  )
}
