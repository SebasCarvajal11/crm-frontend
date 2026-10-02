import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminUserCard } from './user-card'
import type { AdminUserRow } from '@/features/admin/model'

type MutationHandle<T> = {
  mutate: (arg: T) => void
  isPending: boolean
}

type Props = {
  items: AdminUserRow[]
  getAvatarUrl?: (id?: string | null) => string | null
  patchStatus: MutationHandle<{ subject: string; is_active: boolean }>
  patchFlags: MutationHandle<{ subject: string; force_password_change: boolean }>
  softDelete: MutationHandle<string>
  restore: MutationHandle<string>
  clearActionMessage: () => void
}

/** Componente molecular/organismo: carrusel interactivo fluido de tarjetas de usuario. */
export function UserCarousel({
  items,
  getAvatarUrl,
  patchStatus,
  patchFlags,
  softDelete,
  restore,
  clearActionMessage,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateScrollState = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const tolerance = 4
    setCanScrollLeft(el.scrollLeft > tolerance)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance)

    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : 300
    const computedIndex = Math.round(el.scrollLeft / cardWidth)
    setActiveIndex(Math.min(Math.max(0, computedIndex), Math.max(0, items.length - 1)))
  }, [items.length])

  useEffect(() => {
    updateScrollState()
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => updateScrollState()
    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [updateScrollState, items])

  const scrollByDirection = (direction: 'left' | 'right') => {
    const el = containerRef.current
    if (!el) return
    const shift = el.clientWidth * 0.75
    el.scrollBy({
      left: direction === 'left' ? -shift : shift,
      behavior: 'smooth',
    })
  }

  const scrollToIndex = (index: number) => {
    const el = containerRef.current
    if (!el) return
    const card = el.children[index] as HTMLElement | undefined
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Directorio de usuarios interactivo"
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Users className="size-3.5 text-primary" />
          <span>
            {items.length} {items.length === 1 ? 'usuario en pantalla' : 'usuarios en pantalla'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-lg shadow-2xs hover:bg-muted"
            disabled={!canScrollLeft}
            onClick={() => scrollByDirection('left')}
            aria-label="Desplazar carrusel hacia la izquierda"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-1 px-1.5">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
                onClick={() => scrollToIndex(idx)}
                aria-label={`Ir a tarjeta de ${item.email}`}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-lg shadow-2xs hover:bg-muted"
            disabled={!canScrollRight}
            onClick={() => scrollByDirection('right')}
            aria-label="Desplazar carrusel hacia la derecha"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') scrollByDirection('left')
          if (e.key === 'ArrowRight') scrollByDirection('right')
        }}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 scrollbar-thin focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
      >
        {items.map((row, index) => (
          <div
            key={row.id}
            className="w-[85vw] max-w-[340px] shrink-0 snap-start sm:w-[calc(50%-0.6rem)] sm:max-w-none lg:w-[calc(33.333%-0.75rem)] 2xl:w-[calc(25%-0.75rem)]"
          >
            <AdminUserCard
              row={row}
              index={index}
              avatarUrl={getAvatarUrl?.(row.id)}
              patchStatus={patchStatus}
              patchFlags={patchFlags}
              softDelete={softDelete}
              restore={restore}
              clearActionMessage={clearActionMessage}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
