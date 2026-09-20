import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { PROJECT_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  DataResponse,
  PaginatedData,
  ProjectChangeRequest,
} from '@/features/collab/model'
import type { AdminPendingChangeRequestItem } from '@/features/overview/model/overview.types'

export async function listProjectChangeRequestsRequest(
  accessToken: string,
  projectId: string,
  params?: { type?: 'minor' | 'formal'; status?: string }
): Promise<DataResponse<ProjectChangeRequest[]>> {
  const searchParams: Record<string, string> = {}
  if (params?.type) searchParams.type = params.type
  if (params?.status) searchParams.status = params.status
  return api
    .get(PROJECT_ROUTES.changeRequests(projectId), { headers: bearer(accessToken), searchParams })
    .json<DataResponse<ProjectChangeRequest[]>>()
}

export async function createMinorChangeRequestRequest(
  accessToken: string,
  projectId: string,
  body: { task_id?: string; title: string; description: string; priority?: 'low' | 'medium' | 'high' | 'urgent' }
): Promise<DataResponse<ProjectChangeRequest>> {
  return api
    .post(PROJECT_ROUTES.changeRequestMinor(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectChangeRequest>>()
}

export async function createFormalChangeRequestRequest(
  accessToken: string,
  projectId: string,
  body: { task_id?: string; title: string; description: string; justification?: string; priority?: 'low' | 'medium' | 'high' | 'urgent' }
): Promise<DataResponse<ProjectChangeRequest>> {
  return api
    .post(PROJECT_ROUTES.changeRequestFormal(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectChangeRequest>>()
}

export async function resolveChangeRequestRequest(
  accessToken: string,
  projectId: string,
  changeRequestId: string,
  body: { status: 'accepted' | 'rejected' | 'escalated' | 'approved'; comment?: string }
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

export async function listPendingChangeRequestsRequest(
  accessToken: string,
): Promise<DataResponse<AdminPendingChangeRequestItem[]>> {
  return api
    .get(PROJECT_ROUTES.pendingChangeRequests, { headers: bearer(accessToken) })
    .json<DataResponse<AdminPendingChangeRequestItem[]>>()
}
