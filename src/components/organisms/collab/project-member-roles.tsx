import type React from 'react'
import { Briefcase, Crown, User } from 'lucide-react'
import type { ProjectMember, ProjectMemberRole } from '@/features/collab/model'

export type RoleConfigItem = {
  label: string
  icon: React.ReactNode
  badgeClass: string
  cardClass: string
}

export const ROLE_CONFIG: Record<ProjectMemberRole, RoleConfigItem> = {
  admin: {
    label: 'Administrador',
    icon: <Crown className="size-3.5" />,
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
    cardClass: 'border-l-violet-400',
  },
  worker: {
    label: 'Trabajador',
    icon: <Briefcase className="size-3.5" />,
    badgeClass: 'bg-sky-100 text-sky-700 border-sky-200',
    cardClass: 'border-l-sky-400',
  },
  client: {
    label: 'Cliente',
    icon: <User className="size-3.5" />,
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cardClass: 'border-l-emerald-400',
  },
}

export function getRoleDetail(member: ProjectMember): string {
  if (member.role === 'worker') {
    return member.profession?.trim() || 'Profesion no registrada'
  }
  if (member.role === 'client' && member.client_kind === 'juridical') {
    return 'Cliente juridico'
  }
  return ROLE_CONFIG[member.role].label
}
