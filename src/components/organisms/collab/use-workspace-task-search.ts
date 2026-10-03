import { useCallback, useMemo, useState } from 'react'
import { useTaskSearch } from '@/features/collab/hooks'
import type { ProjectTask, ProjectTaskColumn } from '@/features/collab/model'

type UseWorkspaceTaskSearchProps = {
  accessToken: string
  projectId: string
  boardColumns: ProjectTaskColumn[]
  boardTasks: ProjectTask[]
  isTruncated: boolean
}

export function useWorkspaceTaskSearch({
  accessToken,
  projectId,
  boardColumns,
  boardTasks,
  isTruncated,
}: UseWorkspaceTaskSearchProps) {
  const [taskSearchDebounced, setTaskSearchDebounced] = useState('')

  const handleTaskSearchDebounced = useCallback((value: string) => {
    setTaskSearchDebounced(value)
  }, [])

  const localSearchResults = useMemo(() => {
    if (isTruncated) return []
    const normalized = taskSearchDebounced.trim().toLowerCase()
    if (normalized.length < 2) return []
    return boardTasks
      .filter((task) => {
        const columnTitle =
          boardColumns.find((c) => c.id === task.columnId)?.title ?? ''
        const searchContext = [
          task.title,
          task.description ?? '',
          task.priority,
          columnTitle,
        ].join(' ')
        return searchContext.toLowerCase().includes(normalized)
      })
      .slice(0, 8)
  }, [boardColumns, boardTasks, taskSearchDebounced, isTruncated])

  const { results: remoteSearchResults, isSearching } = useTaskSearch({
    accessToken,
    projectId,
    rawQuery: taskSearchDebounced,
    enabled: isTruncated,
  })

  const searchableTasks = isTruncated
    ? remoteSearchResults
    : localSearchResults

  return {
    handleTaskSearchDebounced,
    searchableTasks,
    isSearching,
  }
}
