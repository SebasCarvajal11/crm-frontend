import { useState } from 'react'
import { Briefcase, CheckSquare2, Clock3, Crown, Mail, Plus, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserSearch } from '@/components/molecules/user-search'
import { UserChip } from '@/components/molecules/user-chip'
import { useProjectMembers } from '@/features/collab/hooks'
import type { ProjectMember, ProjectMemberRole } from '@/features/collab/model'
import type { ClientSearchResult } from '@/shared/types'
import type { MeResponse } from '@/shared/types'
import { getAvatarColor } from './avatar-color'
import { COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS } from './collab-workspace-layout'

type Props = {
  members: ProjectMember[]
  isLoading: boolean
  accessToken: string
  projectId: string
  identity: MeResponse['data']
  canManageMembers: boolean
  onError: (msg: string) => void
}

const ROLE_CONFIG: Record<ProjectMemberRole, { label: string; icon: React.ReactNode; badgeClass: string; cardClass: string }> = {
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


function getDisplayName(member: ProjectMember) {
  const full = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
  if (full) return full
  if (member.role === 'client' && member.client_kind === 'juridical' && member.company_name) return member.company_name
  return member.email || 'Sin nombre registrado'
}

function getInitials(member: ProjectMember) {
  const full = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  return member.email ? member.email.slice(0, 2).toUpperCase() : '?'
}

function getRoleDetail(member: ProjectMember) {
  if (member.role === 'worker') return member.profession?.trim() || 'Profesion no registrada'
  if (member.role === 'client' && member.client_kind === 'juridical') return 'Cliente juridico'
  return ROLE_CONFIG[member.role].label
}

function formatDateLabel(iso: string | null) {
  if (!iso) return 'Sin registro'
  return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
}

function getRelativeActivityLabel(iso: string | null) {
  if (!iso) return 'Sin registro'
  const now = new Date()
  const then = new Date(iso)
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startThen = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()
  const days = Math.floor((startNow - startThen) / 86_400_000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) === 1 ? '' : 's'}`
  if (days < 365) return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) === 1 ? '' : 'es'}`
  const years = Math.floor(days / 365)
  return `Hace ${years} año${years === 1 ? '' : 's'}`
}

