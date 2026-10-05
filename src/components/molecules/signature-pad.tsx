import { useRef, useState, useCallback, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  DEFAULT_STROKE_WIDTH,
  calculateVelocity,
  calculateTaperedStrokeWidth,
  type TimedPoint,
} from './signature-pad-math'

type SignaturePadProps = {
  onChange: (value: string | null) => void
  className?: string
}

export function SignaturePad({ onChange, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<TimedPoint | null>(null)
  const lastWidthRef = useRef<number>(DEFAULT_STROKE_WIDTH)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return

    const syncResolution = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetWidth = Math.round(rect.width * dpr)
      const targetHeight = Math.round(rect.height * dpr)
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth
        canvas.height = targetHeight
      }
    }

    syncResolution()
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(syncResolution)
      observer.observe(canvas)
      return () => observer.disconnect()
    }
  }, [])

  const getCanvasPoint = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): TimedPoint => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height),
        time: event.timeStamp || Date.now(),
        pressure: event.pressure > 0 ? event.pressure : undefined,
      }
    },
    []
  )

  const drawSegment = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }, width: number) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = width
      ctx.strokeStyle = '#171717'
      ctx.stroke()
    },
    []
  )

  const drawDot = useCallback((p: { x: number; y: number }, radius: number) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#171717'
    ctx.fill()
  }, [])

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // safe fallback
    }
    const current = getCanvasPoint(event)
    drawingRef.current = true
    lastPointRef.current = current
    lastWidthRef.current = DEFAULT_STROKE_WIDTH
    drawDot(current, DEFAULT_STROKE_WIDTH / 2)
    setHasSignature(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPointRef.current) return
    const next = getCanvasPoint(event)
    const velocity = calculateVelocity(lastPointRef.current, next)
    const strokeWidth = calculateTaperedStrokeWidth(
      velocity,
      lastWidthRef.current,
      next.pressure
    )

    drawSegment(lastPointRef.current, next, strokeWidth)
    lastPointRef.current = next
    lastWidthRef.current = strokeWidth
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastPointRef.current = null
    lastWidthRef.current = DEFAULT_STROKE_WIDTH
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // safe fallback
    }
    onChange(canvasRef.current?.toDataURL('image/png') ?? null)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    lastPointRef.current = null
    lastWidthRef.current = DEFAULT_STROKE_WIDTH
    setHasSignature(false)
    onChange(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative rounded-lg border border-border bg-white shadow-xs overflow-hidden">
        <canvas
          ref={canvasRef}
          width={720}
          height={180}
          data-testid="signature-canvas"
          className="h-32 w-full touch-none cursor-crosshair"
          aria-label="Área para firma electrónica del contrato con tinta dinámica"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3 text-muted-foreground/50">
            <div className="border-b border-dashed border-muted-foreground/30 pb-1 flex items-center gap-2">
              <span className="text-xs font-semibold select-none">✕</span>
              <span className="text-[11px] select-none">
                Firme aquí con el dedo, lápiz digital o mouse
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Firma manuscrita con tinta dinámica válida para evidencia digital.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!hasSignature}
          className="gap-1 text-xs"
        >
          <RotateCcw className="size-3.5" />
          Limpiar firma
        </Button>
      </div>
    </div>
  )
}
