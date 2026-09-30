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

export function getMemberDisplayName(member: ProjectMember): string {
  const full = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
  if (full) return full
  if (member.role === 'client' && member.client_kind === 'juridical' && member.company_name) return member.company_name
  return member.email || 'Sin nombre registrado'
}

export function getMemberInitials(member: ProjectMember): string {
  const full = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  return member.email ? member.email.slice(0, 2).toUpperCase() : '?'
}

export function formatMemberDateLabel(iso: string | null): string {
  if (!iso) return 'Sin registro'
  return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
}

export function getMemberRelativeActivity(iso: string | null): string {
  if (!iso) return 'Sin registro'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) === 1 ? '' : 's'}`
  if (days < 365) return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) === 1 ? '' : 'es'}`
  const years = Math.floor(days / 365)
  return `Hace ${years} año${years === 1 ? '' : 's'}`
}

