import { fetchMe } from '@/features/auth/api'
import { listProjectsRequest } from '@/features/collab/api'
import type { DashboardCompositionResponse } from '@/features/composition/model'
import { dashboardCompositionResponseSchema } from '@/features/composition/model'

/** Normaliza la agrupación de composición (`identity` + `projects`). */
function extractProjectListItems(projects: unknown): unknown[] {
  if (projects == null) return []
  if (Array.isArray(projects)) return projects
  if (typeof projects !== 'object') return []

  const projectsObj = projects as Record<string, unknown>
  if (Array.isArray(projectsObj.data)) return projectsObj.data

  const data = projectsObj.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = data as { items?: unknown }
    if (Array.isArray(nested.items)) return nested.items
  }
  if (Array.isArray(projectsObj.items)) return projectsObj.items

  return []
}

function normalizeDashboardCompositionPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const root = raw as Record<string, unknown>
  return {
    ...root,
    projects: { data: extractProjectListItems(root.projects) },
  }
}

/** Obtiene identidad + proyectos realizando llamadas en paralelo a través del API Gateway. */
export async function fetchDashboardComposition(
  accessToken?: string
): Promise<DashboardCompositionResponse> {
  if (!accessToken) {
    throw new Error('Access token is required')
  }

  const [meRes, projectsRes] = await Promise.all([
    fetchMe(accessToken),
    listProjectsRequest(accessToken, { page: 1, limit: 100 }),
  ])

  const payload = {
    identity: meRes.data,
    projects: projectsRes.data,
  }

  const parsed = dashboardCompositionResponseSchema.safeParse(normalizeDashboardCompositionPayload(payload))
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Respuesta compuesta invalida: ${detail}`)
  }

  const identity = parsed.data.identity
  return {
    identity: {
      email: identity.email,
      role: identity.role,
      id: identity.id,
      first_name: identity.first_name ?? null,
      last_name: identity.last_name ?? null,
      client_kind: identity.client_kind ?? null,
      company_name: identity.company_name ?? null,
      profession: identity.profession ?? null,
      emailVerifiedAt: identity.emailVerifiedAt ?? null,
      force_password_change: identity.force_password_change,
    },
    projects: {
      data: parsed.data.projects.data ?? [],
    },
  }
}
