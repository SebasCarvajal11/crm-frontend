import { create } from 'zustand'

const TOKEN_KEY = 'cima_access_token'
const EMAIL_KEY = 'cima_user_email'

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

let bootstrapInFlight: Promise<void> | null = null
let storageSyncBound = false
let storageSyncCleanup: (() => void) | null = null

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
  },
  clearSession: () => {
    writeStored(null, null)
    set({ token: null, email: null })
  },
  setBootstrapped: (value) => set({ bootstrapped: value }),
  syncFromStorage: () => set(readStored()),
}))

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api'
  return base.replace(/\/$/, '')
}

export function canUseSecureRefreshFlow(): boolean {
  if (typeof window === 'undefined') return true

  const { protocol, hostname } = window.location
  if (protocol === 'https:') return true

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

      if (!canUseSecureRefreshFlow()) {
        useSessionStore.getState().clearSession()
        return
      }

      const refreshResponse = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
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

      useSessionStore.getState().setSession(token, useSessionStore.getState().email)
    } finally {
      useSessionStore.getState().setBootstrapped(true)
    }
  })()

  return bootstrapInFlight
}

/** Sincroniza sesión entre pestañas. Devuelve cleanup para `useEffect`. */
export function bindSessionStorageSync(): () => void {
  if (!canUseStorage()) return () => {}
  if (storageSyncBound) return storageSyncCleanup ?? (() => {})

  const onStorage = (event: StorageEvent) => {
    if (event.key !== TOKEN_KEY && event.key !== EMAIL_KEY && event.key !== null) return
    useSessionStore.getState().syncFromStorage()
  }

  window.addEventListener('storage', onStorage)
  storageSyncBound = true
  storageSyncCleanup = () => {
    window.removeEventListener('storage', onStorage)
    storageSyncBound = false
    storageSyncCleanup = null
  }
  return storageSyncCleanup
}
