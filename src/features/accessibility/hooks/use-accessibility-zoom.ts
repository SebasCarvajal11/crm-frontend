import { useState, useEffect, useCallback, useMemo } from 'react'

export const ZOOM_STORAGE_KEY = 'cima_ui_zoom'
export const DEFAULT_ZOOM = 1.0
export const MIN_ZOOM = 0.8
export const MOBILE_MAX_ZOOM = 1.5
export const DESKTOP_MAX_ZOOM = 2.0
export const ZOOM_STEPS = [0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0] as const

export type ZoomLevel = typeof ZOOM_STEPS[number]

export function applyDocumentZoom(level: number): void {
  if (typeof document === 'undefined') return
  const clamped = Math.max(MIN_ZOOM, Math.min(DESKTOP_MAX_ZOOM, level))
  document.documentElement.style.zoom = String(clamped)
  document.documentElement.style.setProperty('--app-zoom', String(clamped))
}

export function getStoredZoom(): number {
  if (typeof window === 'undefined') return DEFAULT_ZOOM
  try {
    const raw = window.localStorage.getItem(ZOOM_STORAGE_KEY)
    if (!raw) return DEFAULT_ZOOM
    const parsed = parseFloat(raw)
    return isNaN(parsed) ? DEFAULT_ZOOM : parsed
  } catch {
    return DEFAULT_ZOOM
  }
}

export function persistZoom(level: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ZOOM_STORAGE_KEY, String(level))
  } catch {
    // LocalStorage inaccessible
  }
}

export function findClosestZoomStep(current: number): number {
  return ZOOM_STEPS.reduce((prev, curr) =>
    Math.abs(curr - current) < Math.abs(prev - current) ? curr : prev
  )
}

export function useAccessibilityZoom() {
  const [zoomLevel, setZoomLevelState] = useState<number>(() => {
    const initial = getStoredZoom()
    return findClosestZoomStep(initial)
  })

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxAllowedZoom = isMobile ? MOBILE_MAX_ZOOM : DESKTOP_MAX_ZOOM

  const applyAndPersist = useCallback((level: number) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(maxAllowedZoom, level))
    const step = findClosestZoomStep(clamped)
    setZoomLevelState(step)
    applyDocumentZoom(step)
    persistZoom(step)
  }, [maxAllowedZoom])

  useEffect(() => {
    applyDocumentZoom(zoomLevel)
  }, [zoomLevel])

  const currentIndex = useMemo(() => {
    const idx = ZOOM_STEPS.findIndex((s) => Math.abs(s - zoomLevel) < 0.001)
    return idx === -1 ? ZOOM_STEPS.indexOf(1.0) : idx
  }, [zoomLevel])

  const maxAllowedIndex = useMemo(() => {
    return ZOOM_STEPS.findIndex((s) => Math.abs(s - maxAllowedZoom) < 0.001)
  }, [maxAllowedZoom])

  const canZoomIn = currentIndex < maxAllowedIndex
  const canZoomOut = currentIndex > 0
  const isDefault = Math.abs(zoomLevel - DEFAULT_ZOOM) < 0.001
  const percentage = Math.round(zoomLevel * 100)

  const zoomIn = useCallback(() => {
    if (!canZoomIn) return
    const nextStep = ZOOM_STEPS[currentIndex + 1]
    if (nextStep !== undefined) applyAndPersist(nextStep)
  }, [canZoomIn, currentIndex, applyAndPersist])

  const zoomOut = useCallback(() => {
    if (!canZoomOut) return
    const prevStep = ZOOM_STEPS[currentIndex - 1]
    if (prevStep !== undefined) applyAndPersist(prevStep)
  }, [canZoomOut, currentIndex, applyAndPersist])

  const resetZoom = useCallback(() => {
    applyAndPersist(DEFAULT_ZOOM)
  }, [applyAndPersist])

  return {
    zoomLevel,
    percentage,
    isDefault,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom: applyAndPersist,
  }
}
