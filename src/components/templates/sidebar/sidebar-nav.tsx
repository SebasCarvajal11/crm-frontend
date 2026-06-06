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
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navegacion principal">
      {filteredItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => {
            item.onClick()
            onItemClick()
          }}
          aria-current={item.isActive ? 'page' : undefined}
          className={cn(
            navItemBaseClass,
            item.isActive
              ? 'bg-primary-foreground/14 text-primary-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
              : 'text-primary-foreground/72 hover:bg-primary-foreground/9 hover:text-primary-foreground',
            compact && 'justify-center px-2.5'
          )}
        >
          <span className="shrink-0" aria-hidden="true">{item.icon}</span>
          {!compact && <span className="truncate">{item.label}</span>}
          {item.isActive && (
            <span
              className={cn(
                'ml-auto inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground',
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
