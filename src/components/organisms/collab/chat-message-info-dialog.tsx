import { useMemo } from 'react'
import { Check, CheckCheck, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import type { ChatMessageReadReceipt, ProjectChatMessage, ProjectMember } from '@/features/collab/model'
import type { UserAvatarsResponse } from '@/shared/types'
import { getAvatarColor } from './avatar-color'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: ProjectChatMessage | null
  members: ProjectMember[]
  avatarBySub: UserAvatarsResponse['data']['items']
}

function formatExactReadTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Hora no disponible'
  return date.toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function getMemberDisplayName(
  member?: ProjectMember,
  fallbackSub?: string,
  receipt?: ChatMessageReadReceipt
): string {
  const firstName = member?.first_name ?? receipt?.firstName ?? ''
  const lastName = member?.last_name ?? receipt?.lastName ?? ''
  const full = `${firstName} ${lastName}`.trim()
  if (full) return full
  const company = member?.company_name ?? receipt?.companyName
  if ((member?.role === 'client' || receipt?.role === 'client') && company) {
    return company
  }
  return member?.email || (fallbackSub ? `Usuario (${fallbackSub.slice(0, 6)})` : 'Usuario')
}

function getMemberRoleText(member?: ProjectMember, receipt?: ChatMessageReadReceipt): string {
  const role = member?.role ?? receipt?.role
  const profession = member?.profession?.trim() || receipt?.profession?.trim()
  if (role === 'worker') return profession || 'Trabajador'
  if (role === 'client') return 'Cliente'
  if (role === 'admin') return 'Administrador'
  return 'Miembro'
}

function getMemberInitials(
  member?: ProjectMember,
  fallback?: string,
  receipt?: ChatMessageReadReceipt
): string {
  const firstName = member?.first_name ?? receipt?.firstName ?? ''
  const lastName = member?.last_name ?? receipt?.lastName ?? ''
  const full = `${firstName} ${lastName}`.trim()
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (member?.email) return member.email.slice(0, 2).toUpperCase()
  return fallback?.slice(0, 2).toUpperCase() || '?'
}

export function ChatMessageInfoDialog({ open, onOpenChange, message, members, avatarBySub }: Props) {
  const memberBySub = useMemo(() => new Map(members.map((m) => [m.userSub, m])), [members])

  const readMembers = useMemo(() => {
    if (!message?.readStatus?.reads) return []
    return message.readStatus.reads
      .filter((r) => r.userSub !== message.authorSub)
      .map((r) => ({
        sub: r.userSub,
        member: memberBySub.get(r.userSub),
        receipt: r,
        readAt: r.readAt,
      }))
      .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
  }, [message, memberBySub])

  const pendingMembers = useMemo(() => {
    if (!message) return []
    const readSubs = new Set(readMembers.map((r) => r.sub))
    return members.filter((m) => {
      if (m.userSub === message.authorSub) return false
      if (message.channel === 'internal' && m.role === 'client') return false
      return !readSubs.has(m.userSub)
    })
  }, [members, message, readMembers])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4 bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckCheck className="size-5 text-sky-500" />
            Info del mensaje
          </DialogTitle>
          {message && (
            <DialogDescription className="mt-2 line-clamp-2 rounded-lg border border-border/70 bg-background/80 p-2.5 text-xs text-muted-foreground italic">
              &ldquo;{message.body}&rdquo;
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[60vh] divide-y divide-border/60 overflow-y-auto px-5 py-2">
          <section className="py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CheckCheck className="size-3.5 text-sky-500" />
                Leído por ({readMembers.length})
              </span>
            </div>
            {readMembers.length === 0 ? (
              <p className="py-2 text-xs text-muted-foreground">Aún nadie ha leído este mensaje.</p>
            ) : (
              <div className="space-y-2">
                {readMembers.map(({ sub, member, receipt, readAt }) => {
                  const name = getMemberDisplayName(member, sub, receipt)
                  const roleText = getMemberRoleText(member, receipt)
                  const avatarUrl = pickAvatarUrl(avatarBySub[sub]?.urls, '64')
                  const initials = getMemberInitials(member, sub, receipt)

                  return (
                    <div key={sub} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/40">
                      <div className="flex items-center gap-3 min-w-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={name} className="size-9 rounded-full object-cover ring-1 ring-border/50 shrink-0" />
                        ) : (
                          <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-xs ${getAvatarColor(sub)}`}>
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium leading-none text-foreground">{name}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{roleText}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pl-2 text-right">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground" title={readAt}>
                          {formatExactReadTime(readAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Check className="size-3.5 text-muted-foreground" />
                Entregado / Pendiente ({pendingMembers.length})
              </span>
            </div>
            {pendingMembers.length === 0 ? (
              <p className="py-2 text-xs text-muted-foreground">Todos los participantes han leído este mensaje.</p>
            ) : (
              <div className="space-y-2">
                {pendingMembers.map((member) => {
                  const sub = member.userSub
                  const name = getMemberDisplayName(member, sub)
                  const roleText = getMemberRoleText(member)
                  const avatarUrl = pickAvatarUrl(avatarBySub[sub]?.urls, '64')
                  const initials = getMemberInitials(member, sub)

                  return (
                    <div key={sub} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/40">
                      <div className="flex items-center gap-3 min-w-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={name} className="size-9 rounded-full object-cover ring-1 ring-border/50 shrink-0" />
                        ) : (
                          <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-xs ${getAvatarColor(sub)}`}>
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium leading-none text-foreground">{name}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{roleText}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground italic shrink-0">Pendiente</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
