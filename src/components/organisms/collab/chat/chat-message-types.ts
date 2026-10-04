import type { ProjectChatMessage, ProjectMember } from '@/features/collab/model'

export const formatMessageTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

export const formatMessageDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  })

export const isSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

export const formatDaySeparator = (iso: string): string => {
  const date = new Date(iso)
  const now = new Date()
  if (isSameDay(date, now)) return 'Hoy'
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Ayer'
  return date.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getAuthorDisplayName(
  message: ProjectChatMessage,
  memberBySub: Map<string, ProjectMember>
): string {
  const member = message.authorSub ? memberBySub.get(message.authorSub) : undefined
  const memberFullName = `${member?.first_name ?? ''} ${member?.last_name ?? ''}`.trim()
  const fullName = `${message.authorFirstName ?? ''} ${message.authorLastName ?? ''}`.trim()
  return memberFullName || fullName || member?.email || message.authorEmail || 'Sistema'
}

export function getAuthorRoleTag(
  message: ProjectChatMessage,
  memberBySub: Map<string, ProjectMember>
): string {
  const member = message.authorSub ? memberBySub.get(message.authorSub) : undefined
  const profession = member?.profession ?? message.authorProfession
  const role = member?.role ?? message.authorRole
  if (role === 'worker' && profession) return `Worker · ${profession}`
  if (role === 'worker') return 'Worker'
  if (role === 'admin') return 'Administrador'
  if (role === 'client') return 'Cliente'
  return 'Sistema'
}
