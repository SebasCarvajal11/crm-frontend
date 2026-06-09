/**
 * Llamadas HTTP solo al API Gateway. URLs orientadas a features, no a microservicios.
 * Los endpoints publicos de auth (login, refresh, forgot-password, etc.) mantienen /auth/.
 * Los endpoints autenticados usan /identity/, /account/, /admin/.
 */
import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { AUTH_ROUTES, IDENTITY_ROUTES, ACCOUNT_ROUTES, ADMIN_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  AcceptInviteResponse,
  AdminUsersListResponse,
  ForgotPasswordResponse,
  InviteClientResponse,
  InviteAdminResponse,
  InvitePreviewResponse,
  LoginResponse,
  MeResponse,
  MessageResponse,
  RegisterWorkerResponse,
  SessionsResponse,
  UserRole,
} from '@/features/auth/model'
import type { ClientSearchResult } from '@/shared/types'

// ── Auth publico (sin cambios — URLs genericas) ──────────────────────────────

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  return api
    .post(AUTH_ROUTES.login, {
      json: { email, password },
      timeout: 15_000,
    })
    .json<LoginResponse>()
}

export async function forgotPasswordRequest(body: {
  email: string
}): Promise<ForgotPasswordResponse> {
  return api.post(AUTH_ROUTES.forgotPassword, { json: body }).json<ForgotPasswordResponse>()
}

export async function resetPasswordRequest(body: {
  token: string
  password: string
}): Promise<MessageResponse> {
  return api.post(AUTH_ROUTES.resetPassword, { json: body }).json<MessageResponse>()
}

export async function getInvitationPreviewRequest(
  token: string
): Promise<InvitePreviewResponse> {
  return api.get(AUTH_ROUTES.acceptInviteToken(token)).json<InvitePreviewResponse>()
}

export async function acceptInviteRequest(body: {
  token: string
  password: string
}): Promise<AcceptInviteResponse> {
  return api.post(AUTH_ROUTES.acceptInvite, { json: body }).json<AcceptInviteResponse>()
}

export async function verifyEmailRequest(body: {
  token: string
}): Promise<MessageResponse> {
  return api.post(AUTH_ROUTES.verifyEmail, { json: body }).json<MessageResponse>()
}

// ── Identidad (/identity/) ───────────────────────────────────────────────────

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  return api
    .get(IDENTITY_ROUTES.me, {
      headers: bearer(accessToken),
    })
    .json<MeResponse>()
}

export async function logoutRequest(accessToken: string): Promise<void> {
  await api.post(IDENTITY_ROUTES.logout, {
    headers: bearer(accessToken),
  })
}

export async function searchClientsRequest(
  accessToken: string,
  q: string,
  role: UserRole = 'client'
): Promise<{ data: ClientSearchResult[] }> {
  return api
    .get(IDENTITY_ROUTES.search, {
      headers: bearer(accessToken),
      searchParams: { q, role },
    })
    .json<{ data: ClientSearchResult[] }>()
}

// ── Cuenta (/account/) ──────────────────────────────────────────────────────

export async function changePasswordRequest(
  accessToken: string,
  body: { old_password: string; new_password: string }
): Promise<MessageResponse> {
  return api
    .post(ACCOUNT_ROUTES.password, {
      headers: bearer(accessToken),
      json: body,
    })
    .json<MessageResponse>()
}

export async function listSessionsRequest(
  accessToken: string
): Promise<SessionsResponse> {
  return api
    .get(ACCOUNT_ROUTES.sessions, {
      headers: bearer(accessToken),
    })
    .json<SessionsResponse>()
}

export async function revokeSessionRequest(
  accessToken: string,
  familyId: string
): Promise<MessageResponse> {
  return api
    .delete(ACCOUNT_ROUTES.session(familyId), {
      headers: bearer(accessToken),
    })
    .json<MessageResponse>()
}

export async function requestEmailVerificationRequest(
  accessToken: string
): Promise<MessageResponse> {
  return api
    .post(ACCOUNT_ROUTES.verifyEmailRequest, {
      headers: bearer(accessToken),
    })
    .json<MessageResponse>()
}

// ── Admin (/admin/) ─────────────────────────────────────────────────────────

export async function registerWorkerRequest(
  accessToken: string,
  body: { email: string; first_name: string; last_name: string; profession: string }
): Promise<RegisterWorkerResponse> {
  return api
    .post(ADMIN_ROUTES.workers, {
      headers: bearer(accessToken),
      json: body,
    })
    .json<RegisterWorkerResponse>()
}

export async function inviteClientRequest(
  accessToken: string,
  body: {
    email: string
    first_name: string
    last_name: string
    client_kind: 'natural' | 'juridical'
    company_name?: string
  }
): Promise<InviteClientResponse> {
  return api
    .post(ADMIN_ROUTES.clientsInvite, {
      headers: bearer(accessToken),
      json: body,
    })
    .json<InviteClientResponse>()
}

export async function inviteAdminRequest(
  accessToken: string,
  body: {
    email: string
    first_name: string
    last_name: string
    secret_password: string
  }
): Promise<InviteAdminResponse> {
  return api
    .post(ADMIN_ROUTES.adminsInvite, {
      headers: bearer(accessToken),
      json: body,
    })
    .json<InviteAdminResponse>()
}

export type AdminListUsersParams = {
  page?: number
  limit?: number
  role?: UserRole
  include_deleted?: boolean
  q?: string
}

export async function adminListUsersRequest(
  accessToken: string,
  params: AdminListUsersParams
): Promise<AdminUsersListResponse> {
  const searchParams: Record<string, string> = {}
  if (params.page != null) searchParams.page = String(params.page)
  if (params.limit != null) searchParams.limit = String(params.limit)
  if (params.role) searchParams.role = params.role
  if (params.include_deleted === true) searchParams.include_deleted = 'true'
  if (params.q?.trim()) searchParams.q = params.q.trim()

  return api
    .get(ADMIN_ROUTES.users, {
      headers: bearer(accessToken),
      searchParams,
    })
    .json<AdminUsersListResponse>()
}

export async function adminPatchUserStatusRequest(
  accessToken: string,
  subject: string,
  body: { is_active: boolean }
): Promise<MessageResponse> {
  return api
    .patch(ADMIN_ROUTES.userStatus(subject), {
      headers: bearer(accessToken),
      json: body,
    })
    .json<MessageResponse>()
}

export async function adminPatchUserFlagsRequest(
  accessToken: string,
  subject: string,
  body: { force_password_change: boolean }
): Promise<MessageResponse> {
  return api
    .patch(ADMIN_ROUTES.userFlags(subject), {
      headers: bearer(accessToken),
      json: body,
    })
    .json<MessageResponse>()
}

export async function adminRestoreUserRequest(
  accessToken: string,
  subject: string
): Promise<MessageResponse> {
  return api
    .post(ADMIN_ROUTES.userRestore(subject), {
      headers: bearer(accessToken),
    })
    .json<MessageResponse>()
}

export async function adminSoftDeleteUserRequest(
  accessToken: string,
  subject: string
): Promise<MessageResponse> {
  return api
    .delete(ADMIN_ROUTES.user(subject), {
      headers: bearer(accessToken),
    })
    .json<MessageResponse>()
}



export type { ClientSearchResult } from '@/shared/types'
