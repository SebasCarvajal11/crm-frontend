export const TRANSIENT_NOTICE_EVENT = 'cima:transient-notice'

export type TransientNoticeDetail = {
  message: string
}

let lastNetworkNoticeAt = 0
const NETWORK_NOTICE_COOLDOWN_MS = 8_000

export function notifyTransientNotice(message: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<TransientNoticeDetail>(TRANSIENT_NOTICE_EVENT, {
      detail: { message },
    }),
  )
}

export function notifyNetworkRetry() {
  const now = Date.now()
  if (now - lastNetworkNoticeAt < NETWORK_NOTICE_COOLDOWN_MS) return
  lastNetworkNoticeAt = now
  notifyTransientNotice('Sin conexión, reintentando...')
}
