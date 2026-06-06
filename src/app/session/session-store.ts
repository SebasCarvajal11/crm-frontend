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

type SessionMessage =
  | { type: 'SESSION_SET'; token: string; email: string | null }
  | { type: 'SESSION_CLEAR' }
  | { type: 'SESSION_REQUEST' }
  | { type: 'SESSION_RESPONSE'; token: string; email: string | null }
  | { type: 'SESSION_REFRESHING' }

let bootstrapInFlight: Promise<void> | null = null
let sessionChannel: BroadcastChannel | null = null
let isSomeoneRefreshing = false

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

function readStored(): StoredSession {
  if (!canUseStorage()) {
    return { token: null, email: null }
  }

  return {
    token: sessionStorage.getItem(TOKEN_KEY),
    email: sessionStorage.getItem(EMAIL_KEY),
  }
}

function writeStored(token: string | null, email: string | null) {
  if (!canUseStorage()) return

  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.removeItem(TOKEN_KEY)
  }

  if (email) {
    sessionStorage.setItem(EMAIL_KEY, email)
  } else {
    sessionStorage.removeItem(EMAIL_KEY)
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  ...readStored(),
  bootstrapped: false,
  setSession: (token, email = null) => {
    writeStored(token, email ?? null)
    set({ token, email: email ?? null })
    const channel = getSessionChannel()
    if (channel) {
      channel.postMessage({
        type: 'SESSION_SET',
        token,
        email: email ?? null,
      })
    }
  },
  clearSession: () => {
    writeStored(null, null)
    bootstrapInFlight = null
    set({ token: null, email: null })
    const channel = getSessionChannel()
    if (channel) {
      channel.postMessage({ type: 'SESSION_CLEAR' })
    }
  },
  setBootstrapped: (value) => set({ bootstrapped: value }),
  syncFromStorage: () => set(readStored()),
}))

// Listener a nivel de módulo para reaccionar a cambios en otras pestañas
const globalChannel = getSessionChannel()
if (globalChannel) {
  globalChannel.onmessage = (event: MessageEvent<SessionMessage>) => {
    const msg = event.data
    if (!msg) return

    switch (msg.type) {
      case 'SESSION_REFRESHING': {
        isSomeoneRefreshing = true
        break
      }
      case 'SESSION_SET': {
        isSomeoneRefreshing = false
        writeStored(msg.token, msg.email)
        useSessionStore.setState({ token: msg.token, email: msg.email })
        break
      }
      case 'SESSION_CLEAR': {
        isSomeoneRefreshing = false
        writeStored(null, null)
        bootstrapInFlight = null
        useSessionStore.setState({ token: null, email: null })
        break
      }
      case 'SESSION_REQUEST': {
        const state = useSessionStore.getState()
        if (state.token) {
          globalChannel.postMessage({
            type: 'SESSION_RESPONSE',
            token: state.token,
            email: state.email,
          })
        }
        break
      }
      case 'SESSION_RESPONSE': {
        // Manejado individualmente dentro de bootstrapSession
        break
      }
    }
  }
}

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  return base.replace(/\/$/, '')
}

export function canUseSecureRefreshFlow(): boolean {
  if (typeof window === 'undefined') return true

  const { protocol, hostname } = window.location
  if (protocol === 'https:') return true
  if (import.meta.env.DEV) return true

  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export async function bootstrapSession(): Promise<void> {
  if (bootstrapInFlight) return bootstrapInFlight

  bootstrapInFlight = (async () => {
    try {
      useSessionStore.getState().syncFromStorage()

      if (useSessionStore.getState().token) {
        return
      }

      // Intentar obtener el token desde otra pestaña antes de invocar la API
      const channel = getSessionChannel()
      if (channel) {
        const tokenFromTab = await new Promise<StoredSession | null>((resolve) => {
          const timeout = setTimeout(() => {
            channel.onmessage = originalListener
            resolve(null)
          }, 150) // 150ms de tiempo de espera

          const originalListener = channel.onmessage
          channel.onmessage = (event: MessageEvent<SessionMessage>) => {
            if (event.data?.type === 'SESSION_RESPONSE' && event.data.token) {
              clearTimeout(timeout)
              channel.onmessage = originalListener
              resolve({ token: event.data.token, email: event.data.email })
            } else if (originalListener) {
              originalListener.call(channel, event)
            }
          }

          channel.postMessage({ type: 'SESSION_REQUEST' })
        })

        if (tokenFromTab) {
          useSessionStore.getState().setSession(tokenFromTab.token!, tokenFromTab.email)
          return
        }
      }

      if (!canUseSecureRefreshFlow()) {
        useSessionStore.getState().clearSession()
        return
      }

      // Evitar colisiones cuando varias pestañas se abren/recargan juntas
      const jitter = Math.floor(Math.random() * 150)
      await new Promise((resolve) => setTimeout(resolve, jitter))

      if (useSessionStore.getState().token) {
        return
      }

      if (isSomeoneRefreshing) {
        // Otra pestaña líder ya está refrescando, esperamos hasta 3 segundos
        const start = Date.now()
        while (isSomeoneRefreshing && !useSessionStore.getState().token && Date.now() - start < 3000) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        if (useSessionStore.getState().token) {
          return
        }
      }

      // Iniciamos el refresco e informamos a otras pestañas
      isSomeoneRefreshing = true
      const syncChannel = getSessionChannel()
      if (syncChannel) {
        syncChannel.postMessage({ type: 'SESSION_REFRESHING' })
      }

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
    } finally {
      isSomeoneRefreshing = false
      bootstrapInFlight = null
      useSessionStore.getState().setBootstrapped(true)
    }
  })()

  return bootstrapInFlight
}
