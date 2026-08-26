export type AccessTokenRole = 'admin' | 'worker' | 'client'

const roles = new Set<AccessTokenRole>(['admin', 'worker', 'client'])

/**
 * Lee únicamente el claim de rol para mantener la UI coherente con la
 * autorización del servidor. No verifica ni concede permisos: eso siempre lo
 * hace el gateway mediante la firma del JWT.
 */
export function getAccessTokenRole(token: string | null): AccessTokenRole | null {
  if (!token || typeof window === 'undefined') return null

  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    const value = JSON.parse(decoded) as { role?: unknown }
    return typeof value.role === 'string' && roles.has(value.role as AccessTokenRole)
      ? (value.role as AccessTokenRole)
      : null
  } catch {
    return null
  }
}
