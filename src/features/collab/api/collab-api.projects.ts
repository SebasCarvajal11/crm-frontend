import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { putFileToPresignedUrl } from '@/shared/lib/presigned-upload'
import { PROJECT_ROUTES, FILE_ROUTES } from '@/shared/lib/gateway-routes'
import { isRetryableUploadRegistrationError, withUploadRegistrationRetries } from './upload-registration'
import type {
  DataResponse,
  PaginatedData,
  Project,
  ProjectMember,
  ProjectBrief,
  ProjectBoardResponse,
  ProjectChangeRequest,
  ProjectFileEnriched,
  ProjectListItem,
  ProjectSearchResult,
  ProjectTimelineItem,
  ProjectWorkspaceResponse,
} from '@/features/collab/model'

export { bearer }

export async function listProjectsRequest(
  accessToken: string,
  params?: { page?: number; limit?: number; type?: Project['type']; status?: Project['status'] }
): Promise<DataResponse<PaginatedData<ProjectListItem>>> {
  const searchParams: Record<string, string> = {}
  if (params?.page != null) searchParams.page = String(params.page)
  if (params?.limit != null) searchParams.limit = String(params.limit)
  if (params?.type) searchParams.type = params.type
  if (params?.status) searchParams.status = params.status
  return api.get(PROJECT_ROUTES.list, { headers: bearer(accessToken), searchParams }).json<DataResponse<PaginatedData<ProjectListItem>>>()
}

export async function updateProjectRequest(
  accessToken: string,
  projectId: string,
  body: {
    name?: string
    description?: string | null
    status?: Project['status']
    estimated_due_date?: string | null
    progress_percent?: number
  }
): Promise<DataResponse<Project>> {
  return api.patch(PROJECT_ROUTES.update(projectId), { headers: bearer(accessToken), json: body }).json<DataResponse<Project>>()
}

export async function createProjectRequest(
  accessToken: string,
  body: {
    name: string
    description?: string
    client_name: string
    client_sub?: string
    worker_subs: string[]
    type: Project['type']
    brief?: string
  }
): Promise<DataResponse<Project>> {
  return api.post(PROJECT_ROUTES.create, { headers: bearer(accessToken), json: body }).json<DataResponse<Project>>()
}

export async function getProjectWorkspaceRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectWorkspaceResponse>> {
  return api.get(PROJECT_ROUTES.workspace(projectId), { headers: bearer(accessToken) }).json<DataResponse<ProjectWorkspaceResponse>>()
}

export async function getProjectBoardRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectBoardResponse>> {
  return api.get(PROJECT_ROUTES.board(projectId), { headers: bearer(accessToken) }).json<DataResponse<ProjectBoardResponse>>()
}

export async function searchProjectsRequest(
  accessToken: string,
  params: { q: string; limit?: number }
): Promise<DataResponse<ProjectSearchResult[]>> {
  const searchParams: Record<string, string> = { q: params.q }
  if (params.limit != null) searchParams.limit = String(params.limit)
  return api.get(PROJECT_ROUTES.search, { headers: bearer(accessToken), searchParams }).json<DataResponse<ProjectSearchResult[]>>()
}

export async function getBriefRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectBrief>> {
  return api.get(PROJECT_ROUTES.brief(projectId), { headers: bearer(accessToken) }).json<DataResponse<ProjectBrief>>()
}

export async function updateBriefRequest(
  accessToken: string,
  projectId: string,
  body: { body: string }
): Promise<DataResponse<ProjectBrief>> {
  return api.patch(PROJECT_ROUTES.brief(projectId), { headers: bearer(accessToken), json: body }).json<DataResponse<ProjectBrief>>()
}

export async function listProjectFilesEnrichedRequest(
  accessToken: string,
  projectId: string,
  params?: { page?: number; limit?: number }
): Promise<DataResponse<PaginatedData<ProjectFileEnriched>>> {
  const searchParams: Record<string, string> = {}
  if (params?.page != null) searchParams.page = String(params.page)
  if (params?.limit != null) searchParams.limit = String(params.limit)
  return api
    .get(PROJECT_ROUTES.files(projectId), { headers: bearer(accessToken), searchParams })
    .json<DataResponse<PaginatedData<ProjectFileEnriched>>>()
}

