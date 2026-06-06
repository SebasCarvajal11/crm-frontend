export type SidebarItem = {
  key: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  isActive: boolean
  hidden?: boolean
}
