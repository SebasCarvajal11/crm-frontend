import { type ReactNode, useRef, useEffect } from 'react'

export type SectionTabItem<T extends string> = {
  value: T
  label: string
  icon: ReactNode
  badge?: ReactNode
}

type SectionTabsProps<T extends string> = {
  items: readonly SectionTabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  ariaLabel: string
  getPanelId?: (value: T) => string
  itemRole?: 'tab' | 'button'
}

/**
 * Navegación secundaria compartida para espacios de trabajo y módulos.
 * El desbordamiento horizontal conserva el acceso a todas las secciones en móvil.
 */
export function SectionTabs<T extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  getPanelId,
  itemRole = 'tab',
}: SectionTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const activeEl = containerRef.current.querySelector<HTMLElement>(`[data-tour="workspace-tab-${value}"]`)
    if (activeEl) {
      const container = containerRef.current
      const cRect = container.getBoundingClientRect()
      const elRect = activeEl.getBoundingClientRect()
      const relLeft = elRect.left - cRect.left + container.scrollLeft
      const targetScroll = relLeft - (container.clientWidth - elRect.width) / 2
      const maxScroll = container.scrollWidth - container.clientWidth
      container.scrollTo({
        left: Math.max(0, Math.min(targetScroll, maxScroll)),
        behavior: 'auto',
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1 overflow-x-auto rounded-2xl border bg-card p-1 pr-6 shadow-sm scrollbar-thin"
      role={itemRole === 'button' ? 'toolbar' : 'tablist'}
      aria-label={ariaLabel}
    >
      {items.map((tab) => {
        const isActive = value === tab.value

        return (
          <button
            key={tab.value}
            type="button"
            data-tour={`workspace-tab-${tab.value}`}
            role={itemRole === 'button' ? undefined : 'tab'}
            aria-selected={itemRole === 'tab' ? isActive : undefined}
            aria-pressed={itemRole === 'button' ? isActive : undefined}
            aria-controls={itemRole === 'tab' ? getPanelId?.(tab.value) : undefined}
            onClick={() => onValueChange(tab.value)}
            className={[
              'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium',
              'transition-all duration-200 ease-out cursor-pointer active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            ].join(' ')}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && <span className="ml-1 inline-flex items-center">{tab.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
