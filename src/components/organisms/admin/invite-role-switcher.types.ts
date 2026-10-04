import { UserPlus, BriefcaseBusiness, ShieldPlus } from 'lucide-react'

export type InviteRole = 'client' | 'worker' | 'admin'

export type RoleMeta = {
  id: InviteRole
  label: string
  badgeText: string
  badgeClass: string
  icon: typeof UserPlus
  iconClass: string
  dataTour: string
}

export const ROLES: readonly RoleMeta[] = [
  {
    id: 'client',
    label: 'Cliente',
    badgeText: 'Portal',
    badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: UserPlus,
    iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    dataTour: 'admin-invite-client',
  },
  {
    id: 'worker',
    label: 'Colaborador',
    badgeText: 'Operación',
    badgeClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    icon: BriefcaseBusiness,
    iconClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    dataTour: 'admin-invite-worker',
  },
  {
    id: 'admin',
    label: 'Administrador',
    badgeText: 'Acceso Total',
    badgeClass: 'border-primary/20 bg-primary/10 text-primary',
    icon: ShieldPlus,
    iconClass: 'bg-primary/10 text-primary',
    dataTour: 'admin-invite-admin',
  },
] as const
