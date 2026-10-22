export type SidebarItem = {
  key: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  onMouseEnter?: () => void
  isActive: boolean
  hidden?: boolean
  /** Contador opcional junto a la etiqueta (p. ej. propuestas y mensajes pendientes). */
  badge?: number
  /** Texto accesible del contador, p. ej. "3 pendientes". */
  badgeLabel?: string
}
