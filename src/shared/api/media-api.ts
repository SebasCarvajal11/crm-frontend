import { api } from '@/shared/lib/api-client'
import { bearer } from '@/shared/lib/bearer'
import { MEDIA_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  AvatarPresetResponse,
  CurrentAvatarResponse,
  UserAvatarsResponse,
} from '@/shared/types'

export type {
  AvatarPresetResponse,
  CurrentAvatarResponse,
  UserAvatarsResponse,
}

export async function setAvatarPresetRequest(
  accessToken: string,
  body: { avatarId: number; color: string }
): Promise<AvatarPresetResponse> {
  return api
    .post(MEDIA_ROUTES.avatarsPreset, {
      headers: bearer(accessToken),
      json: body,
    })
    .json<AvatarPresetResponse>()
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
