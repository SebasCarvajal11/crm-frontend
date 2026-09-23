import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTourStore } from '../model/tour-store'

type TourBeaconProps = {
  missionId: string
  title: string
  description: string
  onStartMission: () => void
  className?: string
}

export function TourBeacon({
  missionId,
  title,
  description,
  onStartMission,
  className = '',
}: TourBeaconProps) {
  const isCompleted = useTourStore((s) => s.isTourCompleted(missionId))
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen])

  if (isCompleted) return null

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Baliza con pulso visual sutil no bloqueante */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Ver guía contextual: ${title}`}
        title={`Guía disponible: ${title}`}
        className="relative flex size-5 items-center justify-center rounded-full cursor-pointer focus:outline-hidden"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-primary shadow-xs" />
      </button>

      {/* Popover flotante ligero sin oscurecer pantalla */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={title}
          className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border
            border-border/80 bg-popover p-3 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
              <Sparkles className="size-3.5" />
              <span>Guía sugerida</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Cerrar sugerencia"
            >
              <X className="size-3" />
            </button>
          </div>

          <h4 className="mt-1 text-xs font-semibold text-foreground">{title}</h4>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>

          <div className="mt-2.5 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsOpen(false)
                onStartMission()
              }}
              className="h-6 text-[10px] gap-1 px-2 font-medium bg-primary text-primary-foreground cursor-pointer"
            >
              <Play className="size-2.5 fill-current" />
              Iniciar Guía
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
