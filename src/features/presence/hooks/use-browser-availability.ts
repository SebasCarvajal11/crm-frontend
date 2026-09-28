import { useEffect, useState } from 'react'

export const browserAvailable = () => document.visibilityState === 'visible' && navigator.onLine
export function useBrowserAvailability() {
  const [available, setAvailable] = useState(browserAvailable)
  useEffect(() => {
    const update = () => setAvailable(browserAvailable())
    document.addEventListener('visibilitychange', update)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return available
}
