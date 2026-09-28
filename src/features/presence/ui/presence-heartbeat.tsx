import { useEffect } from 'react'
import { useSessionStore } from '@/app/session/session-store'
import { observeOwnPresence } from '../api/presence-api'
import { browserAvailable } from '../hooks/use-browser-availability'
import { createHeartbeatLoop } from '../model/heartbeat-loop'

/** Local tab coordination reuses Web Locks; no server push or persistent token is involved. */
export function PresenceHeartbeat({ owner }: { owner: string }) {
  useEffect(() => {
    const key = `cima_presence_signal:${owner}`
    const send = async (signal: AbortSignal) => {
      const attempt = async () => {
        if (signal.aborted || !useSessionStore.getState().token || !browserAvailable()) return 60_000
        try {
          const last = Number(localStorage.getItem(key))
          const elapsed = Date.now() - last
          if (last > 0 && elapsed >= 0 && elapsed < 55_000) return 60_000 - elapsed
        } catch { /* The server also limits repeated writes when storage is restricted. */ }
        const interval = await observeOwnPresence(signal)
        if (!signal.aborted) {
          try { localStorage.setItem(key, String(Date.now())) } catch { /* Optional coordination. */ }
        }
        return interval
      }
      return navigator.locks ? navigator.locks.request(key, { signal }, attempt) : attempt()
    }
    const loop = createHeartbeatLoop(send, browserAvailable)
    const wake = () => loop.wake()
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('online', wake)
    window.addEventListener('offline', wake)
    return () => {
      loop.stop()
      document.removeEventListener('visibilitychange', wake)
      window.removeEventListener('online', wake)
      window.removeEventListener('offline', wake)
    }
  }, [owner])
  return null
}
