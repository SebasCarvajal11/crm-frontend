import { api } from '@/shared/lib/api-client'
import { bearer } from '@/shared/lib/bearer'
import { MEDIA_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  AvatarUploadResponse,
  CurrentAvatarResponse,
  UserAvatarsResponse,
} from '@/shared/types'

export type {
  AvatarUploadResponse,
  CurrentAvatarResponse,
  UserAvatarsResponse,
}

export async function uploadAvatarRequest(accessToken: string, file: File): Promise<AvatarUploadResponse> {
  const form = new FormData()
  form.append('file', file)

  return api
    .post(MEDIA_ROUTES.avatars, {
      headers: bearer(accessToken),
      body: form,
    })
    .json<AvatarUploadResponse>()
}

export async function getCurrentAvatarRequest(accessToken: string): Promise<CurrentAvatarResponse> {
  return api
    .get(MEDIA_ROUTES.avatarsCurrent, {
      headers: bearer(accessToken),
    })
    .json<CurrentAvatarResponse>()
}

export async function getCurrentAvatarRequestOptional(
  accessToken: string,
): Promise<CurrentAvatarResponse | null> {
  const response = await api.get(MEDIA_ROUTES.avatarsCurrent, {
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
    .get(MEDIA_ROUTES.avatarsUsers, {
      headers: bearer(accessToken),
      searchParams: { ids: userIds.join(',') },
    })
    .json<UserAvatarsResponse>()
}
