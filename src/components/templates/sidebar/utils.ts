import type { SidebarItem } from './types'

export const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  worker: 'Trabajador',
  client: 'Cliente',
}

export const shellSidebarWidth = 'md:w-72 lg:w-80 xl:w-[21.5rem]'
export const shellSidebarOffset = 'md:ml-72 lg:ml-80 xl:ml-[21.5rem]'

export const navItemBaseClass = [
  'group relative flex w-full items-center gap-3.5 lg:gap-4',
  'rounded-xl px-3.5 py-3 md:py-3 lg:py-3.5 xl:py-3.5',
  'text-left text-lg md:text-lg lg:text-xl xl:text-2xl',
  'font-semibold lg:font-bold tracking-tight',
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
