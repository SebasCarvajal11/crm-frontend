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
    <div className="mb-4 rounded-2xl border bg-card p-3 shadow-sm">
      <div className="mb-2">
        <h3 className="text-sm font-semibold">Buscar tareas</h3>
        <p className="text-xs text-muted-foreground">Filtra por nombre, descripcion o columna del tablero.</p>
      </div>
      <div className="relative max-w-md">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Buscar tareas por nombre, descripcion o columna"
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
  )
}
