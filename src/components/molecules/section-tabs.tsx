import type { ReactNode } from 'react'

export type SectionTabItem<T extends string> = {
  value: T
  label: string
  icon: ReactNode
}

type SectionTabsProps<T extends string> = {
  items: readonly SectionTabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  ariaLabel: string
  getPanelId?: (value: T) => string
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
}: SectionTabsProps<T>) {
  return (
    <div
      className="flex items-center gap-1 overflow-x-auto rounded-2xl border bg-card p-1 shadow-sm scrollbar-thin"
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((tab) => {
        const isActive = value === tab.value

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={getPanelId?.(tab.value)}
            onClick={() => onValueChange(tab.value)}
            className={[
              'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
