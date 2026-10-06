import { memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRESENCE_ROLE_LABELS, type PresenceGroup } from '../model/presence'
import { PresenceUserRow } from './presence-user-row'

export type PresenceGroupSectionProps = {
  group: PresenceGroup
  now: number
  stale: boolean
  busy: boolean
  getAvatarUrl: (sub?: string | null) => string | null
  getAvatarColor?: (sub?: string | null) => string | null
  onPage: (page: number) => void
}

type GroupPaginationProps = {
  roleLabel: string
  page: number
  pages: number
  busy: boolean
  onPage: (page: number) => void
}

function GroupPagination({ roleLabel, page, pages, busy, onPage }: GroupPaginationProps) {
  return (
    <nav
      aria-label={`Paginación de ${roleLabel}`}
      className="flex items-center justify-between border-t border-border/40 px-2.5 py-1 text-xs"
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        disabled={busy || page === 1}
        aria-label={`Anterior en ${roleLabel}`}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-xs text-muted-foreground tabular-nums">
        Página {page} de {pages}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        disabled={busy || page === pages}
        aria-label={`Siguiente en ${roleLabel}`}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}

function GroupUserList({
  roleLabel,
  group,
  now,
  stale,
  getAvatarUrl,
  getAvatarColor,
}: {
  roleLabel: string
  group: PresenceGroup
  now: number
  stale: boolean
  getAvatarUrl: (sub?: string | null) => string | null
  getAvatarColor?: (sub?: string | null) => string | null
}) {
  if (!group.users.length) {
    return <p className="px-3 py-3.5 text-xs text-muted-foreground">Sin actividad reciente para este perfil.</p>
  }
  return (
    <ul className="divide-y-0 p-1 space-y-0.5" aria-label={`Usuarios de ${roleLabel}`}>
      {group.users.map((user) => (
        <PresenceUserRow
          key={user.subject}
          user={user}
          now={now}
          stale={stale}
          avatarUrl={getAvatarUrl(user.subject)}
          avatarColor={getAvatarColor?.(user.subject)}
        />
      ))}
    </ul>
  )
}

function GroupHeader({ roleLabel, countText }: { roleLabel: string; countText: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-3 py-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{roleLabel}</h3>
      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">{countText}</span>
    </header>
  )
}

export const PresenceGroupSection = memo(function PresenceGroupSection({
  group,
  now,
  stale,
  busy,
  getAvatarUrl,
  getAvatarColor,
  onPage,
}: PresenceGroupSectionProps) {
  const roleLabel = PRESENCE_ROLE_LABELS[group.role]
  const pages = Math.max(1, Math.ceil(group.total / group.page_size))
  const countText = stale
  ? `${group.total} recientes`
  : `${group.online} en línea · ${group.total - group.online} recientes`

  return (
    <section
      role="region"
      aria-label={roleLabel}
      className="overflow-hidden rounded-xl border border-border/50 bg-card/40"
    >
      <GroupHeader roleLabel={roleLabel} countText={countText} />
      <GroupUserList
        roleLabel={roleLabel}
        group={group}
        now={now}
        stale={stale}
        getAvatarUrl={getAvatarUrl}
        getAvatarColor={getAvatarColor}
      />
      {group.total > group.page_size && (
        <GroupPagination roleLabel={roleLabel} page={group.page} pages={pages} busy={busy} onPage={onPage} />
      )}
    </section>
  )
})
