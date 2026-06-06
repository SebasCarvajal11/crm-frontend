import ky from 'ky'
import { canUseSecureRefreshFlow, getApiBaseUrl, useSessionStore } from '@/app/session/session-store'
import {
  RefreshTokenError,
  classifyRefreshHttpStatus,
  getRefreshFailureReason,
} from '@/shared/lib/refresh-token-error'
import { notifyNetworkRetry } from '@/shared/lib/transient-notice'
import { AUTH_ROUTES } from '@/shared/lib/gateway-routes'

type RefreshPayload = {
  data?: {
    access_token?: string
  }
}

type Subscriber = {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

let isRefreshing = false
let isRedirecting = false
let refreshSubscribers: Array<Subscriber> = []

function isLoginPath(): boolean {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  return path === '/login'
}

/** Una sola redirección o limpieza cuando el refresh falla (varios 401 en paralelo). */
function handleAuthFailure() {
  if (typeof window === 'undefined') return
  if (isRedirecting) return

  if (isLoginPath()) {
    isRefreshing = false
    return
  }

  isRedirecting = true
  window.location.assign('/login')
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(token))
  refreshSubscribers = []
}

function onRefreshFailed(error: Error) {
  refreshSubscribers.forEach(({ reject }) => reject(error))
  refreshSubscribers = []
}

function hasRetriedAuth(request: Request): boolean {
  return request.headers.get('x-auth-retried') === '1'
}

function shouldAttemptRefresh(request: Request, response: Response): boolean {
  if (isRedirecting) return false
  if (response.status !== 401) return false
  if (request.url.includes(AUTH_ROUTES.refresh)) return false
  if (hasRetriedAuth(request)) return false
  return request.headers.has('authorization')
}

async function refreshAccessToken(): Promise<string> {
  if (isRedirecting) {
    throw new RefreshTokenError('Sesion expirada', 'auth')
  }
  if (!canUseSecureRefreshFlow()) {
    throw new RefreshTokenError('El origen actual no soporta refresh seguro sin HTTPS', 'auth')
  }
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshSubscribers.push({ resolve, reject })
    })
  }

  isRefreshing = true

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const refreshResponse = await fetch(`${getApiBaseUrl()}${AUTH_ROUTES.refresh}`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!refreshResponse.ok) {
      throw new RefreshTokenError(
        'No se pudo renovar la sesion',
        classifyRefreshHttpStatus(refreshResponse.status),
      )
    }

    const payload = (await refreshResponse.json()) as RefreshPayload
    const token = payload.data?.access_token
    if (!token) {
      throw new RefreshTokenError('La respuesta de refresh no trae access_token', 'auth')
    }

    useSessionStore.getState().setSession(token, useSessionStore.getState().email)
    onRefreshed(token)
    return token
  } catch (error) {
    clearTimeout(timeoutId)
    const reason = getRefreshFailureReason(error)
    if (reason === 'auth') {
      useSessionStore.getState().clearSession()
    }
    onRefreshFailed(error instanceof Error ? error : new Error('Refresh fallido'))
    throw error
  } finally {
    if (!isRedirecting) {
      isRefreshing = false
    }
  }
}

async function retryWithRefreshedToken(request: Request, token: string) {
  const headers = new Headers(request.headers)
  headers.set('authorization', `Bearer ${token}`)
  headers.set('x-auth-retried', '1')

  return api(request, { headers, credentials: 'include' })
}

function extractBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null
  const [scheme, token] = headerValue.split(' ')
  if (!scheme || !token) return null
  if (scheme.toLowerCase() !== 'bearer') return null
  return token
}

/** Cliente HTTP hacia KrakenD, centralizado en `shared` para la migracion por capas. */
export const api = ky.create({
  prefix: getApiBaseUrl(),
  credentials: 'include',
  timeout: 30_000,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (!request.headers.has('x-request-id')) {
          request.headers.set('x-request-id', createRequestId())
        }

        const authHeader = request.headers.get('authorization')
        const requestToken = extractBearerToken(authHeader)
        if (!requestToken) return

        // Solo verifica que exista sesión activa. Permite solicitudes autenticadas
        // si la app está en proceso de bootstrap (ej. recuperando email).
        if (!useSessionStore.getState().token && useSessionStore.getState().bootstrapped) {
          throw new Error('Sesion invalida: no hay token activo')
        }
      },
    ],
    afterResponse: [
      async ({ request, response }) => {
        if (!shouldAttemptRefresh(request, response)) return response

        try {
          const token = await refreshAccessToken()
          return retryWithRefreshedToken(request, token)
        } catch (error) {
          if (getRefreshFailureReason(error) === 'auth') {
            handleAuthFailure()
            return response
          }
          // Fallo de red: propagar el error para que TanStack Query lo trate
          // como reintentable, sin invalidar la sesión local.
          notifyNetworkRetry()
          throw error
        }
      },
    ],
  },
})
