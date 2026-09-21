export type SidebarItem = {
  key: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  onMouseEnter?: () => void
  isActive: boolean
  hidden?: boolean
}
