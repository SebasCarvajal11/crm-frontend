import { bearer } from '@/features/collab/api/collab-api.projects'
import { api } from '@/shared/lib'
import type { DashboardBffResponse } from '@/features/bff/model'
import { dashboardBffResponseSchema } from '@/features/bff/model'

/** Normaliza la agrupación BFF de KrakenD (`identity` + `projects`). */
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

function normalizeDashboardBffPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const root = raw as Record<string, unknown>
  return {
    ...root,
    projects: { data: extractProjectListItems(root.projects) },
  }
}

/** Obtiene identidad + proyectos en una sola llamada al gateway. */
export async function fetchDashboardBff(
  accessToken?: string
): Promise<DashboardBffResponse> {
  const payload = await api
    .get('bff/dashboard', { headers: bearer(accessToken) })
    .json<unknown>()

  const parsed = dashboardBffResponseSchema.safeParse(normalizeDashboardBffPayload(payload))
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Respuesta invalida de /bff/dashboard: ${detail}`)
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


