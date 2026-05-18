import { useEffect, useState } from 'react'
import { TRANSIENT_NOTICE_EVENT, type TransientNoticeDetail } from '@/shared/lib/transient-notice'

export function TransientNoticeHost() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const onNotice = (event: Event) => {
      const detail = (event as CustomEvent<TransientNoticeDetail>).detail
      if (!detail?.message) return
      setMessage(detail.message)
    }

    window.addEventListener(TRANSIENT_NOTICE_EVENT, onNotice)
    return () => window.removeEventListener(TRANSIENT_NOTICE_EVENT, onNotice)
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4_000)
    return () => window.clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg"
    >
      {message}
    </div>
  )
}
