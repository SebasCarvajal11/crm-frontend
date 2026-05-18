import ky from 'ky'
import { canUseSecureRefreshFlow, getApiBaseUrl, useSessionStore } from '@/app/session/session-store'
import {
  RefreshTokenError,
  classifyRefreshHttpStatus,
  getRefreshFailureReason,
} from '@/shared/lib/refresh-token-error'
import { notifyNetworkRetry } from '@/shared/lib/transient-notice'

type RefreshPayload = {
  data?: {
    access_token?: string
  }
}

type Subscriber = {
  resolve: (token: string) => void
  reject: (error: Error) => void
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
  if (request.url.includes('/auth/refresh')) return false
  if (hasRetriedAuth(request)) return false
  return request.headers.has('authorization')
}

async function refreshAccessToken(): Promise<string> {
  if (isRedirecting) {
    throw new Error('Sesion expirada')
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

  try {
    const refreshResponse = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

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
        const authHeader = request.headers.get('authorization')
        const requestToken = extractBearerToken(authHeader)
        if (!requestToken) return

        const currentToken = useSessionStore.getState().token
        if (!currentToken || currentToken !== requestToken) {
          throw new Error('Sesion invalida o token obsoleto para la solicitud actual')
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
          } else {
            notifyNetworkRetry()
          }
          return response
        }
      },
    ],
  },
})


