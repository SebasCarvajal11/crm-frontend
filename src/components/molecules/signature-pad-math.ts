export type TimedPoint = {
  x: number
  y: number
  time: number
  pressure?: number
}

export const MIN_STROKE_WIDTH = 1.3
export const MAX_STROKE_WIDTH = 3.8
export const DEFAULT_STROKE_WIDTH = 2.4
export const VELOCITY_WEIGHT = 1.4
export const SMOOTHING_FACTOR = 0.65

export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}

export function calculateVelocity(from: TimedPoint, to: TimedPoint): number {
  const dt = Math.max(to.time - from.time, 10)
  const dist = calculateDistance(from, to)
  return dist / dt
}

export function calculateTaperedStrokeWidth(
  velocity: number,
  prevWidth: number,
  pressure?: number
): number {
  const velocityDrop = velocity * VELOCITY_WEIGHT
  let rawWidth = Math.max(
    MIN_STROKE_WIDTH,
    Math.min(MAX_STROKE_WIDTH, MAX_STROKE_WIDTH - velocityDrop)
  )

  if (typeof pressure === 'number' && pressure > 0) {
    const pressureScale = 0.5 + Math.min(pressure, 1) * 0.8
    rawWidth = Math.max(
      MIN_STROKE_WIDTH,
      Math.min(MAX_STROKE_WIDTH, rawWidth * pressureScale)
    )
  }

  return Number(
    (prevWidth * SMOOTHING_FACTOR + rawWidth * (1 - SMOOTHING_FACTOR)).toFixed(2)
  )
}
