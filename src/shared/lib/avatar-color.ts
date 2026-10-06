import { resolveDeterministicAvatar } from './avatar-catalog'

/**
 * Single source of truth para el cálculo determinista y memorizado
 * del color de fondo corporativo CIMA según identificador único.
 */
const cache = new Map<string, string>()

export function getAvatarColor(sub: string | null | undefined): string {
  const key = sub?.trim() || 'cima-default-user'
  const cached = cache.get(key)
  if (cached) return cached

  const { color } = resolveDeterministicAvatar(key)
  cache.set(key, color)
  return color
}
