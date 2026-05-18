import type { ProjectMember } from '@/features/collab/model'

export function getProjectMemberLabel(member: ProjectMember): string {
  const full = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
  if (full) return full
  if (member.role === 'client' && member.client_kind === 'juridical' && member.company_name) {
    return member.company_name
  }
  if (member.email) return member.email
  return `Trabajador (${member.userSub.slice(0, 8)}…)`
}

export function projectWorkers(members: ProjectMember[]): ProjectMember[] {
  return members.filter((m) => m.role === 'worker')
}
