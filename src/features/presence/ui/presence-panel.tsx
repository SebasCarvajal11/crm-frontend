import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Search, Users, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { useSessionStore } from '@/app/session/session-store'
import { useUserAvatars } from '@/shared/hooks'
import { usePresence } from '../hooks/use-presence'
import { useVisibleViewport } from '../hooks/use-visible-viewport'
import { FIRST_PAGES, activityAge, presenceName, type PresenceGroup, type PresencePages, type PresenceRole } from '../model/presence'

const LABELS: Record<PresenceRole, string> = { worker: 'Colaboradores', client: 'Clientes', admin: 'Otros administradores' }

function Group({
  group,
  now,
  stale,
  busy,
  getAvatarUrl,
  onPage,
}: {
  group: PresenceGroup
  now: number
  stale: boolean
  busy: boolean
  getAvatarUrl: (sub?: string | null) => string | null
  onPage: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(group.total / group.page_size))
  return <section aria-label={LABELS[group.role]} className="overflow-hidden rounded-xl border bg-card">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
      <h3 className="text-sm font-semibold">{LABELS[group.role]}</h3>
      <span className="text-xs text-muted-foreground">{stale ? `${group.total} recientes` : `${group.online} en línea · ${group.total - group.online} recientes`}</span>
    </header>
    {!group.users.length ? <p className="px-4 py-5 text-sm text-muted-foreground">Sin actividad reciente para este perfil.</p> :
      <ul className="divide-y" aria-label={`Usuarios de ${LABELS[group.role]}`}>
        {group.users.map((user) => <li key={user.subject} className="flex items-start gap-3 px-4 py-3">
          <UserAvatar
            src={getAvatarUrl(user.subject)}
            name={presenceName(user)}
            userId={user.subject}
            size="md"
            presenceStatus={user.is_online && !stale ? 'online' : 'offline'}
            className="mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="break-words text-sm font-semibold leading-relaxed">{presenceName(user)}</p>
            <p className="break-all text-xs leading-relaxed text-muted-foreground">{user.email}</p>
            {user.company_name && <p className="break-words text-xs text-muted-foreground">{user.company_name}</p>}
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed">
              <span className={user.is_online && !stale ? 'inline-flex items-center gap-1.5 font-medium text-primary' : 'inline-flex items-center gap-1.5 text-muted-foreground'}>
                <span aria-hidden="true" className={`size-1.5 rounded-full ${user.is_online && !stale ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                {stale ? 'Sin confirmar' : user.is_online ? 'En línea' : 'Sin conexión'}
              </span>
              <time dateTime={user.last_activity_at} title={`Última actividad: ${new Date(user.last_activity_at).toLocaleString('es-CO')}`}>Actividad {activityAge(user.last_activity_at, now)}</time>
            </p>
            {user.last_connection_at && <p className="text-xs leading-relaxed text-muted-foreground">Último acceso {activityAge(user.last_connection_at, now)}</p>}
          </div>
        </li>)}
      </ul>}
    {group.total > group.page_size && <nav aria-label={`Paginación de ${LABELS[group.role]}`} className="flex items-center justify-between gap-2 border-t px-3 py-2">
      <Button variant="ghost" size="icon" className="size-11" disabled={busy || group.page === 1} aria-label={`Anterior en ${LABELS[group.role]}`} onClick={() => onPage(group.page - 1)}><ChevronLeft className="size-4" /></Button>
      <span className="text-xs text-muted-foreground">Página {group.page} de {pages}</span>
      <Button variant="ghost" size="icon" className="size-11" disabled={busy || group.page === pages} aria-label={`Siguiente en ${LABELS[group.role]}`} onClick={() => onPage(group.page + 1)}><ChevronRight className="size-4" /></Button>
    </nav>}
  </section>
}

function PanelContent({ owner }: { owner: string }) {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [pages, setPages] = useState<PresencePages>(FIRST_PAGES)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (search.trim() === query) return
    const timer = setTimeout(() => { setQuery(search.trim()); setPages(FIRST_PAGES) }, 350)
    return () => clearTimeout(timer)
  }, [search, query])
  const token = useSessionStore((state) => state.token)
  const result = usePresence(owner, query, pages)
  const groups = result.data?.groups
  const allVisibleSubjects = useMemo(() => {
    if (!groups) return []
    return groups.flatMap((g) => g.users.map((u) => u.subject))
  }, [groups])
  const { getAvatarUrl } = useUserAvatars(token, allVisibleSubjects)
  const updatingSearch = search.trim() !== query
  const busy = result.isFetching || updatingSearch
  const totalOnline = groups?.reduce((sum, group) => sum + group.online, 0) ?? 0
  return <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5" aria-busy={busy}>
    <div className="space-y-3">
      <label htmlFor="cima-presence-search" className="text-xs font-medium">Buscar en todos los perfiles</label>
      <div className="relative">
        <Search aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input id="cima-presence-search" value={search} maxLength={120} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, usuario, correo o empresa" className="h-11 pl-9 pr-11 text-base" />
        {search && <button type="button" aria-label="Limpiar búsqueda de presencia" className="absolute right-0 top-0 flex size-11 items-center justify-center rounded-lg text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setSearch('')}><X className="size-4" /></button>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p role="status" aria-live="polite" className="text-xs leading-relaxed text-muted-foreground">
          {result.revoked ? 'Acceso restringido.' : result.stale && result.data ? 'Datos sin actualizar: conexión pendiente.' : result.data ? `${totalOnline} en línea${query ? ' en esta búsqueda' : ''} · actualización cada ${result.data.refresh_after_seconds} s` : result.isError ? 'Presencia no disponible.' : !result.available ? 'Actualización pausada.' : 'Consultando presencia…'}
        </p>
        <Button variant="outline" size="icon" className="size-11 shrink-0" aria-label="Actualizar presencia" disabled={busy || !result.available || result.revoked} onClick={() => void result.refetch()}><RefreshCw className={`size-4 ${result.isFetching ? 'motion-safe:animate-spin' : ''}`} /></Button>
      </div>
    </div>
    {!result.available && <p role="status" className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm"><WifiOff className="mt-0.5 size-4 shrink-0" />La actualización está pausada mientras no haya conexión o esta pestaña esté oculta.</p>}
    {result.isError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">{result.revoked ? 'Tu cuenta ya no tiene acceso al panel de presencia.' : 'No pudimos actualizar la presencia. Conservamos la última consulta; puedes reintentar.'}</p>}
    {!result.data && result.isPending && result.available && <div role="status" className="space-y-3 rounded-xl border p-4 text-sm text-muted-foreground"><p>Cargando usuarios…</p><div aria-hidden="true" className="h-16 rounded-lg bg-muted motion-safe:animate-pulse" /></div>}
    {result.data && !busy && result.data.groups.every((group) => group.total === 0) && <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-5 text-center">
      <Users aria-hidden="true" className="mx-auto mb-2 size-6 text-primary" />
      <p className="text-sm font-semibold">{query ? 'Sin coincidencias' : 'Sin otros usuarios recientes'}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{query ? 'Prueba otro nombre, alias de correo o empresa.' : `Aquí aparecerán las conexiones registradas durante los últimos ${result.data.history_days} días.`}</p>
    </div>}
    {result.data && result.data.groups.map((group) => <Group key={group.role} group={group} now={result.now} stale={result.stale} busy={busy || !result.available} getAvatarUrl={getAvatarUrl} onPage={(page) => {
      setPages((previous) => ({ ...previous, [group.role]: page }))
      scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }} />)}
    {result.data && <p className="text-xs leading-relaxed text-muted-foreground">La presencia se confirma con señales de la aplicación visible. Las señales vencen a los {result.data.online_for_seconds} segundos; el estado se refleja en la siguiente actualización. Se muestran hasta {result.data.groups[0].page_size} usuarios por perfil y página.</p>}
  </div>
}

export function PresencePanel({ owner }: { owner: string }) {
  const viewport = useVisibleViewport()
  const titleRef = useRef<HTMLHeadingElement>(null)
  return <DialogContent data-testid="presence-panel" showCloseButton={false} className="left-auto right-4 flex -translate-x-0 flex-col gap-0 overflow-hidden bg-card backdrop-blur-none" style={{
    top: `calc(${viewport.top + viewport.height / 2}px / var(--app-zoom, 1))`,
    width: `min(30rem, calc((${viewport.width}px - 2rem) / var(--app-zoom, 1)))`,
    maxWidth: 'none', maxHeight: `calc((${viewport.height}px - 2rem) / var(--app-zoom, 1))`,
  }} onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus() }}>
    <DialogHeader className="shrink-0 pl-4 pr-14 pb-3 pt-4 sm:pl-5 sm:pt-4">
      <DialogTitle ref={titleRef} tabIndex={-1} className="outline-none">Usuarios en línea</DialogTitle>
      <DialogDescription>Presencia y actividad reciente del equipo y los clientes.</DialogDescription>
    </DialogHeader>
    <DialogClose asChild><Button variant="ghost" size="icon" aria-label="Cerrar panel de presencia" className="absolute right-2 top-2 size-11 rounded-full"><X className="size-4" /></Button></DialogClose>
    <PanelContent owner={owner} />
  </DialogContent>
}
