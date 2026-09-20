import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { PROJECT_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  DataResponse,
  PaginatedData,
  Project,
  ProjectMember,
  ProjectBrief,
  ProjectBoardResponse,
  ProjectListItem,
  ProjectSearchResult,
  ProjectWorkspaceResponse,
} from '@/features/collab/model'

export { bearer }
export * from './collab-api.contracts'
export * from './collab-api.files'
export * from './collab-api.changes'

export async function listProjectsRequest(
  accessToken: string,
  params?: { page?: number; limit?: number; type?: Project['type']; status?: Project['status'] }
): Promise<DataResponse<PaginatedData<ProjectListItem>>> {
  const searchParams: Record<string, string> = {}
  if (params?.page != null) searchParams.page = String(params.page)
  if (params?.limit != null) searchParams.limit = String(params.limit)
  if (params?.type) searchParams.type = params.type
  if (params?.status) searchParams.status = params.status
  return api
    .get(PROJECT_ROUTES.list, { headers: bearer(accessToken), searchParams })
    .json<DataResponse<PaginatedData<ProjectListItem>>>()
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
    file_repository_url?: string | null
  }
): Promise<DataResponse<Project>> {
  return api
    .patch(PROJECT_ROUTES.update(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<Project>>()
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
    file_repository_url?: string
  }
): Promise<DataResponse<Project>> {
  return api
    .post(PROJECT_ROUTES.create, { headers: bearer(accessToken), json: body })
    .json<DataResponse<Project>>()
}

export async function getProjectWorkspaceRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectWorkspaceResponse>> {
  return api
    .get(PROJECT_ROUTES.workspace(projectId), { headers: bearer(accessToken) })
    .json<DataResponse<ProjectWorkspaceResponse>>()
}

export async function getProjectBoardRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectBoardResponse>> {
  return api
    .get(PROJECT_ROUTES.board(projectId), { headers: bearer(accessToken) })
    .json<DataResponse<ProjectBoardResponse>>()
}

export async function getProjectBriefRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectBrief | null>> {
  return api
    .get(PROJECT_ROUTES.brief(projectId), { headers: bearer(accessToken) })
    .json<DataResponse<ProjectBrief | null>>()
}

export const getBriefRequest = getProjectBriefRequest

export async function updateProjectBriefRequest(
  accessToken: string,
  projectId: string,
  body: { body: string }
): Promise<DataResponse<ProjectBrief>> {
  return api
    .patch(PROJECT_ROUTES.brief(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectBrief>>()
}

export async function upsertProjectMemberRequest(
  accessToken: string,
  projectId: string,
  body: { user_sub: string; role: 'admin' | 'worker' | 'client'; user_email?: string }
): Promise<DataResponse<ProjectMember>> {
  return api
    .put(PROJECT_ROUTES.members(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectMember>>()
}

export async function listProjectMembersRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectMember[]>> {
  return api
    .get(PROJECT_ROUTES.members(projectId), { headers: bearer(accessToken) })
    .json<DataResponse<ProjectMember[]>>()
}

export async function searchProjectsRequest(
  accessToken: string,
  query: string | { q: string; limit?: number }
): Promise<{ data: ProjectSearchResult[] }> {
  const searchParams =
    typeof query === 'string'
      ? { q: query }
      : { q: query.q, ...(query.limit ? { limit: query.limit } : {}) }
  return api
    .get(PROJECT_ROUTES.search, {
      headers: bearer(accessToken),
      searchParams,
    })
    .json<{ data: ProjectSearchResult[] }>()
}

