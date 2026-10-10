import type { CSSProperties } from 'react'

export const SPRITESHEET_COLUMNS = 12
export const SPRITESHEET_ROWS = 7
export const TOTAL_CATALOG_AVATARS = SPRITESHEET_COLUMNS * SPRITESHEET_ROWS

export const DEFAULT_SPRITESHEET_URL = '/avatars/avatars-spritesheet-64.webp'
export const THUMB_SPRITESHEET_URL = '/avatars/avatars-spritesheet-thumb.webp'

export interface AvatarSpriteCoordinates {
  col: number
  row: number
  percentX: number
  percentY: number
}

export interface AvatarSpriteStyleOptions {
  variant?: '64' | 'thumb'
  customSheetUrl?: string
}

export function sanitizeAvatarId(avatarId?: number | null): number {
  if (typeof avatarId !== 'number' || Number.isNaN(avatarId)) return 0
  const integerId = Math.trunc(avatarId)
  if (integerId >= 0 && integerId < TOTAL_CATALOG_AVATARS) return integerId
  return Math.abs(integerId) % TOTAL_CATALOG_AVATARS
}

export function getAvatarSpriteCoordinates(avatarId?: number | null): AvatarSpriteCoordinates {
  const safeId = sanitizeAvatarId(avatarId)
  const col = safeId % SPRITESHEET_COLUMNS
  const row = Math.floor(safeId / SPRITESHEET_COLUMNS)

  const percentX = (col / (SPRITESHEET_COLUMNS - 1)) * 100
  const percentY = (row / (SPRITESHEET_ROWS - 1)) * 100

  return { col, row, percentX, percentY }
}

export function getAvatarSpriteStyle(
  avatarId?: number | null,
  options?: AvatarSpriteStyleOptions
): CSSProperties {
  const { percentX, percentY } = getAvatarSpriteCoordinates(avatarId)
  const sheetUrl =
    options?.customSheetUrl ??
    (options?.variant === 'thumb' ? THUMB_SPRITESHEET_URL : DEFAULT_SPRITESHEET_URL)

  return {
    backgroundImage: `url('${sheetUrl}')`,
    backgroundPosition: `${percentX.toFixed(3)}% ${percentY.toFixed(3)}%`,
    backgroundSize: `${SPRITESHEET_COLUMNS * 100}% ${SPRITESHEET_ROWS * 100}%`,
    backgroundRepeat: 'no-repeat',
  }
}

export function isCatalogAvatarSrc(src?: string | null): boolean {
  if (!src || typeof src !== 'string') return false
  return /\/avatars\/avatar-\d+(?:-\d+)?\.(?:webp|png)/.test(src)
}
