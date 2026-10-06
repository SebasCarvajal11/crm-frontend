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

export const getAvatarImageUrl = (avatarId: number): string => {
  return `/avatars/avatar-${avatarId}.webp`
}

export const getRandomAvatarSelection = (): { avatarId: number; color: string } => {
  const avatarId = Math.floor(Math.random() * AVATARS_CATALOG.length)
  const colorIndex = Math.floor(Math.random() * CIMA_CORPORATE_COLORS.length)
  return {
    avatarId,
    color: CIMA_CORPORATE_COLORS[colorIndex].hex,
  }
}
