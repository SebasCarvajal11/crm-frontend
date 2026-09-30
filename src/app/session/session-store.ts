import { create } from 'zustand'
import { AUTH_ROUTES, IDENTITY_ROUTES } from '@/shared/lib/gateway-routes'

const TOKEN_KEY = 'cima_access_token'
const EMAIL_KEY = 'cima_user_email'
const CHANNEL_NAME = 'cima_session_channel'

type StoredSession = {
  token: string | null
  email: string | null
}

type SessionState = StoredSession & {
  bootstrapped: boolean
  setSession: (token: string, email?: string | null) => void
  clearSession: () => void
  setBootstrapped: (value: boolean) => void
  syncFromStorage: () => void
}

type SessionMessage = { type: 'SESSION_CLEAR' }

let bootstrapInFlight: Promise<void> | null = null
let sessionChannel: BroadcastChannel | null = null

function getSessionChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null
  }
  if (!sessionChannel) {
    sessionChannel = new BroadcastChannel(CHANNEL_NAME)
  }
  return sessionChannel
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
}

/**
 * ADR-008: El Access Token debe residir ÚNICAMENTE en la memoria volátil de Zustand.
 * Se prohíbe persistir tokens en localStorage o sessionStorage.
 * Para compatibilidad controlada con pruebas automatizadas (Playwright),
 * se lee una única vez si sessionStorage fue precargado por el arnés de test.
 */
function readInitialSession(): StoredSession {
  if (!canUseStorage()) {
    return { token: null, email: null }
  }
  return {
    token: sessionStorage.getItem(TOKEN_KEY),
    email: sessionStorage.getItem(EMAIL_KEY),
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  ...readInitialSession(),
  bootstrapped: false,
  setSession: (token, email = null) => {
    // ADR-008: Asegurar que nunca se persista el token en storage
    if (canUseStorage()) {
      sessionStorage.removeItem(TOKEN_KEY)
    }
    set({ token, email: email ?? null })
  },
  clearSession: () => {
    if (canUseStorage()) {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(EMAIL_KEY)
    }
    bootstrapInFlight = null
    set({ token: null, email: null })
    const channel = getSessionChannel()
    if (channel) {
      channel.postMessage({ type: 'SESSION_CLEAR' })
    }
  },
  setBootstrapped: (value) => set({ bootstrapped: value }),
  syncFromStorage: () => {
    if (canUseStorage()) {
      const token = sessionStorage.getItem(TOKEN_KEY)
      const email = sessionStorage.getItem(EMAIL_KEY)
      if (token && !useSessionStore.getState().token) {
        set({ token, email })
      }
    }
  },
}))

// Listener a nivel de módulo para reaccionar a cierres de sesión en otras pestañas
const globalChannel = getSessionChannel()
if (globalChannel) {
  globalChannel.onmessage = (event: MessageEvent<SessionMessage>) => {
    if (event.data?.type === 'SESSION_CLEAR') {
      bootstrapInFlight = null
      useSessionStore.setState({ token: null, email: null })
    }
  }
}

// Exponer store de Zustand en window / globalThis para arnés de pruebas Playwright E2E (ADR-008)
const globalRef = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : null
if (globalRef) {
  (globalRef as unknown as { __zustandSessionStore?: typeof useSessionStore }).__zustandSessionStore = useSessionStore
}

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  return base.replace(/\/$/, '')
}

export function canUseSecureRefreshFlow(isDev: boolean = import.meta.env.DEV): boolean {
  if (typeof window === 'undefined') return true

  const { protocol, hostname } = window.location
  if (protocol === 'https:') return true
  if (isDev) return true
  if (import.meta.env.VITE_ALLOW_HTTP_REFRESH === 'true') return true

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true

  // Soporte para despliegues por IP directa previos a la delegación de dominio HTTPS
  const isIpv4 = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(hostname)
  if (isIpv4) return true

  return false
}

/**
 * ADR-008: Coordinación de sesión multi-pestaña mediante Web Locks API.
 * Una sola pestaña ejecuta el refresh a la vez con la cookie HttpOnly.
 */
export async function bootstrapSession(): Promise<void> {
  if (bootstrapInFlight) return bootstrapInFlight

  bootstrapInFlight = (async () => {
    try {
      useSessionStore.getState().syncFromStorage()
      if (useSessionStore.getState().token) return

      if (!canUseSecureRefreshFlow()) {
        useSessionStore.getState().clearSession()
        return
      }

      const runRefresh = async () => {
        if (useSessionStore.getState().token) return

        const refreshResponse = await fetch(`${getApiBaseUrl()}${AUTH_ROUTES.refresh}`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!refreshResponse.ok) {
          useSessionStore.getState().clearSession()
          return
        }

        const payload = (await refreshResponse.json()) as {
          data?: { access_token?: string }
        }
        const token = payload.data?.access_token
        if (!token) {
          useSessionStore.getState().clearSession()
          return
        }

        let email: string | null = useSessionStore.getState().email
        if (!email) {
          try {
            const meResponse = await fetch(`${getApiBaseUrl()}${IDENTITY_ROUTES.me}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (meResponse.ok) {
              const mePayload = (await meResponse.json()) as { data?: { email?: string } }
              email = mePayload.data?.email ?? null
            }
          } catch {
            // Best effort
          }
        }

        useSessionStore.getState().setSession(token, email)
      }

      if (typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks?.request) {
        await navigator.locks.request('cima_session_refresh_lock', runRefresh)
      } else {
        await runRefresh()
      }
    } finally {
      bootstrapInFlight = null
      useSessionStore.getState().setBootstrapped(true)
    }
  })()

  return bootstrapInFlight
}
