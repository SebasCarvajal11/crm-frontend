import { useState, useEffect, useRef } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, X, Type } from 'lucide-react'
import { useAccessibilityZoom } from '@/features/accessibility/hooks/use-accessibility-zoom'
import { Button } from '@/components/ui/button'

export function AccessibilityZoomWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    percentage,
    isDefault,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useAccessibilityZoom()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <aside
      ref={containerRef}
      role="region"
      aria-label="Controles de accesibilidad y zoom visual"
      style={{ zoom: 1 }}
      className="fixed bottom-5 right-5 z-50 flex items-center select-none"
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-label={`Ajustar zoom visual. Escala actual: ${percentage}%`}
          title={`Accesibilidad: Zoom (${percentage}%)`}
          data-testid="zoom-widget-trigger"
          className="relative flex h-11 w-11 items-center justify-center rounded-full
            bg-card/95 text-card-foreground border border-border/80 shadow-md backdrop-blur-md
            transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:shadow-lg
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <Type className="size-4 text-foreground/90" />
          {!isDefault && (
            <span
              data-testid="zoom-active-badge"
              className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center
                rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs"
            >
              {percentage}%
            </span>
          )}
        </button>
      ) : (
        <div
          role="toolbar"
          aria-label="Herramientas de escala visual"
          data-testid="zoom-widget-toolbar"
          className="flex items-center gap-1.5 rounded-full border border-border/80
            bg-card/95 p-1.5 shadow-xl backdrop-blur-md transition-all duration-200"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={zoomOut}
            disabled={!canZoomOut}
            aria-label="Reducir zoom visual"
            title="Reducir zoom"
            data-testid="zoom-out-btn"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <ZoomOut className="size-4" />
          </Button>

          <button
            type="button"
            onClick={resetZoom}
            aria-label={`Escala ${percentage}%. Presione para restablecer a 100%`}
            title="Clic para restablecer al 100%"
            data-testid="zoom-percentage-btn"
            className="flex min-w-14 items-center justify-center rounded-md px-1.5 py-1
              text-xs font-semibold tracking-wide text-foreground transition-colors
              hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {percentage}%
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={zoomIn}
            disabled={!canZoomIn}
            aria-label="Aumentar zoom visual"
            title="Aumentar zoom"
            data-testid="zoom-in-btn"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <ZoomIn className="size-4" />
          </Button>

          {!isDefault && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={resetZoom}
              aria-label="Restablecer zoom a 100%"
              title="Restablecer a 100%"
              data-testid="zoom-reset-btn"
              className="rounded-full text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          )}

          <div className="mx-0.5 h-4 w-px bg-border/80" aria-hidden="true" />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar barra de accesibilidad"
            title="Cerrar (Esc)"
            data-testid="zoom-close-btn"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </aside>
  )
}
