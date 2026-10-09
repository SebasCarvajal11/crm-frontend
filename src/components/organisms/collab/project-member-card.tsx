import { CheckSquare2, Clock3, Mail } from 'lucide-react'
import { UserAvatar } from '@/components/atoms/user-avatar'
import type { ProjectMember } from '@/features/collab/model'
import {
  formatMemberDateLabel as formatDateLabel,
  getMemberRelativeActivity as getRelativeActivityLabel,
} from '@/features/collab/lib/member-display'

type Props = {
  member: ProjectMember
  displayName: string
  avatarUrl: string | null
  avatarColor?: string | null
  roleLabel: string
  roleDetail: string
}

export function ProjectMemberCard({
  member,
  displayName,
  avatarUrl,
  avatarColor,
  roleLabel,
  roleDetail,
}: Props) {
  const showEmailLine = Boolean(member.email && member.email !== displayName)

  return (
    <article
      className={[
        'rounded-xl border border-border/70 bg-card p-4 shadow-2xs',
        'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm',
        'hover:border-primary/40',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          src={avatarUrl}
          color={avatarColor}
          name={displayName}
          userId={member.userSub}
          role={member.role}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-semibold" title={displayName}>
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {roleLabel} · {roleDetail}
          </p>
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
            {member.lastSeenAt ? (
              <span className="ml-1 text-[10px]">({formatDateLabel(member.lastSeenAt)})</span>
            ) : null}
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
}
