import { useRef, useState, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'

type SignaturePadProps = {
  onChange: (value: string | null) => void
  className?: string
}

type Point = { x: number; y: number }

export function SignaturePad({ onChange, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)
  const [hasSignature, setHasSignature] = useState(false)

  const getCanvasPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }, [])

  const drawLine = useCallback((from: Point, to: Point) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#171717'
    ctx.stroke()
  }, [])

  const drawDot = useCallback((p: Point) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2)
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
    drawDot(current)
    setHasSignature(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const next = getCanvasPoint(event)
    if (lastPointRef.current) {
      drawLine(lastPointRef.current, next)
    }
    lastPointRef.current = next
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastPointRef.current = null
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
          className="h-32 w-full touch-none cursor-crosshair"
          aria-label="Área para firma electrónica del contrato"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3 text-muted-foreground/50">
            <div className="border-b border-dashed border-muted-foreground/30 pb-1 flex items-center gap-2">
              <span className="text-xs font-semibold select-none">✕</span>
              <span className="text-[11px] select-none">Firme aquí con el dedo o mouse</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Firma manuscrita válida para evidencia digital.</p>
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