export async function upsertProjectMemberRequest(
  accessToken: string,
  projectId: string,
  body: { user_sub: string; role: 'admin' | 'worker' | 'client'; user_email?: string }
): Promise<DataResponse<ProjectMember>> {
  return api.put(PROJECT_ROUTES.members(projectId), { headers: bearer(accessToken), json: body }).json<DataResponse<ProjectMember>>()
}

export async function listProjectMembersRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectMember[]>> {
  return api.get(PROJECT_ROUTES.members(projectId), { headers: bearer(accessToken) }).json<DataResponse<ProjectMember[]>>()
}

export async function listProjectTimelineRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectTimelineItem[]>> {
  return api.get(PROJECT_ROUTES.timeline(projectId), { headers: bearer(accessToken) }).json<DataResponse<ProjectTimelineItem[]>>()
}

export const listProjectFilesTimelineRequest = listProjectTimelineRequest

export async function uploadProjectConversationFileRequest(
  accessToken: string,
  projectId: string,
  body: {
    file: File
    title: string
    description?: string
    isClientVisible: boolean
  }
): Promise<DataResponse<ProjectFileEnriched>> {
  const form = new FormData()
  form.append('file', body.file)
  form.append('title', body.title)
  if (body.description?.trim()) form.append('description', body.description.trim())
  form.append('is_client_visible', String(body.isClientVisible))
  // Backward compatibility: older backend contracts still expect channel.
  form.append('channel', body.isClientVisible ? 'external' : 'internal')
  return api
    .post(PROJECT_ROUTES.filesUpload(projectId), { headers: bearer(accessToken), body: form })
    .json<DataResponse<ProjectFileEnriched>>()
}

type PresignedUploadUrlResponse = {
  data: {
    uploadUrl: string
    objectKey: string
    expiresInSeconds: number
  }
}

export async function uploadProjectFilePresignedRequest(
  accessToken: string,
  projectId: string,
  file: File,
): Promise<{ objectKey: string }> {
  const mimeType = file.type || 'application/octet-stream'

  const step = await api
    .post(PROJECT_ROUTES.filesUploadUrl(projectId), {
      headers: bearer(accessToken),
      json: {
        file_name: file.name,
        mime_type: mimeType,
        size_bytes: file.size,
      },
    })
    .json<PresignedUploadUrlResponse>()

  await putFileToPresignedUrl(step.data.uploadUrl, file, mimeType)
  return { objectKey: step.data.objectKey }
}

export async function abortProjectFileUploadRequest(
  accessToken: string,
  projectId: string,
  objectKey: string,
): Promise<void> {
  await api.delete(PROJECT_ROUTES.filesUploadedObject(projectId), {
    headers: bearer(accessToken),
    searchParams: { objectKey },
  })
}

export async function createProjectFileMetadataRequest(
  accessToken: string,
  projectId: string,
  body: {
    fileName: string
    title: string
    description?: string | null
    storagePath: string
    mimeType: string
    sizeBytes: number
    isClientVisible: boolean
    origin: 'internal_chat' | 'external_chat' | 'manual_upload'
  }
): Promise<DataResponse<ProjectFileEnriched>> {
  return api.post(PROJECT_ROUTES.files(projectId), {
    headers: bearer(accessToken),
    json: {
      file_name: body.fileName,
      title: body.title,
      description: body.description ?? null,
      storage_path: body.storagePath,
      mime_type: body.mimeType,
      size_bytes: body.sizeBytes,
      folder: 'shared_deliverables',
      is_client_visible: body.isClientVisible,
      origin: body.origin,
    },
  }).json<DataResponse<ProjectFileEnriched>>()
}

export type ProjectFileMetadataInput = {
  fileName: string
  title: string
  description?: string | null
  mimeType: string
  sizeBytes: number
  isClientVisible: boolean
  origin: 'internal_chat' | 'external_chat' | 'manual_upload'
}

