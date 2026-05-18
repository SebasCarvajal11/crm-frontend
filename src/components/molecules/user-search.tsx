import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { searchClientsRequest } from '@/features/auth/api'
import type { ClientSearchResult } from '@/shared/types'
import type { UserRole } from '@/shared/types'

type Props = {
  accessToken: string
  role: UserRole
  selected: ClientSearchResult[]
  onSelect: (user: ClientSearchResult) => void
  placeholder?: string
  queryKeyPrefix?: string
}

/**
 * Molecula: campo de busqueda con debounce para usuarios por email.
 * Emite la seleccion via onSelect sin gestionar el estado de seleccionados.
 */
export function UserSearch({ accessToken, role, selected, onSelect, placeholder, queryKeyPrefix = 'user-search' }: Props) {
  const [query, setQuery] = useState('')
  const [show, setShow] = useState(false)
  const [debounced, setDebounced] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebounced(query.length < 2 ? '' : query)
    }, 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  const searchQ = useQuery({
    queryKey: [queryKeyPrefix, role, debounced],
    queryFn: () => searchClientsRequest(accessToken, debounced, role),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  })

  const suggestions = (searchQ.data?.data ?? []).filter(
    (u) => !selected.some((s) => s.subject === u.subject),
  )

  const listOpen = show && query.length >= 2
  const resolvedActiveIndex =
    suggestions.length === 0 ? -1 : Math.min(activeIndex, suggestions.length - 1)

  useEffect(() => {
    if (!listOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!rootRef.current?.contains(target)) {
        setShow(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [listOpen])

  const selectUser = (user: ClientSearchResult) => {
    onSelect(user)
    setQuery('')
    setShow(false)
    setActiveIndex(-1)
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!listOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShow(false)
        setActiveIndex(-1)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
        break
      case 'Enter':
        if (resolvedActiveIndex >= 0 && resolvedActiveIndex < suggestions.length) {
          e.preventDefault()
          selectUser(suggestions[resolvedActiveIndex]!)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShow(false)
        setActiveIndex(-1)
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(suggestions.length - 1)
        break
      default:
        break
    }
  }

  const activeDescendantId =
    resolvedActiveIndex >= 0 && resolvedActiveIndex < suggestions.length
      ? `${listboxId}-option-${resolvedActiveIndex}`
      : undefined

  return (
    <div ref={rootRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
      <Input
        className="pl-9"
        placeholder={placeholder ?? 'Busca por email…'}
        value={query}
        role="combobox"
        aria-expanded={listOpen}
        aria-controls={listOpen ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={listOpen ? activeDescendantId : undefined}
        onChange={(e) => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => setShow(true)}
        onKeyDown={onInputKeyDown}
        autoComplete="off"
      />
      {listOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md overflow-hidden"
        >
          {searchQ.isFetching ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground" role="status">
              <div className="size-3 rounded-full border border-muted-foreground border-t-transparent animate-spin" aria-hidden="true" />
              Buscando…
            </div>
          ) : suggestions.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-muted-foreground" role="status">
              {debounced.length >= 2 ? 'Sin resultados.' : 'Escribe al menos 2 caracteres.'}
            </p>
          ) : (
            suggestions.map((u, index) => {
              const isActive = index === resolvedActiveIndex
              return (
                <button
                  key={u.subject}
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    isActive ? 'bg-muted' : 'hover:bg-muted'
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectUser(u)}
                >
                  <User className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate flex-1">{u.email}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0">{u.role}</Badge>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

