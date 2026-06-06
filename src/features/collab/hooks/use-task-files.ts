import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parseApiError } from '@/shared/lib'
import { listTaskFilesRequest, uploadTaskFileWithMetadataRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { DataResponse, ProjectFile, ProjectTimelineItem } from '@/features/collab/model'

type Params = {
  accessToken: string
  projectId: string
  taskId: string
  onError: (msg: string) => void
  setFileError: (msg: string | null) => void
  resetForm: () => void
}

type UploadInput = {
  selectedFile: File | null
  fileTitle: string
  fileDesc: string
  isClientVisible: boolean
}

export function useTaskFiles({ accessToken, projectId, taskId, onError, setFileError, resetForm }: Params) {
  const queryClient = useQueryClient()

  const filesQ = useQuery({
    queryKey: collabKeys.taskFiles(taskId),
    queryFn: () => listTaskFilesRequest(accessToken, projectId, taskId),
  })

  const files = (filesQ.data?.data ?? []) as ProjectFile[]

  const upload = useMutation({
    mutationFn: (input: UploadInput) => {
      if (!input.selectedFile) throw new Error('No hay archivo seleccionado')
      return uploadTaskFileWithMetadataRequest(
        accessToken,
        projectId,
        taskId,
        input.selectedFile!,
        input.fileTitle.trim(),
        input.fileDesc.trim(),
        {
          fileName: input.selectedFile!.name,
          mimeType: input.selectedFile!.type || 'application/octet-stream',
          sizeBytes: input.selectedFile!.size,
          isClientVisible: input.isClientVisible,
        },
      )
    },
    onSuccess: async (response: DataResponse<ProjectFile>) => {
      const file = response.data
      queryClient.setQueryData<DataResponse<ProjectFile[]>>(collabKeys.taskFiles(taskId), (current) => {
        const items = current?.data ?? []
        return { data: [file, ...items.filter((item) => item.id !== file.id)] }
      })
      queryClient.setQueryData<DataResponse<ProjectTimelineItem[]>>(collabKeys.timeline(projectId), (current) => {
        const nextItem: ProjectTimelineItem = {
          id: file.id,
          kind: 'file',
          label: 'Archivo',
          title: file.title ?? file.fileName,
          occurredAt: file.createdAt,
          fileId: file.id,
          fileName: file.fileName,
          mimeType: file.mimeType,
          taskId: file.taskId,
          changeRequestId: null,
          createdBySub: file.createdBySub,
          createdByEmail: file.createdByEmail,
          isClientVisible: file.isClientVisible,
        }
        const items = current?.data ?? []
        return { data: [nextItem, ...items.filter((item) => item.id !== nextItem.id || item.kind !== nextItem.kind)] }
      })
      resetForm()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: collabKeys.taskFiles(taskId) }),
        queryClient.invalidateQueries({ queryKey: collabKeys.files(projectId) }),
        queryClient.invalidateQueries({ queryKey: collabKeys.timeline(projectId) }),
      ])
    },
    onError: (error) => {
      void parseApiError(error).then((m) => {
        setFileError(m || 'No se pudo subir el archivo')
        onError(m || 'Error al subir archivo')
      })
    },
  })

  return { filesQ, files, upload }
}




