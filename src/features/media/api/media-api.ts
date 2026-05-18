import { api } from '@/shared/lib'
import type {
  AvatarUploadResponse,
  CurrentAvatarResponse,
  DocumentUploadResponse,
  UserAvatarsResponse,
} from '@/shared/types'
import { putFileToPresignedUrl } from './presigned-upload'

type DocumentUploadUrlResponse = {
  data: {
    uploadUrl: string
    objectKey: string
    expiresInSeconds: number
  }
}

function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}

export type {
  AvatarUploadResponse,
  CurrentAvatarResponse,
  DocumentUploadResponse,
  UserAvatarsResponse,
}

export async function uploadAvatarRequest(accessToken: string, file: File): Promise<AvatarUploadResponse> {
  const form = new FormData()
  form.append('file', file)

  return api
    .post('media/avatars', {
      headers: bearer(accessToken),
      body: form,
    })
    .json<AvatarUploadResponse>()
}

export async function getCurrentAvatarRequest(accessToken: string): Promise<CurrentAvatarResponse> {
  return api
    .get('media/avatars/current', {
      headers: bearer(accessToken),
    })
    .json<CurrentAvatarResponse>()
}

/** Sin avatar configurado: mod-media responde 404; el UI usa iniciales (sin error en consola). */
export async function getCurrentAvatarRequestOptional(
  accessToken: string,
): Promise<CurrentAvatarResponse | null> {
  const response = await api.get('media/avatars/current', {
    headers: bearer(accessToken),
    throwHttpErrors: false,
  })
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`No se pudo obtener el avatar actual (${response.status})`)
  }
  return response.json<CurrentAvatarResponse>()
}

export async function getUserAvatarsRequest(accessToken: string, userIds: string[]): Promise<UserAvatarsResponse> {
  return api
    .get('media/avatars/users', {
      headers: bearer(accessToken),
      searchParams: { ids: userIds.join(',') },
    })
    .json<UserAvatarsResponse>()
}

/** Flujo PAR: upload-url → PUT a OCI → confirm. */
export async function uploadDocumentRequest(accessToken: string, file: File): Promise<DocumentUploadResponse> {
  const mimeType = file.type || 'application/octet-stream'

  const urlStep = await api
    .post('media/documents/upload-url', {
      headers: bearer(accessToken),
      json: {
        fileName: file.name,
        mimeType,
        sizeBytes: file.size,
      },
    })
    .json<DocumentUploadUrlResponse>()

  await putFileToPresignedUrl(urlStep.data.uploadUrl, file, mimeType)

  return api
    .post('media/documents/confirm', {
      headers: bearer(accessToken),
      json: {
        objectKey: urlStep.data.objectKey,
        fileName: file.name,
        mimeType,
        sizeBytes: file.size,
      },
    })
    .json<DocumentUploadResponse>()
}
