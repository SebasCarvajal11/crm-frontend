import { useMemo } from 'react'
import { PRIORITY_WEIGHT } from '@/features/collab/model/constants'
import type { ProjectBoardPayload, ProjectTask, ProjectTaskColumn } from '@/features/collab/model'

type BoardData = {
  boardColumns: ProjectTaskColumn[]
  boardTasks: ProjectTask[]
  tasksByColumn: Record<string, ProjectTask[]>
  taskIndexMap: Map<string, ProjectTask>
}

/**
 * Hook que transforma los datos crudos del tablero en estructuras optimizadas:
 * - boardColumns: columnas ordenadas por posicion
 * - boardTasks: lista plana de tareas
 * - tasksByColumn: tareas agrupadas por columna, ordenadas por prioridad
 * - taskIndexMap: diccionario plano para busqueda O(1) por id
 */
export function useBoardData(boardData: ProjectBoardPayload | undefined): BoardData {
  const boardColumns = useMemo(() => {
    const cols = boardData?.columns ?? []
    return cols.toSorted((a, b) => a.position - b.position)
  }, [boardData])

  const boardTasks = useMemo(() => {
    return boardData?.tasks ?? []
  }, [boardData])

  const taskIndexMap = useMemo(() => {
    const map = new Map<string, ProjectTask>()
    for (const task of boardTasks) map.set(task.id, task)
    return map
  }, [boardTasks])

  const tasksByColumn = useMemo(() => {
    const map: Record<string, ProjectTask[]> = {}
    for (const col of boardColumns) map[col.id] = []
    for (const task of boardTasks) {
      if (!map[task.columnId]) map[task.columnId] = []
      map[task.columnId].push(task)
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) => (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0))
    }
    return map
  }, [boardColumns, boardTasks])

  return { boardColumns, boardTasks, tasksByColumn, taskIndexMap }
}
