import { useEffect, useMemo, useRef, useState } from 'react'
import { Users, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { useSessionStore } from '@/app/session/session-store'
import { useUserAvatars } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { usePresence } from '../hooks/use-presence'
import { useVisibleViewport } from '../hooks/use-visible-viewport'
import {
  FIRST_PAGES,
  type PresenceGroup,
  type PresencePages,
  type PresenceRole,
  type PresenceSnapshot,
  type PresenceTabKey,
} from '../model/presence'
import { SegmentedTabs } from './presence-tabs'
import { PresenceGroupSection } from './presence-group-section'
import { SearchAndControls } from './presence-search'

function WifiPausedNotice() {
  return (
    <p
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-lg border border-border/60',
        'bg-muted/30 p-2.5 text-xs text-muted-foreground'
      )}
    >
      <WifiOff className="mt-0.5 size-3.5 shrink-0" />
      La actualización está pausada mientras no haya conexión o esta pestaña esté oculta.
    </p>
  )
}

function ErrorNotice({ revoked }: { revoked: boolean }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive"
    >
      {revoked
        ? 'Tu cuenta ya no tiene acceso al panel de presencia.'
        : 'No pudimos actualizar la presencia. Conservamos la última consulta; puedes reintentar.'}
    </p>
  )
}

function LoadingSkeleton() {
  return (
    <div role="status" className="space-y-2 rounded-xl border border-border/40 p-3 text-xs text-muted-foreground">
      <p>Cargando usuarios…</p>
      <div aria-hidden="true" className="h-14 rounded-lg bg-muted/60 motion-safe:animate-pulse" />
    </div>
  )
}

function PresenceStatusBanners({
  available,
  isError,
  revoked,
  isPending,
  hasData,
}: {
  available: boolean
  isError: boolean
  revoked: boolean
  isPending: boolean
  hasData: boolean
}) {
  return (
    <>
      {!available && <WifiPausedNotice />}
      {isError && <ErrorNotice revoked={revoked} />}
      {!hasData && isPending && available && <LoadingSkeleton />}
    </>
  )
}

function PresenceEmptyState({ query, historyDays }: { query: string; historyDays: number }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/15 px-4 py-5 text-center">
      <Users aria-hidden="true" className="mx-auto mb-2 size-5 text-muted-foreground" />
      <p className="text-sm font-semibold">{query ? 'Sin coincidencias' : 'Sin otros usuarios recientes'}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {query
          ? 'Prueba otro nombre, alias de correo o empresa.'
          : `Aquí aparecerán las conexiones registradas durante los últimos ${historyDays} días.`}
      </p>
    </div>
  )
}

function computeStatusMessage(result: ReturnType<typeof usePresence>, totalOnline: number, query: string): string {
  if (result.revoked) return 'Acceso restringido.'
  if (result.stale && result.data) return 'Datos sin actualizar: conexión pendiente.'
  if (result.data) {
    const qSuffix = query ? ' en esta búsqueda' : ''
    return `${totalOnline} en línea${qSuffix} · actualización cada ${result.data.refresh_after_seconds} s`
  }
  if (result.isError) return 'Presencia no disponible.'
  if (!result.available) return 'Actualización pausada.'
  return 'Consultando presencia…'
}

function usePresenceCounts(groups?: PresenceGroup[]) {
  return useMemo<Record<PresenceTabKey, number>>(() => {
    if (!groups) return { all: 0, worker: 0, client: 0, admin: 0 }
    return {
      all: groups.reduce((acc, g) => acc + g.total, 0),
      worker: groups.find((g) => g.role === 'worker')?.total ?? 0,
      client: groups.find((g) => g.role === 'client')?.total ?? 0,
      admin: groups.find((g) => g.role === 'admin')?.total ?? 0,
    }
  }, [groups])
}

function usePanelState(owner: string) {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<PresenceTabKey>('all')
  const [pages, setPages] = useState<PresencePages>(FIRST_PAGES)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (search.trim() === query) return
    const timer = setTimeout(() => {
      setQuery(search.trim())
      setPages(FIRST_PAGES)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, query])

  const token = useSessionStore((state) => state.token)
  const result = usePresence(owner, query, pages)
  const groups = result.data?.groups
  const allSubs = useMemo(() => groups?.flatMap((g) => g.users.map((u) => u.subject)) ?? [], [groups])
  const { getAvatarUrl, getAvatarColor } = useUserAvatars(token, allSubs)
  const busy = result.isFetching || search.trim() !== query
  const totalOnline = groups?.reduce((sum, g) => sum + g.online, 0) ?? 0
  const counts = usePresenceCounts(groups)
  const visibleGroups = useMemo(
    () => (activeTab === 'all' ? groups ?? [] : groups?.filter((g) => g.role === activeTab) ?? []),
    [groups, activeTab]
  )
  const statusMessage = computeStatusMessage(result, totalOnline, query)

  const onPage = (role: PresenceRole, page: number) => {
    setPages((prev) => ({ ...prev, [role]: page }))
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }

  return {
    search, setSearch, query, activeTab, setActiveTab, pages, setPages,
    scrollRef, result, groups, busy, counts, visibleGroups, statusMessage, getAvatarUrl, getAvatarColor, onPage,
  }
}

function PresenceFooterNotice({ onlineForSeconds, pageSize }: { onlineForSeconds: number; pageSize: number }) {
  return (
    <p className="text-[11px] leading-relaxed text-muted-foreground/75 px-0.5">
      La presencia se confirma con señales de la aplicación visible. Las señales vencen a los{' '}
      {onlineForSeconds} segundos; el estado se refleja en la siguiente actualización. Se muestran
      hasta {pageSize} usuarios por perfil y página.
    </p>
  )
}

