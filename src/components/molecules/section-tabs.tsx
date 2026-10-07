import {
  type ReactNode,
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react'
import { usePrefersReducedMotion } from '@/shared/hooks'
import {
  type PillGeometry,
  measurePillGeometry,
  centerActiveTab,
  handleTabKeyNavigation,
} from './section-tabs-utils'

export type SectionTabItem<T extends string> = {
  value: T
  label: string
  icon: ReactNode
  badge?: ReactNode
}

export type SectionTabsProps<T extends string> = {
  items: readonly SectionTabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  ariaLabel: string
  getPanelId?: (value: T) => string
  itemRole?: 'tab' | 'button'
  dataTourPrefix?: string
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect


interface UseSlidingPillOptions<T extends string> {
  containerRef: React.RefObject<HTMLDivElement | null>
  activeValue: T
  items: readonly SectionTabItem<T>[]
}

function useSlidingPill<T extends string>({
  containerRef,
  activeValue,
  items,
}: UseSlidingPillOptions<T>) {
  const [pillRect, setPillRect] = useState<PillGeometry | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)
  const tabRefs = useRef<Map<T, HTMLButtonElement>>(new Map())
  const isFirstMount = useRef(true)
  const reducedMotion = usePrefersReducedMotion()

  const updatePill = useCallback(
    (animate: boolean, scrollBehavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current
      const target = tabRefs.current.get(activeValue)
      if (!container || !target) {
        setPillRect(null)
        setIsReady(false)
        return
      }

      const geom = measurePillGeometry(container, target)
      if (geom) {
        setIsAnimated(animate)
        setPillRect(geom)
        setIsReady(true)
        const effectiveScroll = reducedMotion ? 'auto' : scrollBehavior
        centerActiveTab(container, geom.x, geom.width, effectiveScroll)
      } else {
        setPillRect(null)
        setIsReady(false)
      }
    },
    [containerRef, activeValue, reducedMotion],
  )

  useIsomorphicLayoutEffect(() => {
    if (isFirstMount.current) {
      updatePill(false, 'auto')
      const rafId = requestAnimationFrame(() => {
        isFirstMount.current = false
        setIsAnimated(true)
      })
      return () => cancelAnimationFrame(rafId)
    }
    updatePill(true, 'smooth')
  }, [activeValue, items, updatePill])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      updatePill(false, 'auto')
      requestAnimationFrame(() => {
        if (!isFirstMount.current) setIsAnimated(true)
      })
    })

    ro.observe(container)
    tabRefs.current.forEach((button) => {
      if (button) ro.observe(button)
    })

    return () => ro.disconnect()
  }, [containerRef, activeValue, items, updatePill])

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts?.ready) return
    document.fonts.ready.then(() => updatePill(false, 'auto'))
  }, [updatePill])

  const registerTabRef = useCallback(
    (val: T) => (el: HTMLButtonElement | null) => {
      if (el) tabRefs.current.set(val, el)
      else tabRefs.current.delete(val)
    },
    [],
  )

  return {
    pillRect,
    isReady,
    isAnimated: isAnimated && !reducedMotion,
    registerTabRef,
    tabRefs,
  }
}

interface SectionTabPillProps {
  geometry: PillGeometry | null
  isReady: boolean
  isAnimated: boolean
}

function SectionTabPill({
  geometry,
  isReady,
  isAnimated,
}: SectionTabPillProps) {
  if (!geometry) return null

  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute top-0 left-0 rounded-xl bg-primary shadow-xs',
        isAnimated
          ? 'transition-[transform,width] duration-200 ' +
            'ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none'
          : 'transition-none',
        isReady ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      style={{
        transform: `translate3d(${geometry.x}px, ${geometry.y}px, 0)`,
        width: `${geometry.width}px`,
        height: `${geometry.height}px`,
        willChange: isAnimated ? 'transform, width' : 'auto',
      }}
    />
  )
}

/**
 * Navegación secundaria compartida con píldora deslizante fluida (GPU transform).
 * Desbordamiento horizontal fluido y centrado ergonómico en todos los viewports.
 */
export function SectionTabs<T extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  getPanelId,
  itemRole = 'tab',
  dataTourPrefix = 'workspace-tab',
}: SectionTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { pillRect, isReady, isAnimated, registerTabRef, tabRefs } =
    useSlidingPill({
      containerRef,
      activeValue: value,
      items,
    })

  return (
    <div
      ref={containerRef}
      className={[
        'relative flex items-center gap-1.5 overflow-x-auto rounded-2xl',
        'border bg-card p-1.5 shadow-xs scrollbar-none',
      ].join(' ')}
      role={itemRole === 'button' ? 'toolbar' : 'tablist'}
      aria-label={ariaLabel}
    >
      <SectionTabPill
        geometry={pillRect}
        isReady={isReady}
        isAnimated={isAnimated}
      />

      {items.map((tab, idx) => {
        const isActive = value === tab.value

        return (
          <button
            key={tab.value}
            ref={registerTabRef(tab.value)}
            type="button"
            data-tour={`${dataTourPrefix}-${tab.value}`}
            data-state={isActive ? 'active' : 'inactive'}
            role={itemRole === 'button' ? undefined : 'tab'}
            aria-selected={itemRole === 'tab' ? isActive : undefined}
            aria-pressed={itemRole === 'button' ? isActive : undefined}
            aria-controls={itemRole === 'tab' ? getPanelId?.(tab.value) : undefined}
            tabIndex={itemRole === 'tab' ? (isActive ? 0 : -1) : 0}
            onClick={() => onValueChange(tab.value)}
            onKeyDown={(e) =>
              handleTabKeyNavigation({
                event: e,
                currentIndex: idx,
                items,
                tabRefs: tabRefs.current,
                onSelect: onValueChange,
              })
            }
            className={[
              'relative z-10 flex shrink-0 items-center gap-2 whitespace-nowrap',
              'rounded-xl px-3.5 py-2 text-sm font-medium',
              'transition-colors duration-200 ease-out cursor-pointer active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
              isActive
                ? 'text-primary-foreground shadow-none'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            ].join(' ')}
          >
            <span aria-hidden="true" className="shrink-0">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && <span className="ml-1 inline-flex items-center">{tab.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