export function ProjectMembers({ members, isLoading, accessToken, projectId, identity, canManageMembers, onError }: Props) {
  const [selectedWorkers, setSelectedWorkers] = useState<ClientSearchResult[]>([])
  const { membersQ, resolvedMembers, addWorker, memberAvatarUrl } = useProjectMembers({
    accessToken,
    projectId,
    members,
    selectedWorkers,
    setSelectedWorkers: (updater) => setSelectedWorkers((prev) => updater(prev)),
    identityEmail: identity.email,
    onError,
  })

  if (isLoading || membersQ.isLoading) {
    return <div className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} items-center justify-center rounded-xl border bg-card shadow-sm`}><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>
  }
  if (resolvedMembers.length === 0) {
    return <div className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} flex-col items-center justify-center gap-3 rounded-xl border bg-card text-muted-foreground shadow-sm`}><Users className="size-10 opacity-20" /><p className="text-sm">No hay integrantes en este proyecto.</p></div>
  }

  const memberSubs = new Set(resolvedMembers.map((m) => m.userSub))
  const filteredSelection = selectedWorkers.filter((w) => !memberSubs.has(w.subject))
  const excludedWorkerSubjects = Array.from(new Set([
    ...resolvedMembers
      .filter((member) => member.role === 'worker')
      .map((member) => member.userSub),
    ...filteredSelection.map((worker) => worker.subject),
  ]))
  const byRole = resolvedMembers.reduce<Record<ProjectMemberRole, ProjectMember[]>>((acc, member) => {
    acc[member.role] = [...acc[member.role], member]
    return acc
  }, { admin: [], worker: [], client: [] })

  return (
    <div className={`grid gap-4 ${canManageMembers ? 'min-[1280px]:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]' : ''}`}>
      {canManageMembers && (
        <section className={`order-2 flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm min-[1280px]:order-2`} aria-label="Gestionar integrantes">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Agregar trabajador</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Busca y asigna nuevos integrantes al proyecto.</p>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <UserSearch
              accessToken={accessToken}
              role="worker"
              selected={filteredSelection}
              excludedSubjects={excludedWorkerSubjects}
              onSelect={(worker) => {
                if (memberSubs.has(worker.subject)) return
                setSelectedWorkers((prev) => prev.some((w) => w.subject === worker.subject) ? prev : [...prev, worker])
              }}
              placeholder="Buscar trabajador por email..."
              queryKeyPrefix="project-member-worker"
            />
            {filteredSelection.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {filteredSelection.map((worker) => (
                  <UserChip key={worker.subject} email={worker.email} onRemove={() => setSelectedWorkers((prev) => prev.filter((x) => x.subject !== worker.subject))} />
                ))}
              </div>
            )}
          </div>
          <div className="border-t p-4">
            <Button
              size="sm"
              className="w-full"
              onClick={() => addWorker.mutate()}
              disabled={filteredSelection.length === 0 || addWorker.isPending}
            >
              <Plus className="mr-1 size-4" />
              {addWorker.isPending ? 'Agregando...' : 'Agregar trabajador'}
            </Button>
          </div>
        </section>
      )}

      <section className={`order-1 flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm min-[1280px]:order-1`} aria-label="Integrantes del proyecto">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Integrantes del proyecto</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Personas asignadas y su actividad dentro del proyecto.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="rounded-lg border bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['admin', 'worker', 'client'] as ProjectMemberRole[]).map((role) => {
            const count = byRole[role].length
            if (count === 0) return null
            const cfg = ROLE_CONFIG[role]
            return (
              <span key={role} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${cfg.badgeClass}`}>
                {cfg.icon}
                {cfg.label}: {count}
              </span>
            )
          })}
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Users className="size-3.5" />
            {resolvedMembers.length} en total
          </span>
        </div>
          </div>

          <div className="mt-5 space-y-6">
      {(['admin', 'worker', 'client'] as ProjectMemberRole[]).map((role) => {
        const group = byRole[role]
        if (!group.length) return null
        const cfg = ROLE_CONFIG[role]
        return (
          <section key={role} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badgeClass}`}>
                {cfg.icon}
                {cfg.label}
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className={group.length === 1 ? 'grid gap-3' : 'grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-3'}>
              {group.map((member) => {
                const displayName = getDisplayName(member)
                const showEmailLine = Boolean(member.email && member.email !== displayName)
                const avatarUrl = memberAvatarUrl(member.userSub, member.email)
                return (
                  <article key={member.userSub} className={`rounded-xl border border-l-4 bg-card p-4 shadow-sm interactive-card ${cfg.cardClass}`}>
                    <div className="flex items-start gap-3">
                      <div className={`${getAvatarColor(member.userSub)} flex size-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white`}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={`Avatar de ${displayName}`} className="size-10 object-cover" />
                        ) : (
                          getInitials(member)
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-semibold" title={displayName}>{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{cfg.label} · {getRoleDetail(member)}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      {showEmailLine && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail className="size-3.5 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </p>
                      )}
                      <p>Desde: {formatDateLabel(member.createdAt)}</p>
                      {member.role !== 'admin' && (
                        <p>
                          Ultima actividad: {getRelativeActivityLabel(member.lastSeenAt)}
                          {member.lastSeenAt ? <span className="ml-1 text-[10px]">({formatDateLabel(member.lastSeenAt)})</span> : null}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-3 border-t pt-2.5 text-xs text-muted-foreground">
                      {member.role !== 'admin' && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" />
                          Activo en proyecto
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <CheckSquare2 className="size-3.5" />
                        <strong className="text-foreground">{member.taskCount}</strong>
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
          </div>
        </div>
      </section>
    </div>
  )
}



