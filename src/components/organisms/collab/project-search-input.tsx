import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import type { ProjectSearchResult } from '@/features/collab/model'

const DEBOUNCE_MS = 180

type Props = {
  canSearchByClient: boolean
  searchResults: ProjectSearchResult[]
  isSearching: boolean
  onDebouncedChange: (value: string) => void
  onSelectProject: (projectId: string) => void
}

/**
 * Componente hoja: campo de busqueda de proyectos con debounce local.
 * Gestiona su propio estado de texto para evitar re-renderizar el componente padre
 * (y todo el tablero Kanban) en cada pulsacion de tecla.
 */
export function ProjectSearchInput({
  canSearchByClient,
  searchResults,
  isSearching,
  onDebouncedChange,
  onSelectProject,
}: Props) {
  const [localText, setLocalText] = useState('')
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      onDebouncedChange(localText.trim())
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    }
  }, [localText, onDebouncedChange])

  const hasQuery = localText.trim().length >= 2

  return (
    <div className="relative w-full sm:w-[350px]">
      <Input
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder={canSearchByClient ? 'Buscar por proyecto, cliente o correo' : 'Buscar proyecto'}
        aria-label="Buscar proyectos"
      />
      {hasQuery && (
        <div className="absolute z-30 mt-1 w-full rounded-md border bg-popover shadow-md">
          {isSearching && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Buscando proyectos...</p>
          )}
          {!isSearching && searchResults.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados</p>
          )}
          {!isSearching &&
            searchResults.map((p) => (
              <button
                key={p.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                onClick={() => {
                  setLocalText('')
                  onDebouncedChange('')
                  onSelectProject(p.id)
                }}
              >
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {canSearchByClient
                    ? `${p.clientName}${p.clientEmail ? ` - ${p.clientEmail}` : ''}`
                    : p.clientName}
                </p>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