function VisibleGroupSections({
  groups,
  now,
  stale,
  busy,
  getAvatarUrl,
  getAvatarColor,
  onPage,
}: {
  groups: PresenceGroup[]
  now: number
  stale: boolean
  busy: boolean
  getAvatarUrl: (sub?: string | null) => string | null
  getAvatarColor?: (sub?: string | null) => string | null
  onPage: (role: PresenceRole, page: number) => void
}) {
  return (
    <>
      {groups.map((group) => (
        <PresenceGroupSection
          key={group.role}
          group={group}
          now={now}
          stale={stale}
          busy={busy}
          getAvatarUrl={getAvatarUrl}
          getAvatarColor={getAvatarColor}
          onPage={(page) => onPage(group.role, page)}
        />
      ))}
    </>
  )
}

function PanelSearchSection({ state }: { state: ReturnType<typeof usePanelState> }) {
  const { search, setSearch, statusMessage, busy, result, groups, activeTab, setActiveTab, counts } = state
  return (
    <div className="space-y-2.5">
      <SearchAndControls
        search={search}
        setSearch={setSearch}
        statusMessage={statusMessage}
        busy={busy}
        available={result.available}
        revoked={result.revoked}
        isFetching={result.isFetching}
        onRefetch={() => void result.refetch()}
      />
      {groups && <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />}
    </div>
  )
}

type PanelDataViewProps = {
  data: PresenceSnapshot
  busy: boolean
  query: string
  groups: PresenceGroup[]
  now: number
  stale: boolean
  available: boolean
  getAvatarUrl: (sub?: string | null) => string | null
  getAvatarColor?: (sub?: string | null) => string | null
  onPage: (role: PresenceRole, page: number) => void
}

function PanelDataView(props: PanelDataViewProps) {
  const { data, busy, query, groups, now, stale, available, getAvatarUrl, getAvatarColor, onPage } = props
  return (
    <>
      {!busy && data.groups.every((g) => g.total === 0) && (
        <PresenceEmptyState query={query} historyDays={data.history_days} />
      )}
      <VisibleGroupSections
        groups={groups}
        now={now}
        stale={stale}
        busy={busy || !available}
        getAvatarUrl={getAvatarUrl}
        getAvatarColor={getAvatarColor}
        onPage={onPage}
      />
      <PresenceFooterNotice
        onlineForSeconds={data.online_for_seconds}
        pageSize={data.groups[0].page_size}
      />
    </>
  )
}

function PanelContent({ owner }: { owner: string }) {
  const state = usePanelState(owner)
  const { query, scrollRef, result, busy, visibleGroups, getAvatarUrl, getAvatarColor, onPage } = state

  return (
    <div
      ref={scrollRef}
      className={cn(
        'min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-3.5 py-3 sm:px-4 sm:py-3.5',
        'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]'
      )}
      aria-busy={busy}
    >
      <PanelSearchSection state={state} />
      <PresenceStatusBanners
        available={result.available}
        isError={result.isError}
        revoked={result.revoked}
        isPending={result.isPending}
        hasData={Boolean(result.data)}
      />
      {result.data && (
        <PanelDataView
          data={result.data}
          busy={busy}
          query={query}
          groups={visibleGroups}
          now={result.now}
          stale={result.stale}
          available={result.available}
          getAvatarUrl={getAvatarUrl}
          getAvatarColor={getAvatarColor}
          onPage={onPage}
        />
      )}
    </div>
  )
}

function PresencePanelHeader({ titleRef }: { titleRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <DialogHeader
      className={cn(
        'shrink-0 px-4 pt-3 pb-2.5 sm:px-5 sm:pt-4 sm:pb-3',
        'border-b border-border/50 bg-muted/15 pr-12'
      )}
    >
      <div className="mx-auto -mt-1 mb-2 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle
            ref={titleRef}
            tabIndex={-1}
            className="text-sm sm:text-base font-bold tracking-tight text-foreground outline-none"
          >
            Usuarios en línea
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground truncate">
            Presencia y actividad reciente del equipo y los clientes.
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  )
}

export function PresencePanel({ owner }: { owner: string }) {
  const viewport = useVisibleViewport()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const isMobile = viewport.width < 768
  const modalWidth = isMobile
    ? `calc((${viewport.width}px - 1rem) / var(--app-zoom, 1))`
    : `min(23.5rem, calc((${viewport.width}px - 2rem) / var(--app-zoom, 1)))`
  const modalMaxH = `calc((${viewport.height}px - ${isMobile ? '1rem' : '2rem'}) / var(--app-zoom, 1))`
  const modalTop = `calc(${viewport.top + viewport.height / 2}px / var(--app-zoom, 1))`

  return (
    <DialogContent
      data-testid="presence-panel"
      showCloseButton={false}
      overlayClassName="bg-black/25 backdrop-blur-[2px] sm:bg-black/20"
      className={cn(
        'flex flex-col gap-0 overflow-hidden bg-card backdrop-blur-none border border-border/80 shadow-2xl',
        isMobile ? 'rounded-2xl' : 'left-auto right-4 -translate-x-0 rounded-2xl'
      )}
      style={{ top: modalTop, width: modalWidth, maxWidth: 'none', maxHeight: modalMaxH }}
      onOpenAutoFocus={(event) => {
        event.preventDefault()
        titleRef.current?.focus()
      }}
    >
      <PresencePanelHeader titleRef={titleRef} />
      <DialogClose asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cerrar panel de presencia"
          className="absolute right-2.5 top-2.5 size-8 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </DialogClose>
      <PanelContent owner={owner} />
    </DialogContent>
  )
}
