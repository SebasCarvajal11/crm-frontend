import { useEffect, useState } from 'react'

function readViewport() {
  const viewport = window.visualViewport
  return { top: viewport?.offsetTop ?? 0, height: viewport?.height ?? innerHeight,
    width: viewport?.width ?? innerWidth }
}
export function useVisibleViewport() {
  const [viewport, setViewport] = useState(readViewport)
  useEffect(() => {
    const update = () => setViewport(readViewport())
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [])
  return viewport
}
