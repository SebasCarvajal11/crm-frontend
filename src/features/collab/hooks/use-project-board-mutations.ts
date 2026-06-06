import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseApiError } from '@/shared/lib'
import { patchTaskRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'

type MoveTaskInput = {
  taskId: string
  targetColumnId: string
  position: number
}

type Params = {
  accessToken: string
  projectId: string
  onError: (message: string) => void
}

export function useProjectBoardMutations({ accessToken, projectId, onError }: Params) {
  const queryClient = useQueryClient()

  const invalidateBoardScope = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: collabKeys.projectBoard(projectId) }),
      queryClient.invalidateQueries({ queryKey: collabKeys.projects() }),
      queryClient.invalidateQueries({ queryKey: collabKeys.timeline(projectId) }),
    ])

  const moveTask = useMutation({
    mutationFn: ({ taskId, targetColumnId, position }: MoveTaskInput) =>
      patchTaskRequest(accessToken, taskId, { column_id: targetColumnId, position }),
    onSuccess: invalidateBoardScope,
    onError: (error) => {
      void parseApiError(error).then((message) => onError(message || 'No se pudo mover la tarea'))
    },
  })

  return { moveTask, invalidateBoardScope }
}




