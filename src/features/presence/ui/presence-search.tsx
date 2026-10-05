import { RefreshCw, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/utils'

export type SearchAndControlsProps = {
  search: string
  setSearch: (val: string) => void
  statusMessage: string
  busy: boolean
  available: boolean
  revoked: boolean
  isFetching: boolean
  onRefetch: () => void
}

function SearchInputField({
  search,
  setSearch,
}: {
  search: string
  setSearch: (val: string) => void
}) {
  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      />
      <Input
        id="cima-presence-search"
        value={search}
        maxLength={120}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Nombre, usuario, correo o empresa"
        className="h-10 pl-9 pr-9 text-sm rounded-lg"
      />
      {search && (
        <button
          type="button"
          aria-label="Limpiar búsqueda de presencia"
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center',
            'rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2',
            'focus-visible:outline-primary'
          )}
          onClick={() => setSearch('')}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function SearchStatusControls({
  statusMessage,
  busy,
  available,
  revoked,
  isFetching,
  onRefetch,
}: {
  statusMessage: string
  busy: boolean
  available: boolean
  revoked: boolean
  isFetching: boolean
  onRefetch: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-0.5">
      <p role="status" aria-live="polite" className="text-xs leading-relaxed text-muted-foreground truncate">
        {statusMessage}
      </p>
      <Button
        variant="outline"
        size="icon"
        className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label="Actualizar presencia"
        disabled={busy || !available || revoked}
        onClick={onRefetch}
      >
        <RefreshCw className={cn('size-3.5', isFetching && 'motion-safe:animate-spin')} />
      </Button>
    </div>
  )
}

export function SearchAndControls({
  search,
  setSearch,
  statusMessage,
  busy,
  available,
  revoked,
  isFetching,
  onRefetch,
}: SearchAndControlsProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="cima-presence-search" className="text-xs font-medium text-foreground">
        Buscar en todos los perfiles
      </label>
      <SearchInputField search={search} setSearch={setSearch} />
      <SearchStatusControls
        statusMessage={statusMessage}
        busy={busy}
        available={available}
        revoked={revoked}
        isFetching={isFetching}
        onRefetch={onRefetch}
      />
    </div>
  )
}
