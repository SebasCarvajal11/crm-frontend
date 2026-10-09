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
  getAvatarColor?: (id?: string | null) => string | null
  patchStatus: MutationHandle<{ subject: string; is_active: boolean }>
  patchFlags: MutationHandle<{ subject: string; force_password_change: boolean }>
  softDelete: MutationHandle<string>
  restore: MutationHandle<string>
  clearActionMessage: () => void
}

import { useCarouselAutoScroll } from './use-carousel-auto-scroll'

/** Componente molecular/organismo: carrusel interactivo fluido de tarjetas de usuario. */
export function UserCarousel({
  items,
  getAvatarUrl,
  getAvatarColor,
  patchStatus,
  patchFlags,
  softDelete,
  restore,
  clearActionMessage,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)

  const pauseTemporarily = useCallback(() => {
    setIsInteracting(true)
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
    interactionTimerRef.current = setTimeout(() => {
      setIsInteracting(false)
    }, 2500)
  }, [])

  useCarouselAutoScroll({
    containerRef,
    itemCount: items.length,
    isHovered,
    isInteracting,
  })

  const updateScrollState = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const loopDistance = parseFloat(el.dataset.loopDistance || '0')
    const maxScroll = el.scrollWidth - el.clientWidth
    const tolerance = 4
    setCanScrollLeft(el.scrollLeft > tolerance || loopDistance > 0)
    setCanScrollRight(el.scrollLeft < maxScroll - tolerance || loopDistance > 0)

    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : 300
    const normalized = loopDistance > 0 ? el.scrollLeft % loopDistance : el.scrollLeft
    const computedIndex = Math.round(normalized / cardWidth)
    setActiveIndex(Math.min(Math.max(0, computedIndex), items.length - 1))
  }, [items.length])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateLoopDistance = () => {
      const copy0 = el.querySelector<HTMLElement>('[data-track-copy="0"]')
      const copy1 = el.querySelector<HTMLElement>('[data-track-copy="1"]')
      if (copy0 && copy1) {
        el.dataset.loopDistance = String(copy1.offsetLeft - copy0.offsetLeft)
      }
    }

    updateLoopDistance()
    updateScrollState()
    const handleScroll = () => updateScrollState()
    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
    }
  }, [updateScrollState, items])

  const scrollByDirection = (direction: 'left' | 'right') => {
    pauseTemporarily()
    const el = containerRef.current
    if (!el) return
    const loopDist = parseFloat(el.dataset.loopDistance || '0')
    const shift = el.clientWidth * 0.75
    if (direction === 'left' && el.scrollLeft < shift && loopDist > 0) {
      el.scrollLeft += loopDist
    }
    el.scrollBy({ left: direction === 'left' ? -shift : shift, behavior: 'smooth' })
  }

  const scrollToIndex = (index: number) => {
    pauseTemporarily()
    const el = containerRef.current
    if (!el) return
    const card = el.children[index] as HTMLElement | undefined
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    }
  }

  const isAutoScrolling = !isHovered && !isInteracting && items.length > 1

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Directorio de usuarios interactivo"
      className="space-y-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Users className="size-3.5 text-primary" />
          <span>
            {items.length} {items.length === 1 ? 'usuario en pantalla' : 'usuarios en pantalla'}
          </span>
          {items.length > 1 && (
            <span
              className={[
                'hidden sm:inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                'transition-colors duration-200',
                isAutoScrolling
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-muted text-muted-foreground',
              ].join(' ')}
              title={
                isAutoScrolling
                  ? 'Movimiento continuo activo (pasa el cursor para pausar)'
                  : 'En pausa'
              }
            >
              <span
                className={`size-1.5 rounded-full ${
                  isAutoScrolling ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                }`}
              />
              {isAutoScrolling ? 'Auto' : 'En pausa'}
            </span>
          )}
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
        onFocusCapture={() => setIsInteracting(true)}
        onBlurCapture={() => setIsInteracting(false)}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={pauseTemporarily}
        onWheel={pauseTemporarily}
        onKeyDown={(e) => {
          pauseTemporarily()
          if (e.key === 'ArrowLeft') scrollByDirection('left')
          if (e.key === 'ArrowRight') scrollByDirection('right')
        }}
        className={[
          'flex gap-4 overflow-x-auto py-2 px-1 scrollbar-thin rounded-xl select-none',
          isAutoScrolling ? 'snap-none' : 'snap-x snap-mandatory',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
        ].join(' ')}
      >
        {(items.length > 1 ? [0, 1] : [0]).map((copyIndex) =>
          items.map((row, index) => (
            <div
              key={`${row.id}-c${copyIndex}`}
              data-track-copy={index === 0 ? copyIndex : undefined}
              aria-hidden={copyIndex === 1}
              className={[
                'w-[85vw] max-w-[320px] shrink-0 snap-start sm:w-[calc(50%-0.75rem)]',
                'sm:max-w-none lg:w-[calc(33.333%-0.75rem)] 2xl:w-[calc(25%-0.75rem)]',
              ].join(' ')}
            >
              <AdminUserCard
                row={row}
                index={index}
                avatarUrl={getAvatarUrl?.(row.id)}
                avatarColor={getAvatarColor?.(row.id)}
                patchStatus={patchStatus}
                patchFlags={patchFlags}
                softDelete={softDelete}
                restore={restore}
                clearActionMessage={clearActionMessage}
              />
            </div>
          ))
        )}
      </div>

      {items.length > 1 && items.length <= 12 && (
        <div className="flex justify-center gap-1.5 pt-1" role="tablist" aria-label="Indicadores de carrusel">
          {items.map((row, idx) => (
            <button
              key={row.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Ir a tarjeta ${idx + 1}`}
              onClick={() => scrollToIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex
                  ? 'w-5 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
