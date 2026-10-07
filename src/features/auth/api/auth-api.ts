/**
 * Llamadas HTTP solo al API Gateway. URLs orientadas a features, no a microservicios.
 * Los endpoints publicos de auth (login, refresh, forgot-password, etc.) mantienen /auth/.
 * Los endpoints autenticados usan /identity/, /account/, /admin/.
 */
import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { AUTH_ROUTES, IDENTITY_ROUTES, ACCOUNT_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  AcceptInviteResponse,
  ForgotPasswordResponse,
  InvitePreviewResponse,
  LoginResponse,
  MeResponse,
  MessageResponse,
  SessionsResponse,
  UserRole,
} from '@/features/auth/model'
import type { ClientSearchResult } from '@/shared/types'

// ── Auth publico (sin cambios — URLs genericas) ──────────────────────────────

export async function loginRequest(
  email: string,
  password: string,
  rememberMe = false
): Promise<LoginResponse> {
  return api
    .post(AUTH_ROUTES.login, {
      json: { email, password, rememberMe, remember_me: rememberMe },
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
  terms_accepted?: boolean
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

