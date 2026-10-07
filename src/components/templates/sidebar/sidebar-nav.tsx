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
    <nav
      className="flex-1 space-y-2 lg:space-y-2.5 overflow-y-auto px-3.5 py-4 scrollbar-thin"
      aria-label="Navegacion principal"
      data-tour="sidebar-nav"
    >
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
              ? cn(
                  'bg-white/18 text-white backdrop-blur-xs font-bold',
                  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.28)]',
                )
              : 'text-white/75 hover:bg-white/10 hover:text-white',
            compact && 'justify-center px-2.5'
          )}
        >
          <span
            className="shrink-0 transition-transform duration-150 group-hover:scale-105"
            aria-hidden="true"
          >
            {item.icon}
          </span>
          {!compact && <span className="truncate">{item.label}</span>}
          {item.isActive && (
            <span
              className={cn(
                'ml-auto inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-white',
                'shadow-[0_0_10px_rgba(255,255,255,0.95)] ring-2 ring-white/35',
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
