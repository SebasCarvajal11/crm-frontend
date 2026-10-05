/**
 * Single source of truth para el cálculo determinista y memorizado
 * del color de fondo de los avatares según identificador único.
 */

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-sky-500',
  'bg-cyan-600',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
] as const

const cache = new Map<string, string>()

export function getAvatarColor(sub: string | null | undefined): string {
  if (!sub) return 'bg-slate-400'

  const cached = cache.get(sub)
  if (cached) return cached

  let hash = 0
  for (let i = 0; i < sub.length; i += 1) {
    hash = (sub.charCodeAt(i) + ((hash << 5) - hash)) | 0
  }

  const color = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  cache.set(sub, color)
  return color
}
