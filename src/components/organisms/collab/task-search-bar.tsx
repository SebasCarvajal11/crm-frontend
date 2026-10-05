import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import type { ProjectTask, ProjectTaskColumn } from '@/features/collab/model'

const DEBOUNCE_MS = 250

type Props = {
  searchableTasks: ProjectTask[]
  isSearching: boolean
  boardColumns: ProjectTaskColumn[]
  onDebouncedChange: (value: string) => void
  onSelectTask: (taskId: string) => void
}

/**
 * Componente hoja: barra de busqueda de tareas con dropdown de resultados.
 * Gestiona su propio estado de texto local con debounce para evitar re-renderizar
 * el workspace completo en cada pulsacion de tecla.
 */
export function TaskSearchBar({ searchableTasks, isSearching, boardColumns, onDebouncedChange, onSelectTask }: Props) {
  const [text, setText] = useState('')
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      onDebouncedChange(text.trim())
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    }
  }, [text, onDebouncedChange])

  const hasQuery = text.trim().length >= 2

  return (
    <div className="rounded-2xl border bg-card px-4 py-2.5 sm:py-3 shadow-2xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold">Buscar tareas</h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Filtra por nombre, descripción o columna del tablero.</p>
        </div>
        <div className="relative w-full sm:max-w-xs md:max-w-sm lg:max-w-md sm:shrink-0">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Buscar tareas por nombre, descripción o columna"
          aria-label="Buscar tareas del proyecto"
        />
        {hasQuery && (
          <div className="absolute z-30 mt-1 w-full rounded-md border bg-popover shadow-md">
            {isSearching && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Buscando…</p>
            )}
            {!isSearching && searchableTasks.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Sin tareas coincidentes</p>
            )}
            {searchableTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className="w-full px-3 py-2 text-left transition-colors hover:bg-accent"
                onClick={() => {
                  setText('')
                  onDebouncedChange('')
                  onSelectTask(task.id)
                }}
              >
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {boardColumns.find((c) => c.id === task.columnId)?.title ?? 'Sin columna'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
