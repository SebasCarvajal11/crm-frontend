import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseApiError } from '@/shared/lib'
import { blockTaskRequest, unblockTaskRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'

type Params = {
  accessToken: string
  projectId: string
  taskId: string
  onSuccess?: () => void
  onError: (msg: string) => void
}

export function useBlockTask({ accessToken, projectId, taskId, onSuccess, onError }: Params) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: collabKeys.projectBoard(projectId) })
    void queryClient.invalidateQueries({ queryKey: collabKeys.timeline(projectId) })
  }

  const blockMutation = useMutation({
    mutationFn: (reason: string) => blockTaskRequest(accessToken, projectId, taskId, { reason }),
    onSuccess: () => {
      invalidate()
      onSuccess?.()
    },
    onError: (error) => {
      void parseApiError(error).then((m) => onError(m || 'No se pudo bloquear la tarea'))
    },
  })

  const unblockMutation = useMutation({
    mutationFn: (body?: { target_column_id?: string; resolution_comment?: string }) =>
      unblockTaskRequest(accessToken, projectId, taskId, body),
    onSuccess: () => {
      invalidate()
      onSuccess?.()
    },
    onError: (error) => {
      void parseApiError(error).then((m) => onError(m || 'No se pudo desbloquear la tarea'))
    },
  })

  return {
    blockTask: blockMutation.mutate,
    isBlocking: blockMutation.isPending,
    unblockTask: unblockMutation.mutate,
    isUnblocking: unblockMutation.isPending,
  }
}
