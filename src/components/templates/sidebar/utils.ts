import type { SidebarItem } from './types'

export const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  worker: 'Trabajador',
  client: 'Cliente',
}

export const shellSidebarWidth = 'md:w-64 lg:w-72'
export const shellSidebarOffset = 'md:ml-64 lg:ml-72'

export const navItemBaseClass =
  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50'

export function roleInitial(role: string) {
  const label = ROLE_LABEL[role] ?? role
  return label.charAt(0).toUpperCase() || 'U'
}

export function visibleItems(items: SidebarItem[]) {
  return items.filter((item) => !item.hidden)
}