/** Upload prefirmado + metadata; solo compensa en OCI cuando el fallo no es transitorio. */
export async function uploadProjectFileWithMetadataRequest(
  accessToken: string,
  projectId: string,
  file: File,
  metadata: ProjectFileMetadataInput,
): Promise<DataResponse<ProjectFileEnriched>> {
  const upload = await uploadProjectFilePresignedRequest(accessToken, projectId, file)
  try {
    return await withUploadRegistrationRetries(() =>
      createProjectFileMetadataRequest(accessToken, projectId, {
        ...metadata,
        storagePath: upload.objectKey,
      })
    )
  } catch (error) {
    if (isRetryableUploadRegistrationError(error)) {
      throw error
    }
    try {
      await abortProjectFileUploadRequest(accessToken, projectId, upload.objectKey)
    } catch {
      // Compensacion best-effort: media owns cleanup for unregistered uploads.
    }
    throw error
  }
}

export async function deleteProjectFileRequest(
  accessToken: string,
  fileId: string
): Promise<DataResponse<{ id: string }>> {
  return api.delete(FILE_ROUTES.delete(fileId), { headers: bearer(accessToken) }).json<DataResponse<{ id: string }>>()
}

/** Descarga vía cliente `api` (ky): reintenta tras 401 con refresh. No usar `fetch()` directo. */
export async function downloadProjectFileBlobRequest(
  accessToken: string,
  fileId: string,
  preview = false
): Promise<Blob> {
  return api
    .get(FILE_ROUTES.download(fileId), {
      headers: bearer(accessToken),
      searchParams: preview ? { preview: 'true' } : undefined,
    })
    .blob()
}

export async function getProjectFileAccessRequest(
  accessToken: string,
  fileId: string,
  preview = false
): Promise<DataResponse<{ url: string; expiresInSeconds: number }>> {
  const searchParams = preview ? { preview: 'true' } : undefined
  return api
    .get(FILE_ROUTES.access(fileId), { headers: bearer(accessToken), searchParams })
    .json<DataResponse<{ url: string; expiresInSeconds: number }>>()
}

export async function updateProjectFileRequest(
  accessToken: string,
  fileId: string,
  body: { title?: string; description?: string | null; task_id?: string | null; is_client_visible?: boolean }
): Promise<DataResponse<ProjectFileEnriched>> {
  return api
    .patch(FILE_ROUTES.update(fileId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectFileEnriched>>()
}

export async function createMinorChangeRequestRequest(
  accessToken: string,
  projectId: string,
  body: { task_id: string; title: string; description: string }
): Promise<DataResponse<ProjectChangeRequest>> {
  return api
    .post(PROJECT_ROUTES.changeRequestMinor(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectChangeRequest>>()
}

export async function createFormalChangeRequestRequest(
  accessToken: string,
  projectId: string,
  body: { task_id?: string; title: string; description: string; justification: string }
): Promise<DataResponse<ProjectChangeRequest>> {
  return api
    .post(PROJECT_ROUTES.changeRequestFormal(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectChangeRequest>>()
}

export async function resolveChangeRequestRequest(
  accessToken: string,
  projectId: string,
  changeRequestId: string,
  body: { status: 'accepted' | 'rejected' | 'escalated' | 'approved' }
): Promise<DataResponse<ProjectChangeRequest>> {
  return api
    .patch(PROJECT_ROUTES.changeRequest(projectId, changeRequestId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectChangeRequest>>()
}

export async function listFormalChangeLogRequest(
  accessToken: string,
  projectId: string,
  params?: { page?: number; limit?: number }
): Promise<DataResponse<PaginatedData<{ id: string; description: string; createdAt: string }>>> {
  const searchParams: Record<string, string> = {}
  if (params?.page != null) searchParams.page = String(params.page)
  if (params?.limit != null) searchParams.limit = String(params.limit)
  return api
    .get(PROJECT_ROUTES.changeLogFormal(projectId), { headers: bearer(accessToken), searchParams })
    .json<DataResponse<PaginatedData<{ id: string; description: string; createdAt: string }>>>()
}
