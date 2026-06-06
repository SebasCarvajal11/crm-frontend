import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseApiError } from '@/shared/lib'
import { patchTaskRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'

type SubtaskItem = {
  id: string
  title: string
  is_completed: boolean
  assignee_sub: string | null
}

type Params = {
  accessToken: string
  projectId: string
  taskId: string
  onError: (msg: string) => void
}

/**
 * Mutación exclusiva para el checklist de subtareas.
 * Solo envía `subtasks` al PATCH — no toca campos del formulario principal.
 */
export function useSubtaskMutate({ accessToken, projectId, taskId, onError }: Params) {
  const queryClient = useQueryClient()

  const mutate = useMutation({
    mutationFn: (subtasks: SubtaskItem[]) =>
      patchTaskRequest(accessToken, taskId, { subtasks }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.projectBoard(projectId) })
      void queryClient.invalidateQueries({ queryKey: collabKeys.timeline(projectId) })
    },
    onError: (error) => {
      void parseApiError(error).then((m) => onError(m || 'No se pudo guardar la subtarea'))
    },
  })

  return mutate
}
