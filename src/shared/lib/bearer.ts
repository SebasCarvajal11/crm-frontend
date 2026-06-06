import { useSessionStore } from '@/app/session/session-store'

/** Construye header Authorization Bearer desde el session store o un token explícito. */
export function bearer(accessToken?: string): { Authorization: string } {
  const token = useSessionStore.getState().token ?? accessToken
  if (!token) throw new Error('No hay sesión activa')
  return { Authorization: `Bearer ${token}` }
}
