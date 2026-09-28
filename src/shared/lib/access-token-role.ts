export type AccessTokenRole = 'admin' | 'worker' | 'client'

const roles = new Set<AccessTokenRole>(['admin', 'worker', 'client'])

/**
 * Lee únicamente el claim de rol para mantener la UI coherente con la
 * autorización del servidor. No verifica ni concede permisos: eso siempre lo
 * hace el gateway mediante la firma del JWT.
 */
export function getAccessTokenRole(token: string | null): AccessTokenRole | null {
  const value = getAccessTokenClaims(token)
  return typeof value?.role === 'string' && roles.has(value.role as AccessTokenRole)
    ? value.role as AccessTokenRole : null
}

export function getAccessTokenSubject(token: string | null): string | null {
  const subject = getAccessTokenClaims(token)?.sub
  return typeof subject === 'string' && subject.length > 0 ? subject : null
}

function getAccessTokenClaims(token: string | null): { role?: unknown; sub?: unknown } | null {
  if (!token || typeof window === 'undefined') return null

  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    return JSON.parse(decoded) as { role?: unknown; sub?: unknown }
  } catch {
    return null
  }
}
