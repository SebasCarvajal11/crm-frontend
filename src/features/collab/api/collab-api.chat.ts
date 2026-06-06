import { api } from '@/shared/lib'
import { PROJECT_ROUTES } from '@/shared/lib/gateway-routes'
import { bearer } from './collab-api.projects'
import type { DataResponse, PaginatedData, ProjectChatMessage } from '@/features/collab/model'

export async function listExternalChatRequest(
  accessToken: string,
  projectId: string,
  params?: { page?: number; limit?: number }
): Promise<DataResponse<PaginatedData<ProjectChatMessage>>> {
  const searchParams: Record<string, string> = {}
  if (params?.page != null) searchParams.page = String(params.page)
  if (params?.limit != null) searchParams.limit = String(params.limit)

  return api
    .get(PROJECT_ROUTES.chatExternal(projectId), { headers: bearer(accessToken), searchParams })
    .json<DataResponse<PaginatedData<ProjectChatMessage>>>()
}

export async function postExternalChatRequest(
  accessToken: string,
  projectId: string,
  body: { body: string; mentions?: string[] }
): Promise<DataResponse<ProjectChatMessage>> {
  return api
    .post(PROJECT_ROUTES.chatExternal(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectChatMessage>>()
}

export async function listInternalChatRequest(
  accessToken: string,
  projectId: string,
  params?: { page?: number; limit?: number }
): Promise<DataResponse<PaginatedData<ProjectChatMessage>>> {
  const searchParams: Record<string, string> = {}
  if (params?.page != null) searchParams.page = String(params.page)
  if (params?.limit != null) searchParams.limit = String(params.limit)

  return api
    .get(PROJECT_ROUTES.chatInternal(projectId), { headers: bearer(accessToken), searchParams })
    .json<DataResponse<PaginatedData<ProjectChatMessage>>>()
}

export async function postInternalChatRequest(
  accessToken: string,
  projectId: string,
  body: { body: string; mentions?: string[] }
): Promise<DataResponse<ProjectChatMessage>> {
  return api
    .post(PROJECT_ROUTES.chatInternal(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectChatMessage>>()
}

export async function markExternalChatReadRequest(
  accessToken: string,
  projectId: string,
  body: { up_to_message_id?: string; message_ids?: string[] }
) {
  return api
    .post(PROJECT_ROUTES.chatExternalRead(projectId), { headers: bearer(accessToken), json: body })
    .json()
}

export async function markInternalChatReadRequest(
  accessToken: string,
  projectId: string,
  body: { up_to_message_id?: string; message_ids?: string[] }
) {
  return api
    .post(PROJECT_ROUTES.chatInternalRead(projectId), { headers: bearer(accessToken), json: body })
    .json()
}
