import manifestData from '../../../public/avatars/avatars-manifest.json'

export interface CorporateColorOption {
  id: string
  name: string
  hex: string
  bgClass: string
  textClass: string
}

export const CIMA_CORPORATE_COLORS: CorporateColorOption[] = [
  { id: 'cima-red', name: 'Rojo CIMA', hex: '#86070c', bgClass: 'bg-[#86070c]', textClass: 'text-[#86070c]' },
  { id: 'cima-ruby', name: 'Rubí CIMA', hex: '#a8131a', bgClass: 'bg-[#a8131a]', textClass: 'text-[#a8131a]' },
  { id: 'cima-burgundy', name: 'Borgoña', hex: '#680609', bgClass: 'bg-[#680609]', textClass: 'text-[#680609]' },
  { id: 'cima-coral', name: 'Coral CIMA', hex: '#bd2f35', bgClass: 'bg-[#bd2f35]', textClass: 'text-[#bd2f35]' },
  { id: 'navy', name: 'Azul Marino', hex: '#1e3a8a', bgClass: 'bg-[#1e3a8a]', textClass: 'text-[#1e3a8a]' },
  { id: 'cobalt', name: 'Azul Cobalto', hex: '#1d4ed8', bgClass: 'bg-[#1d4ed8]', textClass: 'text-[#1d4ed8]' },
  { id: 'forest', name: 'Verde Bosque', hex: '#065f46', bgClass: 'bg-[#065f46]', textClass: 'text-[#065f46]' },
  { id: 'emerald', name: 'Esmeralda', hex: '#047857', bgClass: 'bg-[#047857]', textClass: 'text-[#047857]' },
  { id: 'amber', name: 'Ámbar Cálido', hex: '#d97706', bgClass: 'bg-[#d97706]', textClass: 'text-[#d97706]' },
  { id: 'violet', name: 'Violeta Real', hex: '#5b21b6', bgClass: 'bg-[#5b21b6]', textClass: 'text-[#5b21b6]' },
  { id: 'slate', name: 'Pizarra Neutro', hex: '#475569', bgClass: 'bg-[#475569]', textClass: 'text-[#475569]' },
  { id: 'ink', name: 'Grafito CIMA', hex: '#282829', bgClass: 'bg-[#282829]', textClass: 'text-[#282829]' },
]

export type AvatarCategory = 'todos' | 'formal' | 'casual' | 'con-gafas'

export interface AvatarCategoryTab {
  id: AvatarCategory
  label: string
}

export const AVATAR_CATEGORY_TABS: AvatarCategoryTab[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'con-gafas', label: 'Con Gafas' },
]

export interface CatalogAvatar {
  id: number
  row: number
  col: number
  categories: string[]
  x: number
  y: number
  width: number
  height: number
}

export const AVATARS_CATALOG: CatalogAvatar[] = manifestData.avatars as CatalogAvatar[]

export type AvatarResolution = 64 | 256 | 512 | 1024

export const getAvatarImageUrl = (
  avatarId: number,
  resolution?: AvatarResolution
): string => {
  const safeId =
    typeof avatarId === 'number' && Number.isInteger(avatarId) && avatarId >= 0 && avatarId < 84
      ? avatarId
      : Math.abs(Math.trunc(avatarId || 0)) % 84
  if (resolution) {
    return `/avatars/avatar-${safeId}-${resolution}.webp`
  }
  return `/avatars/avatar-${safeId}.webp`
}

export const getAvatarSrcSet = (avatarId: number): string => {
  const safeId =
    typeof avatarId === 'number' && Number.isInteger(avatarId) && avatarId >= 0 && avatarId < 84
      ? avatarId
      : Math.abs(Math.trunc(avatarId || 0)) % 84
  return [
    `/avatars/avatar-${safeId}-64.webp 64w`,
    `/avatars/avatar-${safeId}-256.webp 256w`,
    `/avatars/avatar-${safeId}-512.webp 512w`,
    `/avatars/avatar-${safeId}-1024.webp 1024w`,
  ].join(', ')
}

export function resolveAvatarSrcSet(
  src?: string | null,
  avatarId?: number | null
): string | undefined {
  if (typeof avatarId === 'number' && avatarId >= 0 && avatarId < 84) {
    return getAvatarSrcSet(avatarId)
  }
  if (!src) return undefined
  const match = src.match(/\/avatars\/avatar-(\d+)(?:-\d+)?\.(?:webp|png)/)
  if (match) {
    const id = parseInt(match[1], 10)
    if (!Number.isNaN(id) && id >= 0 && id < 84) {
      return getAvatarSrcSet(id)
    }
  }
  return undefined
}

export const getRandomAvatarSelection = (): { avatarId: number; color: string } => {
  const avatarId = Math.floor(Math.random() * AVATARS_CATALOG.length)
  const colorIndex = Math.floor(Math.random() * CIMA_CORPORATE_COLORS.length)
  return {
    avatarId,
    color: CIMA_CORPORATE_COLORS[colorIndex].hex,
  }
}

export function hashStringFnv1a(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function resolveDeterministicAvatar(userId?: string | null): {
  avatarId: number
  color: string
  url: string
} {
  const seed = (typeof userId === 'string' ? userId.trim() : '') || 'cima-default-user'
  const h1 = hashStringFnv1a(seed)
  const h2 = hashStringFnv1a(`${seed}:color`)
  const avatarId = h1 % (AVATARS_CATALOG.length || 84)
  const colorIndex = h2 % CIMA_CORPORATE_COLORS.length
  const color = CIMA_CORPORATE_COLORS[colorIndex].hex
  const url = getAvatarImageUrl(avatarId)
  return { avatarId, color, url }
}
