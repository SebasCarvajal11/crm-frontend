import { useSyncExternalStore } from 'react'

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot(): boolean {
  return false
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  )
}
