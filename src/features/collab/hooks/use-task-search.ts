import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchTasksRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { ProjectTask } from '@/features/collab/model'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300
const RESULT_LIMIT = 8

type Params = {
  accessToken: string
  projectId: string
  rawQuery: string
  /** Solo activa la búsqueda remota cuando el tablero está truncado. */
  enabled: boolean
}

/**
 * Búsqueda remota de tareas contra GET /projects/:id/tasks/search.
 * Solo se activa cuando `enabled` es true (tablero truncado por el servidor)
 * y la query tiene al menos 2 caracteres.
 */
export function useTaskSearch({ accessToken, projectId, rawQuery, enabled }: Params) {
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(rawQuery.trim())
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [rawQuery])

  const isActive = enabled && debouncedQuery.length >= MIN_QUERY_LENGTH

  const query = useQuery({
    queryKey: collabKeys.taskSearch(projectId, debouncedQuery),
    queryFn: (): Promise<ProjectTask[]> =>
      searchTasksRequest(accessToken, projectId, debouncedQuery, RESULT_LIMIT)
        .then((res) => res.data),
    enabled: isActive,
    staleTime: 30_000,
  })

  return {
    results: isActive ? (query.data ?? []) : [],
    isSearching: isActive && query.isFetching,
  }
}
