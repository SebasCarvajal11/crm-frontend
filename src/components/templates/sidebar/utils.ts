import type { SidebarItem } from './types'

export const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  worker: 'Trabajador',
  client: 'Cliente',
}

export const shellSidebarWidth = 'md:w-64 lg:w-72 xl:w-[18.5rem]'
export const shellSidebarOffset = 'md:ml-64 lg:ml-72 xl:ml-[18.5rem]'

export const navItemBaseClass = [
  'group relative flex w-full items-center gap-3',
  'rounded-lg px-3 py-2.5',
  'text-left text-[0.9375rem] lg:text-base xl:text-[1.0625rem]',
  'font-medium lg:font-semibold tracking-[-0.01em]',
  'transition-all duration-150 ease-out cursor-pointer',
  'active:scale-[0.98] focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-primary-foreground/50',
  '[&_svg]:shrink-0',
].join(' ')

export function roleInitial(role: string) {
  const label = ROLE_LABEL[role] ?? role
  return label.charAt(0).toUpperCase() || 'U'
}

export function visibleItems(items: SidebarItem[]) {
  return items.filter((item) => !item.hidden)
}
